import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import { compare } from "bcryptjs";
import { UserRole, VerificationStatus } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    role: UserRole;
    isVerified: boolean;
    verificationStatus: VerificationStatus;
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

type UserWithPassword = {
  id: string;
  email: string;
  password: string | null;
  role: UserRole;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
    error: "/auth/error",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }) as any,
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        }) as UserWithPassword | null;

        if (!user) {
          throw new Error("User not found");
        }

        if (!user.password) {
          throw new Error("Please sign in with Google");
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          verificationStatus: user.verificationStatus,
        };
      },
    }) as any,
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email!,
          role: token.role as UserRole,
          isVerified: token.isVerified as boolean,
          verificationStatus: token.verificationStatus as VerificationStatus,
        };
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isVerified = user.isVerified;
        token.verificationStatus = user.verificationStatus;
      }
      return token;
    },
  },
}; 