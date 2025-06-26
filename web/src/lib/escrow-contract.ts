import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";

// Your deployed program ID
export const PROGRAM_ID = new PublicKey("5bCqmbtwBZSvorHtu8PtsFPWoL1drC8Ps7vD5DgwqPPa");

// Your authority wallet (from the smart contract)
export const MARKETPLACE_AUTHORITY = new PublicKey("57CEpYPybCqQiLmvS5oUUZbdUVrvYtaYPJW24SgyEcuT");
export const MARKETPLACE_FEE_WALLET = new PublicKey("57CEpYPybCqQiLmvS5oUUZbdUVrvYtaYPJW24SgyEcuT");

// Connection to devnet
export const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// For now, we'll use a simplified approach without complex IDL
// This creates basic SOL transfer transactions as placeholders
// In production, you'd build proper program instructions

export interface EscrowParams {
  buyerWallet: string;
  sellerWallet: string;
  amount: number; // in SOL
  feeBasisPoints?: number; // default 250 (2.5%)
}

export interface EscrowResult {
  transactionSeed: string;
  escrowPDA: string;
  transaction: Transaction;
  escrowId: string;
}

// Generate a unique transaction seed
export function generateTransactionSeed(): BN {
  return new BN(Date.now() + Math.floor(Math.random() * 1000000));
}

// Derive escrow PDA from transaction seed
export function deriveEscrowPDA(transactionSeed: BN): [PublicKey, number] {
  const seedBuffer = transactionSeed.toArrayLike(Buffer, "le", 8);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), seedBuffer],
    PROGRAM_ID
  );
}

// Create escrow initialization transaction
export async function createEscrowTransaction(params: EscrowParams): Promise<EscrowResult> {
  const { buyerWallet, sellerWallet, amount, feeBasisPoints = 250 } = params;
  
  const buyer = new PublicKey(buyerWallet);
  const seller = new PublicKey(sellerWallet);
  const amountLamports = Math.floor(amount * LAMPORTS_PER_SOL);
  
  // Generate transaction seed and derive PDA
  const transactionSeed = generateTransactionSeed();
  const [escrowPDA, bump] = deriveEscrowPDA(transactionSeed);
  
  // For now, create a simple SOL transfer to the escrow PDA as placeholder
  // In production, you'd build the actual program instruction
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: buyer,
      toPubkey: escrowPDA,
      lamports: amountLamports,
    })
  );
  
  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = buyer;
  
  return {
    transactionSeed: transactionSeed.toString(),
    escrowPDA: escrowPDA.toString(),
    transaction,
    escrowId: `${transactionSeed.toString()}_${Date.now()}`,
  };
}

// Create release funds transaction (authority only)
export async function createReleaseFundsTransaction(
  transactionSeed: string,
  sellerWallet: string
): Promise<Transaction> {
  const seedBN = new BN(transactionSeed);
  const [escrowPDA] = deriveEscrowPDA(seedBN);
  const seller = new PublicKey(sellerWallet);
  
  // For now, create a simple SOL transfer from escrow PDA to seller as placeholder
  // In production, you'd build the actual program instruction
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: escrowPDA,
      toPubkey: seller,
      lamports: 1000000, // 0.001 SOL placeholder
    })
  );
  
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = MARKETPLACE_AUTHORITY;
  
  return transaction;
}

// Create cancel escrow transaction (authority only)
export async function createCancelEscrowTransaction(
  transactionSeed: string,
  buyerWallet: string
): Promise<Transaction> {
  const seedBN = new BN(transactionSeed);
  const [escrowPDA] = deriveEscrowPDA(seedBN);
  const buyer = new PublicKey(buyerWallet);
  
  // For now, create a simple SOL transfer from escrow PDA to buyer as placeholder
  // In production, you'd build the actual program instruction
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: escrowPDA,
      toPubkey: buyer,
      lamports: 1000000, // 0.001 SOL placeholder
    })
  );
  
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = MARKETPLACE_AUTHORITY;
  
  return transaction;
}

// Get escrow account data
export async function getEscrowAccount(transactionSeed: string) {
  const seedBN = new BN(transactionSeed);
  const [escrowPDA] = deriveEscrowPDA(seedBN);
  
  try {
    const accountInfo = await connection.getAccountInfo(escrowPDA);
    if (!accountInfo) {
      return null;
    }
    
    // Parse the account data (simplified - you'd use proper deserialization in production)
    return {
      address: escrowPDA.toString(),
      data: accountInfo.data,
      lamports: accountInfo.lamports,
      exists: true,
    };
  } catch (error) {
    console.error("Error fetching escrow account:", error);
    return null;
  }
}

// Utility to convert transaction to base64 for client signing
export function serializeTransaction(transaction: Transaction): string {
  return transaction.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  }).toString("base64");
}
