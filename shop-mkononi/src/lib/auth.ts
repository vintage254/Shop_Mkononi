import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import { UserRole, VerificationStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";

// Extend session and JWT types with our custom properties
declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name?: string;
    image?: string;
    role: UserRole;
    requestedRole?: string | null;
    phone: string | null;
    isVerified: boolean;
    verificationStatus: VerificationStatus;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      image?: string;
      role: UserRole;
      requestedRole?: string | null;
      phone: string | null;
      isVerified: boolean;
      verificationStatus: VerificationStatus;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name?: string;
    image?: string;
    role: UserRole;
    requestedRole?: string | null;
    phone: string | null;
    isVerified: boolean;
    verificationStatus: VerificationStatus;
  }
}

// Define the structure of raw SQL query results for better type safety
interface UserQueryResult {
  id: string;
  email: string;
  role: string;
  requested_role?: string | null;
  phone?: string | null;
}

export const authOptions: NextAuthOptions = {
  // Temporarily do not use the adapter to avoid database field issues
  // We'll use JWT strategy to store session data in cookies
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    // We can add the credentials provider back once the password field is available in the database
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // For Google Sign In
        if (account?.provider === "google" && user) {
          console.log("Google sign-in attempt for:", user.email);
          
          if (!user.email) {
            console.error("No email provided by Google");
            return "/auth/error?error=NoEmailProvided";
          }

          try {
            // Escape single quotes in user input for SQL safety
            const safeEmail = user.email.replace(/'/g, "''");
            const safeName = (user.name || '').replace(/'/g, "''");
            const safeImage = (user.image || '').replace(/'/g, "''");
            
            // Check if user exists in the database using direct SQL query
            const result = await prisma.$queryRawUnsafe<UserQueryResult[]>(`
              SELECT id, email, role
              FROM users 
              WHERE email = '${safeEmail}'
              LIMIT 1
            `);
            
            const userExists = Array.isArray(result) && result.length > 0;
            
            if (userExists) {
              console.log("Existing user found:", result[0].id);
              return true; // Allow sign in
            } else {
              console.log("Creating new user from Google auth");
              
              // Create a new user with basic fields
              try {
                // Include password as empty string to satisfy database constraints
                await prisma.$executeRawUnsafe(`
                  INSERT INTO users(
                    id, email, name, image, role, password, created_at, updated_at
                  ) 
                  VALUES (
                    gen_random_uuid(), '${safeEmail}', '${safeName}', '${safeImage}', 
                    'BUYER', '', now(), now()
                  )
                `);
                
                console.log("New user created successfully");
                return true;
              } catch (error) {
                console.error("Error creating user:", error);
                return "/auth/error?error=UserCreationFailed";
              }
            }
          } catch (dbError) {
            console.error("Database error during Google sign-in:", dbError);
            
            // Fallback: try to use a more direct database approach if the first one fails
            try {
              // Try a simplified approach with the Prisma client
              const existingUser = await prisma.user.findUnique({
                where: { email: user.email },
                select: { id: true }
              }).catch(() => null);
              
              if (existingUser) {
                return true;
              }
              
              // Create user with minimal fields using the Prisma client
              const userData: Prisma.UserUncheckedCreateInput = {
                email: user.email,
                name: user.name || '',
                image: user.image || '',
                role: 'BUYER' as UserRole,
                // Required fields with proper types
                password: "", // Empty string instead of undefined
                phoneVerified: false,
                isVerified: false,
                verificationStatus: 'PENDING' as VerificationStatus,
              };
              
              await prisma.user.create({
                data: userData
              }).catch(err => {
                console.error("Prisma user creation failed:", err);
                return false;
              });
              
              return true;
            } catch (fallbackError) {
              console.error("Fallback authentication also failed:", fallbackError);
              return "/auth/error?error=DatabaseError";
            }
          }
        }

        return false; // Reject all other sign-in methods for now
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return "/auth/error?error=CallbackError";
      }
    },
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.image;
        session.user.role = (token.role || "BUYER") as UserRole;
        session.user.requestedRole = token.requestedRole as string | null;
        session.user.phone = token.phone;
        session.user.isVerified = token.isVerified || false;
        session.user.verificationStatus = (token.verificationStatus || "PENDING") as VerificationStatus;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        // Update token with user data on initial sign in
        token.id = user.id;
        token.role = user.role || "BUYER";
        token.requestedRole = user.requestedRole;
        token.phone = user.phone;
        token.isVerified = user.isVerified || false;
        token.verificationStatus = user.verificationStatus || "PENDING";
      } else if (token?.email) {
        try {
          // Escape single quotes in user input for SQL safety
          const safeEmail = token.email.replace(/'/g, "''");
          
          // Refresh user data from the database on subsequent requests
          const result = await prisma.$queryRawUnsafe<UserQueryResult[]>(`
            SELECT id, email, role, requested_role, phone
            FROM users 
            WHERE email = '${safeEmail}'
            LIMIT 1
          `);
          
          const userFound = Array.isArray(result) && result.length > 0;
          
          if (userFound) {
            const user = result[0];
            // Update token with latest user data
            token.id = user.id;
            // Cast string role to UserRole type
            token.role = (user.role || "BUYER") as UserRole;
            // Handle potentially undefined requested_role with null as fallback
            token.requestedRole = user.requested_role || null;
            token.phone = user.phone || null;
            // We don't have these fields in the database yet, so use defaults
            token.isVerified = false;
            token.verificationStatus = "PENDING" as VerificationStatus;
          }
        } catch (error) {
          console.error("Error refreshing user data in JWT callback:", error);
          // If we can't refresh data, keep using the existing token data
        }
      }
      return token;
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};