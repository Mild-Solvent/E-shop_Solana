import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      walletAddress: string;
      nametag: string;
      surname: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    walletAddress: string;
    nametag: string;
    surname: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    walletAddress: string;
    nametag: string;
    surname: string;
  }
}
