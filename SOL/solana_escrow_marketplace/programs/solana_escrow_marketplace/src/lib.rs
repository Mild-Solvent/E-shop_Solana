use anchor_lang::prelude::*;
use anchor_lang::system_program::{Transfer, transfer};

// Program ID - will be updated after deployment
declare_id!("5bCqmbtwBZSvorHtu8PtsFPWoL1drC8Ps7vD5DgwqPPa"); 

// YOUR PHANTOM WALLET ADDRESSES
// Authority wallet that controls the marketplace and escrow decisions
const MARKETPLACE_AUTHORITY_PUBKEY_STR: &str = "57CEpYPybCqQiLmvS5oUUZbdUVrvYtaYPJW24SgyEcuT";
// Fee collection wallet (same as authority)
const MARKETPLACE_FEE_WALLET_PUBKEY_STR: &str = "57CEpYPybCqQiLmvS5oUUZbdUVrvYtaYPJW24SgyEcuT";

#[program]
pub mod solana_escrow_marketplace {
    use super::*;

    /// Initializes a new escrow.
    /// The buyer deposits funds, marketplace takes a fee, rest is held for seller.
    /// Only the pre-defined marketplace authority can later release or cancel.
    pub fn initialize_escrow(
        ctx: Context<InitializeEscrow>,
        transaction_seed: u64, 
        total_amount_to_escrow: u64, 
        fee_basis_points: u16, 
    ) -> Result<()> {
        // --- Enhanced Validation ---
        require!(total_amount_to_escrow > 0, EscrowError::ZeroAmount);
        require!(fee_basis_points > 0 && fee_basis_points <= 1000, EscrowError::InvalidFeeBasisPoints); // Max 10%
        require!(total_amount_to_escrow >= 1_000_000, EscrowError::MinimumAmount); // Min 0.001 SOL

        let escrow_state = &mut ctx.accounts.escrow_state;
        let buyer = &ctx.accounts.buyer;
        let seller = &ctx.accounts.seller; 

        // --- Validate Authority ---
        let expected_authority = MARKETPLACE_AUTHORITY_PUBKEY_STR.parse::<Pubkey>()
            .map_err(|_| EscrowError::InvalidAuthorityAddress)?;
        require_keys_eq!(ctx.accounts.marketplace_authority.key(), expected_authority, EscrowError::UnauthorizedAuthority);

        // --- Fee Calculation with Safety ---
        let fee_amount = total_amount_to_escrow
            .checked_mul(fee_basis_points as u64)
            .and_then(|x| x.checked_div(10000))
            .ok_or(EscrowError::ArithmeticOverflow)?;
        
        require!(fee_amount > 0, EscrowError::FeeTooSmall); 
        require!(total_amount_to_escrow > fee_amount, EscrowError::AmountLessThanFee);
        
        let amount_for_seller = total_amount_to_escrow.checked_sub(fee_amount)
            .ok_or(EscrowError::ArithmeticOverflow)?;

        // --- Validate Minimum Net Amount ---
        require!(amount_for_seller >= 500_000, EscrowError::NetAmountTooSmall); // Min 0.0005 SOL after fee

        // --- SOL Transfers ---
        // 1. Transfer total amount from buyer to escrow PDA
        let cpi_accounts_buyer_to_escrow = Transfer {
            from: buyer.to_account_info(),
            to: escrow_state.to_account_info(),
        };
        let cpi_program_buyer_to_escrow = ctx.accounts.system_program.to_account_info();
        let cpi_ctx_buyer_to_escrow = CpiContext::new(cpi_program_buyer_to_escrow, cpi_accounts_buyer_to_escrow);
        transfer(cpi_ctx_buyer_to_escrow, total_amount_to_escrow)?;

        // Reload account to reflect new balance
        escrow_state.reload()?;

        // 2. Transfer fee from escrow PDA to marketplace fee wallet
        let marketplace_fee_wallet_pubkey = MARKETPLACE_FEE_WALLET_PUBKEY_STR.parse::<Pubkey>()
            .map_err(|_| EscrowError::InvalidFeeWalletAddress)?;
        require_keys_eq!(ctx.accounts.marketplace_fee_wallet.key(), marketplace_fee_wallet_pubkey, EscrowError::IncorrectFeeWallet);

        let cpi_accounts_escrow_to_fee = Transfer {
            from: escrow_state.to_account_info(),
            to: ctx.accounts.marketplace_fee_wallet.to_account_info(),
        };
        
        // PDA signing seeds
        let bump_seed = escrow_state.bump;
        let seeds = &[
            b"escrow".as_ref(),
            &transaction_seed.to_le_bytes(),
            &[bump_seed],
        ];
        let signer_seeds = &[&seeds[..]];
        
        let cpi_program_escrow_to_fee = ctx.accounts.system_program.to_account_info();
        let cpi_ctx_escrow_to_fee = CpiContext::new_with_signer(
            cpi_program_escrow_to_fee,
            cpi_accounts_escrow_to_fee,
            signer_seeds
        );
        transfer(cpi_ctx_escrow_to_fee, fee_amount)?;
        
        // --- Initialize Escrow State ---
        escrow_state.buyer = buyer.key();
        escrow_state.seller = seller.key();
        escrow_state.marketplace_authority = expected_authority;
        escrow_state.total_initial_amount = total_amount_to_escrow;
        escrow_state.fee_amount = fee_amount;
        escrow_state.amount_for_seller = amount_for_seller;
        escrow_state.stage = EscrowStage::Funded;
        escrow_state.is_initialized = true;
        escrow_state.created_at = Clock::get()?.unix_timestamp;

        emit!(EscrowCreated {
            escrow_id: escrow_state.key(),
            buyer: buyer.key(),
            seller: seller.key(),
            amount: amount_for_seller,
            fee: fee_amount,
            timestamp: escrow_state.created_at,
        });

        msg!("✅ Escrow initialized - Buyer: {}, Seller: {}, Amount: {}, Fee: {}", 
            escrow_state.buyer, escrow_state.seller, amount_for_seller, fee_amount);
        Ok(())
    }

    /// Releases funds to seller - only callable by marketplace authority
    pub fn release_funds_to_seller(ctx: Context<ProcessEscrow>, transaction_seed: u64) -> Result<()> {
        let escrow_state = &mut ctx.accounts.escrow_state;
        let caller = &ctx.accounts.caller; 

        // --- Strict Authorization ---
        let expected_authority = MARKETPLACE_AUTHORITY_PUBKEY_STR.parse::<Pubkey>()
            .map_err(|_| EscrowError::InvalidAuthorityAddress)?;
        require_keys_eq!(caller.key(), expected_authority, EscrowError::Unauthorized);
        require_keys_eq!(caller.key(), escrow_state.marketplace_authority, EscrowError::Unauthorized);

        // --- State Validation ---
        require!(escrow_state.is_initialized, EscrowError::NotInitialized);
        require!(escrow_state.stage == EscrowStage::Funded, EscrowError::AlreadyProcessedOrNotFunded);
        require_keys_eq!(ctx.accounts.recipient_account.key(), escrow_state.seller, EscrowError::RecipientNotSeller);

        let amount_to_transfer = escrow_state.amount_for_seller;
        require!(amount_to_transfer > 0, EscrowError::ZeroAmount);

        // --- Transfer to Seller ---
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
        escrow_state.completed_at = Clock::get()?.unix_timestamp;

        emit!(EscrowCompleted {
            escrow_id: escrow_state.key(),
            buyer: escrow_state.buyer,
            seller: escrow_state.seller,
            amount: amount_to_transfer,
            action: "released".to_string(),
            timestamp: escrow_state.completed_at,
        });

        msg!("✅ Funds released to seller: {} - Amount: {}", escrow_state.seller, amount_to_transfer);
        Ok(())
    }

    /// Cancels escrow and refunds buyer (minus fee) - only callable by marketplace authority
    pub fn cancel_escrow_and_refund_buyer(ctx: Context<ProcessEscrow>, transaction_seed: u64) -> Result<()> {
        let escrow_state = &mut ctx.accounts.escrow_state;
        let caller = &ctx.accounts.caller;

        // --- Strict Authorization ---
        let expected_authority = MARKETPLACE_AUTHORITY_PUBKEY_STR.parse::<Pubkey>()
            .map_err(|_| EscrowError::InvalidAuthorityAddress)?;
        require_keys_eq!(caller.key(), expected_authority, EscrowError::Unauthorized);
        require_keys_eq!(caller.key(), escrow_state.marketplace_authority, EscrowError::Unauthorized);

        // --- State Validation ---
        require!(escrow_state.is_initialized, EscrowError::NotInitialized);
        require!(escrow_state.stage == EscrowStage::Funded, EscrowError::AlreadyProcessedOrNotFunded);
        require_keys_eq!(ctx.accounts.recipient_account.key(), escrow_state.buyer, EscrowError::RecipientNotBuyer);

        let amount_to_refund = escrow_state.amount_for_seller; // Fee is NOT refunded
        require!(amount_to_refund > 0, EscrowError::ZeroAmount); 

        // --- Transfer to Buyer ---
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
        escrow_state.completed_at = Clock::get()?.unix_timestamp;

        emit!(EscrowCompleted {
            escrow_id: escrow_state.key(),
            buyer: escrow_state.buyer,
            seller: escrow_state.seller,
            amount: amount_to_refund,
            action: "cancelled".to_string(),
            timestamp: escrow_state.completed_at,
        });

        msg!("✅ Escrow cancelled, buyer refunded: {} - Amount: {} (Fee: {} kept)", 
            escrow_state.buyer, amount_to_refund, escrow_state.fee_amount);
        Ok(())
    }
}

// --- Account Structs ---

#[derive(Accounts)]
#[instruction(transaction_seed: u64)]
pub struct InitializeEscrow<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    /// CHECK: Seller's account - validated in instruction
    pub seller: AccountInfo<'info>,

    /// CHECK: Marketplace authority - validated against hardcoded address
    pub marketplace_authority: AccountInfo<'info>,

    #[account(
        init,
        payer = buyer,
        space = EscrowState::LEN,
        seeds = [b"escrow".as_ref(), transaction_seed.to_le_bytes().as_ref()],
        bump
    )]
    pub escrow_state: Account<'info, EscrowState>,

    /// CHECK: Marketplace fee wallet - validated against hardcoded address
    #[account(mut)]
    pub marketplace_fee_wallet: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(transaction_seed: u64)]
pub struct ProcessEscrow<'info> {
    #[account(mut)]
    pub caller: Signer<'info>,

    #[account(
        mut,
        seeds = [b"escrow".as_ref(), transaction_seed.to_le_bytes().as_ref()],
        bump = escrow_state.bump,
    )]
    pub escrow_state: Account<'info, EscrowState>,
    
    /// CHECK: Recipient account - validated in instruction logic
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
    pub total_initial_amount: u64,      // 8 bytes
    pub fee_amount: u64,                // 8 bytes
    pub amount_for_seller: u64,         // 8 bytes
    pub stage: EscrowStage,             // 1 byte
    pub is_initialized: bool,           // 1 byte
    pub bump: u8,                       // 1 byte
    pub created_at: i64,                // 8 bytes - timestamp
    pub completed_at: i64,              // 8 bytes - completion timestamp
}

impl EscrowState {
    // 8 (discriminator) + 32*3 (pubkeys) + 8*5 (u64s) + 1 (enum) + 1 (bool) + 1 (u8) + 8*2 (timestamps)
    const LEN: usize = 8 + (32 * 3) + (8 * 5) + 1 + 1 + 1 + (8 * 2);
}

// --- Events ---

#[event]
pub struct EscrowCreated {
    pub escrow_id: Pubkey,
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub amount: u64,
    pub fee: u64,
    pub timestamp: i64,
}

#[event]
pub struct EscrowCompleted {
    pub escrow_id: Pubkey,
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub amount: u64,
    pub action: String,
    pub timestamp: i64,
}

// --- Enums ---

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Copy, Debug)]
pub enum EscrowStage {
    Funded,     // Escrow active, funds held
    Released,   // Funds released to seller
    Cancelled,  // Funds returned to buyer (minus fee)
}

// --- Errors ---

#[error_code]
pub enum EscrowError {
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("Fee basis points must be between 1 and 1000 (max 10%)")]
    InvalidFeeBasisPoints,
    #[msg("Minimum escrow amount is 0.001 SOL")]
    MinimumAmount,
    #[msg("Net amount after fee must be at least 0.0005 SOL")]
    NetAmountTooSmall,
    #[msg("Fee amount is too small")]
    FeeTooSmall,
    #[msg("Total amount must be greater than fee")]
    AmountLessThanFee,
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
    #[msg("Unauthorized: Only marketplace authority can perform this action")]
    Unauthorized,
    #[msg("Unauthorized: Invalid authority address")]
    UnauthorizedAuthority,
    #[msg("Escrow not initialized")]
    NotInitialized,
    #[msg("Escrow already processed or not funded")]
    AlreadyProcessedOrNotFunded,
    #[msg("Invalid fee wallet address")]
    IncorrectFeeWallet,
    #[msg("Invalid fee wallet address format")]
    InvalidFeeWalletAddress,
    #[msg("Invalid authority address format")]
    InvalidAuthorityAddress,
    #[msg("Recipient is not the seller")]
    RecipientNotSeller,
    #[msg("Recipient is not the buyer")]
    RecipientNotBuyer,
}
