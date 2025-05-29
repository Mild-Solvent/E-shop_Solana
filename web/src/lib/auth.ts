import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "./mongodb";
import User from "../models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Phantom Wallet",
      credentials: {
        walletAddress: { label: "Wallet Address", type: "text" },
        userData: { label: "User Data", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.walletAddress) {
          return null;
        }

        await connectToDatabase();

        // Check if the user exists
        let user = await User.findOne({
          walletAddress: credentials.walletAddress,
        });

        // If the user doesn't exist and we have userData, create a new user
        if (!user && credentials.userData) {
          try {
            const userData = JSON.parse(credentials.userData);
            user = await User.create({
              name: userData.name,
              surname: userData.surname,
              nametag:
                userData.nametag || `user_${Date.now().toString().slice(-6)}`,
              walletAddress: credentials.walletAddress,
              posts: [],
            });
          } catch (error) {
            console.error("Error creating user:", error);
            return null;
          }
        }

        // If we still don't have a user, return null
        if (!user) {
          return null;
        }

        // Return the user object
        return {
          id: user._id.toString(),
          name: user.name,
          surname: user.surname,
          nametag: user.nametag,
          walletAddress: user.walletAddress,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          walletAddress: token.walletAddress as string,
          nametag: token.nametag as string,
          surname: token.surname as string,
        };
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.walletAddress = user.walletAddress;
        token.nametag = user.nametag;
        token.surname = user.surname;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
