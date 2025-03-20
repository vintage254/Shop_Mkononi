import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Use the centralized authOptions from lib/auth.ts to ensure consistent authentication behavior
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };