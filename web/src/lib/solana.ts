import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

// Testnet connection
const connection = new Connection(
  "https://api.testnet.solana.com",
  "confirmed"
);

// Escrow service keypair (in a real app, this would be securely stored)
// For demo purposes, we're generating a new keypair but in production, you'd use a fixed keypair
const escrowKeypair = Keypair.generate();
export const ESCROW_PUBLIC_KEY = escrowKeypair.publicKey.toString();

/**
 * Create an escrow transaction for a marketplace purchase
 * @param buyerWallet Buyer's wallet address
 * @param sellerWallet Seller's wallet address
 * @param amount Amount in SOL
 * @returns Transaction details
 */
export async function createEscrowTransaction(
  buyerWallet: string,
  sellerWallet: string,
  amount: number
) {
  try {
    const buyerPublicKey = new PublicKey(buyerWallet);
    const amountLamports = amount * 1000000000; // Convert SOL to lamports (1 SOL = 10^9 lamports)

    // Create a transaction to transfer SOL from buyer to escrow
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: buyerPublicKey,
        toPubkey: escrowKeypair.publicKey,
        lamports: amountLamports,
      })
    );

    // Get the latest block hash to use in the transaction
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = buyerPublicKey;

    // Serialize the transaction for the client to sign
    const serializedTransaction = transaction
      .serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      })
      .toString("base64");

    return {
      serializedTransaction,
      escrowAccount: escrowKeypair.publicKey.toString(),
      amount: amount,
      buyer: buyerWallet,
      seller: sellerWallet,
    };
  } catch (error) {
    console.error("Error creating escrow transaction:", error);
    throw error;
  }
}

/**
 * Release funds from escrow to the seller
 * @param sellerWallet Seller's wallet address
 * @param amount Amount in SOL
 * @param escrowId Escrow ID (for tracking)
 * @returns Transaction details
 */
export async function releaseEscrowToSeller(
  sellerWallet: string,
  amount: number,
  escrowId: string
) {
  try {
    const sellerPublicKey = new PublicKey(sellerWallet);
    const amountLamports = amount * 1000000000;

    // Create a transaction to transfer SOL from escrow to seller
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: escrowKeypair.publicKey,
        toPubkey: sellerPublicKey,
        lamports: amountLamports,
      })
    );

    // Get the latest block hash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = escrowKeypair.publicKey;

    // Sign the transaction with the escrow keypair
    transaction.sign(escrowKeypair);

    // Send the transaction
    const signature = await sendAndConfirmTransaction(connection, transaction, [
      escrowKeypair,
    ]);

    return {
      transactionHash: signature,
      escrowAccount: escrowKeypair.publicKey.toString(),
      amount: amount,
      seller: sellerWallet,
      escrowId,
    };
  } catch (error) {
    console.error("Error releasing escrow to seller:", error);
    throw error;
  }
}

/**
 * Refund funds from escrow to the buyer
 * @param buyerWallet Buyer's wallet address
 * @param amount Amount in SOL
 * @param escrowId Escrow ID (for tracking)
 * @returns Transaction details
 */
export async function refundEscrowToBuyer(
  buyerWallet: string,
  amount: number,
  escrowId: string
) {
  try {
    const buyerPublicKey = new PublicKey(buyerWallet);
    const amountLamports = amount * 1000000000;

    // Create a transaction to transfer SOL from escrow to buyer
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: escrowKeypair.publicKey,
        toPubkey: buyerPublicKey,
        lamports: amountLamports,
      })
    );

    // Get the latest block hash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = escrowKeypair.publicKey;

    // Sign the transaction with the escrow keypair
    transaction.sign(escrowKeypair);

    // Send the transaction
    const signature = await sendAndConfirmTransaction(connection, transaction, [
      escrowKeypair,
    ]);

    return {
      transactionHash: signature,
      escrowAccount: escrowKeypair.publicKey.toString(),
      amount: amount,
      buyer: buyerWallet,
      escrowId,
    };
  } catch (error) {
    console.error("Error refunding escrow to buyer:", error);
    throw error;
  }
}

/**
 * Verify a Solana transaction
 * @param transactionHash Transaction hash to verify
 * @returns Transaction details
 */
export async function verifyTransaction(transactionHash: string) {
  try {
    const transaction = await connection.getTransaction(transactionHash);
    return transaction;
  } catch (error) {
    console.error("Error verifying transaction:", error);
    throw error;
  }
}
