use anchor_lang::prelude::*;
use anchor_lang::system_program::{Transfer, transfer};

// TODO: Replace with your actual Program ID after deployment
declare_id!("YourProgramIdGoesHere"); 

// TODO: Replace with your marketplace's fee collection wallet address
// This is a public key.
const MARKETPLACE_FEE_WALLET_PUBKEY_STR: &str = "ReplaceWithYourMarketplaceFeeWalletPubkey";

#[program]
pub mod solana_escrow_marketplace {
    use super::*;

    /// Initializes a new escrow.
    /// The buyer (signer) sends funds. A fee is transferred to the marketplace wallet,
    /// and the remaining amount is held in the escrow PDA for the seller.
    ///
    /// Accounts:
    /// 0. `[signer]` buyer: The account funding the escrow.
    /// 1. `[]` seller: The seller's public key.
    /// 2. `[]` marketplace_authority: The public key authorized to release or cancel the escrow.
    /// 3. `[writable]` escrow_state: The PDA account to be initialized for this escrow.
    /// 4. `[writable]` marketplace_fee_wallet: The account to receive the marketplace fee.
    /// 5. `[]` system_program: Solana's system program.
    ///
    /// Args:
    /// - transaction_seed: A unique u64 seed for this specific escrow instance. Your backend must generate this.
    /// - total_amount_to_escrow: Total lamports the buyer is sending for the transaction.
    /// - fee_basis_points: Fee expressed in basis points (e.g., 100 for 1%, so 100/10000).
    pub fn initialize_escrow(
        ctx: Context<InitializeEscrow>,
        transaction_seed: u64, 
        total_amount_to_escrow: u64, 
        fee_basis_points: u16, 
    ) -> Result<()> {
        // --- Validation ---
        require!(total_amount_to_escrow > 0, EscrowError::ZeroAmount);
        require!(fee_basis_points > 0 && fee_basis_points <= 10000, EscrowError::InvalidFeeBasisPoints);

        let escrow_state = &mut ctx.accounts.escrow_state;
        let buyer = &ctx.accounts.buyer;
        let seller = &ctx.accounts.seller; 
        let marketplace_authority = &ctx.accounts.marketplace_authority;

        // --- Fee Calculation ---
        // Using u128 for intermediate multiplication to prevent overflow with large amounts/fees.
        let fee_amount = (total_amount_to_escrow as u128 * fee_basis_points as u128 / 10000) as u64;
        require!(fee_amount > 0, EscrowError::FeeTooSmall); 
        require!(total_amount_to_escrow > fee_amount, EscrowError::AmountLessThanFee);
        
        let amount_for_seller = total_amount_to_escrow.checked_sub(fee_amount)
            .ok_or(EscrowError::ArithmeticOverflow)?;

        // --- SOL Transfers ---
        // 1. Transfer `total_amount_to_escrow` from buyer to the escrow_state PDA.
        let cpi_accounts_buyer_to_escrow = Transfer {
            from: buyer.to_account_info(),
            to: escrow_state.to_account_info(),
        };
        let cpi_program_buyer_to_escrow = ctx.accounts.system_program.to_account_info();
        let cpi_ctx_buyer_to_escrow = CpiContext::new(cpi_program_buyer_to_escrow, cpi_accounts_buyer_to_escrow);
        transfer(cpi_ctx_buyer_to_escrow, total_amount_to_escrow)?;

        // Reload escrow_state account info to get the new balance for PDA-signed transfer.
        // This is crucial as the PDA needs to have funds before it can send them.
        escrow_state.reload()?;

        // 2. Transfer `fee_amount` from escrow_state PDA to the marketplace_fee_wallet.
        let marketplace_fee_wallet_pubkey = MARKETPLACE_FEE_WALLET_PUBKEY_STR.parse::<Pubkey>()
            .map_err(|_| EscrowError::InvalidMarketplaceFeeWalletAddress)?;
        require_keys_eq!(ctx.accounts.marketplace_fee_wallet.key(), marketplace_fee_wallet_pubkey, EscrowError::IncorrectMarketplaceFeeWallet);

        let cpi_accounts_escrow_to_fee_wallet = Transfer {
            from: escrow_state.to_account_info(),
            to: ctx.accounts.marketplace_fee_wallet.to_account_info(),
        };
        
        // Seeds for PDA signing the transfer from itself.
        let bump_seed = escrow_state.bump; // The bump is already stored by `init`
        let seeds = &[
            b"escrow".as_ref(),
            &transaction_seed.to_le_bytes(),
            &[bump_seed],
        ];
        let signer_seeds = &[&seeds[..]];
        
        let cpi_program_escrow_to_fee_wallet = ctx.accounts.system_program.to_account_info();
        let cpi_ctx_escrow_to_fee_wallet = CpiContext::new_with_signer(
            cpi_program_escrow_to_fee_wallet,
            cpi_accounts_escrow_to_fee_wallet,
            signer_seeds
        );
        transfer(cpi_ctx_escrow_to_fee_wallet, fee_amount)?;
        
        // --- Populate Escrow State ---
        escrow_state.buyer = buyer.key();
        escrow_state.seller = seller.key();
        escrow_state.marketplace_authority = marketplace_authority.key();
        escrow_state.total_initial_amount = total_amount_to_escrow;
        escrow_state.fee_amount = fee_amount;
        escrow_state.amount_for_seller = amount_for_seller;
        escrow_state.stage = EscrowStage::Funded;
        escrow_state.is_initialized = true;
        // `escrow_state.bump` is automatically populated by Anchor's `init` constraint.

        msg!("Escrow initialized. Buyer: {}, Seller: {}, Authority: {}, Amount for Seller: {}, Fee: {}", 
            escrow_state.buyer, escrow_state.seller, escrow_state.marketplace_authority, 
            escrow_state.amount_for_seller, escrow_state.fee_amount);
        Ok(())
    }

    /// Releases funds from the escrow to the seller.
    /// Only callable by the `marketplace_authority` stored in the `escrow_state`.
    ///
    /// Accounts:
    /// 0. `[signer]` caller: Must be the `marketplace_authority`.
    /// 1. `[writable]` escrow_state: The escrow PDA holding funds and state.
    /// 2. `[writable]` seller_account_to_receive_funds: The seller's account (must match `escrow_state.seller`).
    /// 3. `[]` system_program: Solana's system program.
    ///
    /// Args:
    /// - transaction_seed: The unique u64 seed used to initialize this escrow.
    pub fn release_funds_to_seller(ctx: Context<ProcessEscrow>, transaction_seed: u64) -> Result<()> {
        let escrow_state = &mut ctx.accounts.escrow_state;
        let caller = &ctx.accounts.caller; 

        // --- Authorization & State Checks ---
        require_keys_eq!(caller.key(), escrow_state.marketplace_authority, EscrowError::Unauthorized);
        require!(escrow_state.is_initialized, EscrowError::NotInitialized);
        require!(escrow_state.stage == EscrowStage::Funded, EscrowError::AlreadyProcessedOrNotFunded);
        require_keys_eq!(ctx.accounts.recipient_account.key(), escrow_state.seller, EscrowError::RecipientNotSeller);

        let amount_to_transfer = escrow_state.amount_for_seller;
        require!(amount_to_transfer > 0, EscrowError::ZeroAmount); // Should be guaranteed by init logic

        // --- SOL Transfer: Escrow PDA to Seller ---
        let cpi_accounts = Transfer {
            from: escrow_state.to_account_info(),
            to: ctx.accounts.recipient_account.to_account_info(), 
        };
        let bump_seed = escrow_state.bump;
        let seeds = &[
            b"escrow".as_ref(),
            &transaction_seed.to_le_bytes(),
            &[bump_seed],
        ];
        let signer_seeds = &[&seeds[..]];
        let cpi_program = ctx.accounts.system_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        transfer(cpi_ctx, amount_to_transfer)?;

        // --- Update State ---
        escrow_state.stage = EscrowStage::Released;
        msg!("Funds released to seller: {}. Amount: {}", escrow_state.seller, amount_to_transfer);

        // Optional: Close the escrow_state account to reclaim rent.
        // Rent lamports can be sent to the `caller` (marketplace_authority) or `escrow_state.buyer`.
        // For simplicity, sending to caller.
        // escrow_state.close(caller.to_account_info())?;
        // msg!("Escrow account closed, rent reclaimed by: {}", caller.key());
        Ok(())
    }

    /// Cancels the escrow and refunds the `amount_for_seller` to the buyer.
    /// The fee taken during initialization is NOT refunded by this function.
    /// Only callable by the `marketplace_authority` stored in the `escrow_state`.
    ///
    /// Accounts:
    /// 0. `[signer]` caller: Must be the `marketplace_authority`.
    /// 1. `[writable]` escrow_state: The escrow PDA holding funds and state.
    /// 2. `[writable]` buyer_account_to_receive_refund: The buyer's account (must match `escrow_state.buyer`).
    /// 3. `[]` system_program: Solana's system program.
    ///
    /// Args:
    /// - transaction_seed: The unique u64 seed used to initialize this escrow.
    pub fn cancel_escrow_and_refund_buyer(ctx: Context<ProcessEscrow>, transaction_seed: u64) -> Result<()> {
        let escrow_state = &mut ctx.accounts.escrow_state;
        let caller = &ctx.accounts.caller;

        // --- Authorization & State Checks ---
        require_keys_eq!(caller.key(), escrow_state.marketplace_authority, EscrowError::Unauthorized);
        require!(escrow_state.is_initialized, EscrowError::NotInitialized);
        require!(escrow_state.stage == EscrowStage::Funded, EscrowError::AlreadyProcessedOrNotFunded);
        require_keys_eq!(ctx.accounts.recipient_account.key(), escrow_state.buyer, EscrowError::RecipientNotBuyer);

        // Amount to refund to buyer is what was held for the seller (fee already taken).
        let amount_to_refund = escrow_state.amount_for_seller;
        require!(amount_to_refund > 0, EscrowError::ZeroAmount); 

        // --- SOL Transfer: Escrow PDA to Buyer ---
        let cpi_accounts = Transfer {
            from: escrow_state.to_account_info(),
            to: ctx.accounts.recipient_account.to_account_info(),
        };
        let bump_seed = escrow_state.bump;
        let seeds = &[
            b"escrow".as_ref(),
            &transaction_seed.to_le_bytes(),
            &[bump_seed],
        ];
        let signer_seeds = &[&seeds[..]];
        let cpi_program = ctx.accounts.system_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        transfer(cpi_ctx, amount_to_refund)?;

        // --- Update State ---
        escrow_state.stage = EscrowStage::Cancelled;
        msg!("Escrow cancelled, funds refunded to buyer: {}. Amount: {}", escrow_state.buyer, amount_to_refund);
        
        // Optional: Close the escrow_state account.
        // escrow_state.close(caller.to_account_info())?;
        // msg!("Escrow account closed, rent reclaimed by: {}", caller.key());
        Ok(())
    }
}

// --- Account Structs ---

#[derive(Accounts)]
#[instruction(transaction_seed: u64)] // transaction_seed is used for PDA derivation
pub struct InitializeEscrow<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    /// CHECK: Seller's main account. Stored in EscrowState. Not manipulated directly here.
    pub seller: AccountInfo<'info>,

    /// CHECK: Marketplace authority. Stored in EscrowState. Not manipulated directly here.
    pub marketplace_authority: AccountInfo<'info>,

    #[account(
        init,
        payer = buyer, // Buyer pays for PDA creation
        space = EscrowState::LEN,
        seeds = [b"escrow".as_ref(), transaction_seed.to_le_bytes().as_ref()],
        bump
    )]
    pub escrow_state: Account<'info, EscrowState>,

    /// CHECK: This is the hardcoded marketplace fee wallet.
    /// Constraint `marketplace_fee_wallet.key() == MARKETPLACE_FEE_WALLET_PUBKEY_STR.parse().unwrap()`
    /// is checked in the instruction logic for better error message.
    #[account(mut)]
    pub marketplace_fee_wallet: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(transaction_seed: u64)] // transaction_seed is used for PDA derivation
pub struct ProcessEscrow<'info> {
    #[account(mut)]
    pub caller: Signer<'info>, // Must be the marketplace_authority for the escrow

    #[account(
        mut,
        seeds = [b"escrow".as_ref(), transaction_seed.to_le_bytes().as_ref()],
        bump = escrow_state.bump, // Use the bump stored in the account
        // has_one constraints can be useful but specific checks are in instruction logic
        // has_one = buyer @ EscrowError::InvalidBuyerForEscrowState, 
        // has_one = seller @ EscrowError::InvalidSellerForEscrowState,
    )]
    pub escrow_state: Account<'info, EscrowState>,
    
    /// CHECK: Recipient of funds.
    /// For `release_funds_to_seller`, this must be `escrow_state.seller`.
    /// For `cancel_escrow_and_refund_buyer`, this must be `escrow_state.buyer`.
    /// This is validated within the respective instruction logic.
    #[account(mut)]
    pub recipient_account: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}


// --- State Account ---

#[account]
pub struct EscrowState {
    pub buyer: Pubkey,                  // 32 bytes
    pub seller: Pubkey,                 // 32 bytes
    pub marketplace_authority: Pubkey,  // 32 bytes
    pub total_initial_amount: u64,      // 8 bytes (lamports buyer sent)
    pub fee_amount: u64,                // 8 bytes (lamports fee taken)
    pub amount_for_seller: u64,         // 8 bytes (lamports held for seller)
    pub stage: EscrowStage,             // 1 byte
    pub is_initialized: bool,           // 1 byte
    pub bump: u8,                       // 1 byte (PDA bump seed)
}

impl EscrowState {
    // Calculate space needed for the account:
    // 8 (Anchor discriminator) + 32*3 (Pubkeys) + 8*3 (u64 amounts) + 1 (enum EscrowStage) + 1 (bool) + 1 (u8 bump)
    const LEN: usize = 8 + (32 * 3) + (8 * 3) + 1 + 1 + 1;
}

// --- Enums & Errors ---

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Copy, Debug)]
pub enum EscrowStage {
    Funded,   // Escrow is active, funds held
    Released, // Funds released to seller
    Cancelled, // Funds returned to buyer (minus fee)
}

#[error_code]
pub enum EscrowError {
    #[msg("Amount must be greater than zero.")]
    ZeroAmount,
    #[msg("Fee basis points must be between 1 and 10000 (inclusive).")]
    InvalidFeeBasisPoints,
    #[msg("Calculated fee amount is zero. Ensure total amount and fee basis points are sufficient.")]
    FeeTooSmall,
    #[msg("Total amount must be greater than the calculated fee.")]
    AmountLessThanFee,
    #[msg("Arithmetic operation resulted in an overflow or underflow.")]
    ArithmeticOverflow,
    #[msg("Unauthorized: Caller is not the designated marketplace authority for this escrow.")]
    Unauthorized,
    #[msg("Escrow account is not initialized.")]
    NotInitialized,
    #[msg("Escrow has already been processed (released/cancelled) or is not in a funded state.")]
    AlreadyProcessedOrNotFunded,
    #[msg("The provided marketplace fee wallet public key does not match the expected one.")]
    IncorrectMarketplaceFeeWallet,
    #[msg("The hardcoded marketplace fee wallet address is invalid and cannot be parsed.")]
    InvalidMarketplaceFeeWalletAddress,
    #[msg("Recipient account for fund release is not the seller recorded in the escrow.")]
    RecipientNotSeller,
    #[msg("Recipient account for refund is not the buyer recorded in the escrow.")]
    RecipientNotBuyer,
    // #[msg("Invalid buyer pubkey associated with the escrow state.")]
    // InvalidBuyerForEscrowState, // Example for has_one if used
    // #[msg("Invalid seller pubkey associated with the escrow state.")]
    // InvalidSellerForEscrowState, // Example for has_one if used
}

