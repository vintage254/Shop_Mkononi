import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Avoid reading body by simplifying token checks
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET
  });
  
  console.log("Middleware - URL:", request.nextUrl.pathname);
  console.log("Middleware - Token:", token ? "Present" : "Not present");
  if (token) {
    console.log("Middleware - User:", {
      id: token.sub,
      role: token.role,
      verificationStatus: token.verificationStatus
    });
  }

  // Public paths that don't require authentication
  const publicPaths = ["/", "/auth/signin", "/auth/signup"];
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname);

  // If the user is not logged in and trying to access a protected route
  if (!token && !isPublicPath) {
    // For protected routes, redirect to signin
    if (request.nextUrl.pathname.startsWith('/dashboard') || 
        request.nextUrl.pathname.startsWith('/seller') ||
        request.nextUrl.pathname.startsWith('/shops')) {
      console.log("Middleware - Redirecting to signin (not authenticated)");
      const callbackUrl = encodeURIComponent(request.nextUrl.pathname);
      return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}`, request.url));
    }
    
    // For other protected routes, redirect to signin
    console.log("Middleware - Redirecting to signin (not authenticated)");
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // If the user is logged in but trying to access auth pages
  if (token && ["/auth/signin", "/auth/signup"].includes(request.nextUrl.pathname)) {
    console.log("Middleware - Redirecting to dashboard (already authenticated)");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Handle role-based access and verification requirements
  if (token) {
    const isVerificationPath = request.nextUrl.pathname === "/auth/verify";
    const hasPendingVerification = token.verificationStatus === "PENDING" && token.requested_role === "SELLER";
    
    console.log("Middleware - Verification check:", {
      isVerificationPath,
      hasPendingVerification,
      pathname: request.nextUrl.pathname,
      role: token.role
    });

    // Always allow access to verification page
    if (isVerificationPath) {
      console.log("Middleware - Allowing access to verification page");
      return NextResponse.next();
    }

    // Seller-specific routes
    if (request.nextUrl.pathname.startsWith("/seller")) {
      if (token.role !== "SELLER") {
        // If the user is a BUYER but has applied to be a SELLER and verification is pending
        if (token.role === "BUYER" && token.requested_role === "SELLER" && token.verificationStatus === "PENDING") {
          console.log("Middleware - Redirecting to verify (seller application pending)");
          return NextResponse.redirect(new URL("/auth/verify", request.url));
        }
        
        console.log("Middleware - Redirecting to home (not a seller)");
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  // Allow all other requests
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /fonts (inside /public)
     * 4. /examples (inside /public)
     * 5. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api|_next|fonts|examples|[\\w-]+\\.\\w+).*)",
  ],
};