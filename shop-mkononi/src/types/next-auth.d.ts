import { UserRole, VerificationStatus } from "@prisma/client";
import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    role: UserRole;
    isVerified: boolean;
    verificationStatus: VerificationStatus;
    password?: string;
  }

  interface Session {
    user: User;
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