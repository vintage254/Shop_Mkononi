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
      requestedRole?: "BUYER" | "SELLER" | null;
      phone: string;
      isVerified: boolean;
      verificationStatus: string;
    }
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: "BUYER" | "SELLER";
    requestedRole?: "BUYER" | "SELLER" | null;
    phone: string;
    password?: string;
    isVerified: boolean;
    verificationStatus: VerificationStatus;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    requestedRole?: UserRole | null;
    isVerified: boolean;
    verificationStatus: VerificationStatus;
  }
}