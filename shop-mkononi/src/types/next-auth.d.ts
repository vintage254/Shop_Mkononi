import { UserRole, VerificationStatus } from "@prisma/client";
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: "BUYER" | "SELLER";
      phone: string;
    }
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: "BUYER" | "SELLER";
    phone: string;
    password?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    isVerified: boolean;
    verificationStatus: VerificationStatus;
  }
} 