import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  
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
    console.log("Middleware - Redirecting to signin (not authenticated)");
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // If the user is logged in but trying to access auth pages
  if (token && ["/auth/signin", "/auth/signup"].includes(request.nextUrl.pathname)) {
    console.log("Middleware - Redirecting to home (already authenticated)");
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Handle verification requirements
  if (token) {
    const isVerificationPath = request.nextUrl.pathname === "/auth/verify";
    const needsVerification = token.verificationStatus !== "VERIFIED";
    
    console.log("Middleware - Verification check:", {
      isVerificationPath,
      needsVerification,
      pathname: request.nextUrl.pathname
    });

    // Always allow access to verification page
    if (isVerificationPath) {
      console.log("Middleware - Allowing access to verification page");
      return NextResponse.next();
    }

    // Seller-specific routes
    if (request.nextUrl.pathname.startsWith("/seller")) {
      if (token.role !== "SELLER") {
        console.log("Middleware - Redirecting to home (not a seller)");
        return NextResponse.redirect(new URL("/", request.url));
      }
      if (needsVerification) {
        console.log("Middleware - Redirecting to verify (seller needs verification)");
        return NextResponse.redirect(new URL("/auth/verify", request.url));
      }
    }

    // Buyer-specific protected routes (cart, checkout)
    if (
      (request.nextUrl.pathname.startsWith("/cart") ||
        request.nextUrl.pathname.startsWith("/checkout")) &&
      needsVerification
    ) {
      console.log("Middleware - Redirecting to verify (buyer needs verification for protected route)");
      return NextResponse.redirect(new URL("/auth/verify", request.url));
    }

    // Admin routes
    if (request.nextUrl.pathname.startsWith("/admin")) {
      if (token.role !== "ADMIN") {
        console.log("Middleware - Redirecting to home (not an admin)");
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

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