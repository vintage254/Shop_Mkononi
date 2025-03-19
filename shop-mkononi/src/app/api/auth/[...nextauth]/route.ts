// Import necessary packages and modules
import NextAuth, { NextAuthOptions, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

// Create Prisma Client
const prisma = new PrismaClient();

// Types for custom session user
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      image?: string;
      role: string;
      phone: string;
      isVerified: boolean;
      verificationStatus: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name?: string;
    image?: string;
    role: string;
    phone: string;
    isVerified: boolean;
    verificationStatus: string;
  }
}

export const authOptions: NextAuthOptions = {
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
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          return null;
        }

        // Return user data for the authorized user
        return {
          id: user.id,
          email: user.email,
          image: user.image,
          role: user.role,
          phone: user.phone,
          isVerified: user.isVerified,
          verificationStatus: user.verificationStatus,
        };
      }
    })
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // For Google Sign In
        if (account?.provider === "google") {
          console.log("Google sign-in attempt for:", user.email);
          
          // Check if user exists
          const existingUser = await prisma.$queryRaw`
            SELECT id, email, phone, image, role, is_verified as "isVerified", verification_status as "verificationStatus" 
            FROM users 
            WHERE email = ${user.email}
            LIMIT 1
          `;

          if (existingUser && Array.isArray(existingUser) && existingUser.length > 0) {
            const userData = existingUser[0] as any;
            console.log("Existing user found:", userData.id);
            
            // If user exists but doesn't have a Google account linked, update the user
            if (!userData.image && user.image) {
              console.log("Updating user with Google profile image");
              await prisma.$executeRaw`
                UPDATE users 
                SET image = ${user.image}, updated_at = NOW()
                WHERE id = ${userData.id}
              `;
            }
            
            // If user needs verification, redirect them
            if (userData.verificationStatus !== "VERIFIED") {
              console.log("User needs verification, redirecting to /auth/verify");
              return `/auth/verify`;
            }
            
            // Return true to allow sign in
            return true;
          } else {
            console.log("New user from Google, creating account");
            // Create a new user in the database
            try {
              // First, check the column structure to better understand what's required
              const columns = await prisma.$queryRaw`
                SELECT column_name, is_nullable, column_default 
                FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = 'users'
              `;
              console.log("Database column structure:", columns);
              
              // Create new user with explicit ID (UUID)
              const uuid = await prisma.$queryRaw`SELECT uuid_generate_v4()`;
              const userId = (uuid as any)[0].uuid_generate_v4;
              console.log("Generated UUID for new user:", userId);
              
              await prisma.$executeRaw`
                INSERT INTO users (
                  id,
                  email, 
                  name, 
                  image, 
                  role, 
                  phone,
                  is_verified,
                  verification_status, 
                  created_at,
                  updated_at
                ) VALUES (
                  ${userId},
                  ${user.email}, 
                  ${user.name || ''}, 
                  ${user.image || ''}, 
                  'BUYER', 
                  '',
                  false,
                  'PENDING',
                  NOW(),
                  NOW()
                )
              `;
              
              console.log("New user created successfully with ID:", userId);
            } catch (error) {
              console.error("Error creating new user:", error);
              return false;
            }
            
            console.log("New user created, redirecting to verification");
            return `/auth/verify?new=true`;
          }
        }
        
        // For credentials provider
        return true;
      } catch (error) {
        console.error("Sign-in error:", error);
        return false;
      }
    },
    async jwt({ token, user, account, profile }) {
      // Add some debugging
      console.log("JWT callback with token:", { 
        id: token.id, 
        email: token.email,
        provider: account?.provider
      });
      
      if (user) {
        token.id = user.id;
        token.email = user.email;
        
        // Handle different field types
        if (typeof user.image === 'string') {
          token.image = user.image;
        } else {
          token.image = undefined;
        }
        
        token.role = user.role;
        token.phone = user.phone;
        token.isVerified = user.isVerified;
        token.verificationStatus = user.verificationStatus;
      }
      
      // For Google auth, we need to get the latest user data from DB
      if (account?.provider === "google") {
        try {
          console.log("Fetching latest user data from DB for Google auth user");
          const userData = await prisma.$queryRaw`
            SELECT 
              id, 
              email, 
              phone, 
              image, 
              role, 
              is_verified as "isVerified", 
              verification_status as "verificationStatus"
            FROM users 
            WHERE email = ${token.email}
            LIMIT 1
          `;
          
          if (userData && Array.isArray(userData) && userData.length > 0) {
            const dbUser = userData[0] as any;
            console.log("Found user data in DB:", {
              id: dbUser.id,
              email: dbUser.email,
              role: dbUser.role,
              verificationStatus: dbUser.verificationStatus
            });
            
            token.id = dbUser.id;
            token.email = dbUser.email;
            token.phone = dbUser.phone || "";
            token.image = dbUser.image || undefined;
            token.role = dbUser.role || "BUYER";
            token.isVerified = !!dbUser.isVerified;
            token.verificationStatus = dbUser.verificationStatus || "PENDING";
          } else {
            console.warn("No user data found in DB for email:", token.email);
          }
        } catch (error) {
          console.error("Error fetching user data in JWT callback:", error);
        }
      }
      
      return token;
    },

    async session({ session, token }) {
      console.log("Session callback with token:", { 
        id: token.id, 
        email: token.email,
        role: token.role,
        verificationStatus: token.verificationStatus
      });
      
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.phone = token.phone as string || "";
        session.user.image = token.image as string | undefined;
        session.user.role = token.role as string || "BUYER";
        session.user.isVerified = token.isVerified as boolean;
        session.user.verificationStatus = token.verificationStatus as string || "PENDING";
      }
      
      console.log("Session created for user:", { 
        id: session.user.id, 
        email: session.user.email,
        role: session.user.role,
        verificationStatus: session.user.verificationStatus
      });
      
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };