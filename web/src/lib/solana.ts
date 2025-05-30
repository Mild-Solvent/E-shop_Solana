import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
  sendAndConfirmTransaction,
  clusterApiUrl,
  TransactionInstruction,
} from "@solana/web3.js";

// Devnet connection
const connection = new Connection(clusterApiUrl("devnet"), {
  commitment: "confirmed",
  confirmTransactionInitialTimeout: 60000, // 60 seconds
});

// Export connection for use in other components
export const solanaConnection = connection;

// Escrow service keypair (in a real app, this would be securely stored)
// For demo purposes, we're generating a new keypair but in production, you'd use a fixed keypair
const escrowKeypair = Keypair.generate();
export const ESCROW_PUBLIC_KEY = escrowKeypair.publicKey.toString();

/**
 * Create a direct transaction between buyer and seller
 * @param buyerWallet Buyer's wallet address
 * @param sellerWallet Seller's wallet address
 * @param amount Amount in SOL
 * @returns Transaction details
 */
export async function createDirectTransaction(
  buyerWallet: string,
  sellerWallet: string,
  amount: number
) {
  try {
    const buyerPublicKey = new PublicKey(buyerWallet);
    const sellerPublicKey = new PublicKey(sellerWallet);
    const amountLamports = amount * 1000000000; // Convert SOL to lamports (1 SOL = 10^9 lamports)

    // Create a transaction to transfer SOL directly from buyer to seller
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: buyerPublicKey,
        toPubkey: sellerPublicKey,
        lamports: amountLamports,
      })
    );

    // Get the latest block hash to use in the transaction
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = buyerPublicKey;

    // Add a memo to identify the transaction
    const memo = `Marketplace purchase: ${Date.now()}`;

    // Serialize the transaction for the client to sign
    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    return {
      serializedTransaction: Buffer.from(serializedTransaction).toString(
        "base64"
      ),
      blockhash,
      lastValidBlockHeight,
      amount: amount,
      buyer: buyerWallet,
      seller: sellerWallet,
      memo,
    };
  } catch (error: any) {
    console.error("Error creating transaction:", error);
    throw new Error(
      `Failed to create transaction: ${error.message || String(error)}`
    );
  }
}

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
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = buyerPublicKey;

    // Serialize the transaction for the client to sign
    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    return {
      serializedTransaction: Buffer.from(serializedTransaction).toString(
        "base64"
      ),
      blockhash,
      lastValidBlockHeight,
      escrowAccount: escrowKeypair.publicKey.toString(),
      amount: amount,
      buyer: buyerWallet,
      seller: sellerWallet,
    };
  } catch (error: any) {
    console.error("Error creating escrow transaction:", error);
    throw new Error(
      `Failed to create escrow transaction: ${error.message || String(error)}`
    );
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
    const transaction = await connection.getTransaction(transactionHash, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    if (!transaction) {
      throw new Error(
        `Transaction ${transactionHash} not found on the blockchain`
      );
    }

    return transaction;
  } catch (error: any) {
    console.error("Error verifying transaction:", error);
    throw new Error(
      `Failed to verify transaction: ${error.message || String(error)}`
    );
  }
}

/**
 * Get the balance of a wallet
 * @param walletAddress Wallet address
 * @returns Balance in SOL
 */
export async function getWalletBalance(walletAddress: string) {
  try {
    const publicKey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(publicKey);
    return balance / 1000000000; // Convert lamports to SOL
  } catch (error: any) {
    console.error("Error getting wallet balance:", error);
    throw new Error(
      `Failed to get wallet balance: ${error.message || String(error)}`
    );
  }
}

/**
 * Request an airdrop of SOL for testing purposes
 * Only works on devnet/testnet
 * @param walletAddress Wallet address
 * @param amount Amount in SOL (max 2 SOL per request)
 * @returns Transaction signature
 */
export async function requestAirdrop(walletAddress: string, amount = 1) {
  try {
    const publicKey = new PublicKey(walletAddress);
    const lamports = amount * 1000000000; // Convert SOL to lamports
    const signature = await connection.requestAirdrop(publicKey, lamports);
    await connection.confirmTransaction(signature);
    return signature;
  } catch (error: any) {
    console.error("Error requesting airdrop:", error);
    throw new Error(
      `Failed to request airdrop: ${error.message || String(error)}`
    );
  }
}
