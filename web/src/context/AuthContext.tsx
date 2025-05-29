"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Session } from "next-auth";

type PhantomEvent = "connect" | "disconnect" | "accountChanged";

interface PhantomProvider {
  publicKey: { toString(): string } | null;
  isConnected: boolean | null;
  signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
  connect(): Promise<{ publicKey: { toString(): string } }>;
  disconnect(): Promise<void>;
  on(event: PhantomEvent, handler: (args: any) => void): void;
  removeListener(event: PhantomEvent, handler: (args: any) => void): void;
}

// Define a type for our user object
type UserType = {
  id?: string;
  name?: string;
  surname?: string;
  nametag?: string;
  walletAddress?: string;
  email?: string;
  image?: string;
} | null;

interface AuthContextType {
  wallet: {
    publicKey: string | null;
    isConnected: boolean;
  };
  user: UserType;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  wallet: {
    publicKey: null,
    isConnected: false,
  },
  user: null,
  connectWallet: async () => {},
  disconnectWallet: async () => {},
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const [wallet, setWallet] = useState<{
    publicKey: string | null;
    isConnected: boolean;
  }>({
    publicKey: null,
    isConnected: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Check if Phantom is available
  const getProvider = (): PhantomProvider | undefined => {
    if (typeof window !== "undefined") {
      const windowObj = window as any;
      if (windowObj.phantom?.solana?.isPhantom) {
        return windowObj.phantom.solana;
      }
    }
    return undefined;
  };

  // Connect to Phantom wallet
  const connectWallet = async () => {
    setIsLoading(true);
    try {
      const provider = getProvider();
      if (!provider) {
        window.open("https://phantom.app/", "_blank");
        return;
      }

      const response = await provider.connect();
      const publicKey = response.publicKey.toString();
      setWallet({ publicKey, isConnected: true });

      // Show form to collect user info if not already logged in
      if (status !== "authenticated") {
        // Check if the user already exists
        const userExists = await checkUserExists(publicKey);

        if (userExists) {
          // User exists, just sign in
          await signIn("credentials", {
            walletAddress: publicKey,
            redirect: false,
          });
        } else {
          // User doesn't exist, show modal to collect info
          const userData = await collectUserData();
          if (userData) {
            await signIn("credentials", {
              walletAddress: publicKey,
              userData: JSON.stringify(userData),
              redirect: false,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    setIsLoading(true);
    try {
      const provider = getProvider();
      if (provider) {
        await provider.disconnect();
        setWallet({ publicKey: null, isConnected: false });
        await signOut({ redirect: false });
      }
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user exists in the database
  const checkUserExists = async (walletAddress: string) => {
    try {
      const response = await fetch(
        `/api/users/check?walletAddress=${walletAddress}`
      );
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error("Error checking if user exists:", error);
      return false;
    }
  };

  // Collect user data from a modal form
  const collectUserData = async (): Promise<{
    name: string;
    surname: string;
    nametag: string;
  } | null> => {
    return new Promise((resolve) => {
      // Create modal element
      const modal = document.createElement("div");
      modal.className =
        "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50";

      // Create modal content
      modal.innerHTML = `
        <div class="bg-white p-6 rounded-lg w-full max-w-md">
          <h2 class="text-xl font-bold mb-4">Complete Your Profile</h2>
          <form id="user-form" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Name</label>
              <input type="text" id="name" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Surname</label>
              <input type="text" id="surname" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Nametag</label>
              <input type="text" id="nametag" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div class="flex justify-end space-x-3">
              <button type="button" id="cancel-btn" class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Cancel</button>
              <button type="submit" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Save</button>
            </div>
          </form>
        </div>
      `;

      document.body.appendChild(modal);

      // Add event listeners
      const form = document.getElementById("user-form");
      const cancelBtn = document.getElementById("cancel-btn");

      form?.addEventListener("submit", (e) => {
        e.preventDefault();
        const nameInput = document.getElementById("name") as HTMLInputElement;
        const surnameInput = document.getElementById(
          "surname"
        ) as HTMLInputElement;
        const nametagInput = document.getElementById(
          "nametag"
        ) as HTMLInputElement;

        const userData = {
          name: nameInput.value,
          surname: surnameInput.value,
          nametag: nametagInput.value,
        };

        document.body.removeChild(modal);
        resolve(userData);
      });

      cancelBtn?.addEventListener("click", () => {
        document.body.removeChild(modal);
        resolve(null);
      });
    });
  };

  // Set up event listeners for wallet connection changes
  useEffect(() => {
    const provider = getProvider();

    if (provider) {
      // Set initial state based on session
      if (session?.user?.walletAddress) {
        setWallet({
          publicKey: session.user.walletAddress,
          isConnected: true,
        });
      }

      // Handle connection changes
      const handleAccountChange = (
        publicKey: { toString(): string } | null
      ) => {
        if (publicKey) {
          setWallet({
            publicKey: publicKey.toString(),
            isConnected: true,
          });
        } else {
          setWallet({ publicKey: null, isConnected: false });
        }
      };

      // Handle disconnection
      const handleDisconnect = () => {
        setWallet({ publicKey: null, isConnected: false });
        signOut({ redirect: false });
      };

      provider.on("accountChanged", handleAccountChange);
      provider.on("disconnect", handleDisconnect);

      return () => {
        provider.removeListener("accountChanged", handleAccountChange);
        provider.removeListener("disconnect", handleDisconnect);
      };
    }
  }, [session]);

  // Update loading state when session status changes
  useEffect(() => {
    if (status !== "loading") {
      setIsLoading(false);
    }
  }, [status]);

  const value = {
    wallet,
    user: session?.user as UserType,
    connectWallet,
    disconnectWallet,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
