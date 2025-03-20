import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
    // Redirect to signin for /shops and shop-related paths
    if (request.nextUrl.pathname.startsWith('/shops') || request.nextUrl.pathname === '/shops') {
      console.log("Middleware - Redirecting to signin (shops require authentication)");
      return NextResponse.redirect(new URL("/auth/signin?callbackUrl=" + request.nextUrl.pathname, request.url));
    }
    
    // Check if this is a shop page that might require verification
    if (request.nextUrl.pathname.startsWith('/shops/')) {
      const slug = request.nextUrl.pathname.split('/')[2]; // Extract slug from /shops/[slug]
      
      // Check if this shop requires buyer verification
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        );
        
        const { data: shop } = await supabase
          .from('shops')
          .select('buyer_verification')
          .eq('slug', slug)
          .single();
        
        // If shop requires verification, redirect to signin
        if (shop && shop.buyer_verification !== 'NONE') {
          console.log("Middleware - Redirecting to signin (shop requires verification)");
          return NextResponse.redirect(new URL("/auth/signin", request.url));
        }
      } catch (error) {
        console.error("Middleware - Error checking shop verification:", error);
        // Continue as if no verification required in case of error
      }
      
      // If no verification required or error occurred, allow access
      return NextResponse.next();
    }
    
    // For other protected routes, redirect to signin
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

    // Admin routes
    if (request.nextUrl.pathname.startsWith("/admin")) {
      if (token.role !== "ADMIN") {
        console.log("Middleware - Redirecting to home (not an admin)");
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
    
    // Shop-specific routes that may require buyer verification
    if (request.nextUrl.pathname.startsWith('/shops/')) {
      const slug = request.nextUrl.pathname.split('/')[2]; // Extract slug from /shops/[slug]
      
      // Check if this shop requires buyer verification
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        );
        
        const { data: shop } = await supabase
          .from('shops')
          .select('buyer_verification')
          .eq('slug', slug)
          .single();
        
        // If shop requires ID verification and user is not verified
        if (shop && shop.buyer_verification === 'ID' && needsVerification) {
          console.log("Middleware - Redirecting to verify (shop requires ID verification)");
          return NextResponse.redirect(new URL("/auth/verify", request.url));
        }
        
        // If shop requires PHONE verification and user doesn't have a phone
        if (shop && shop.buyer_verification === 'PHONE' && !token.phone) {
          console.log("Middleware - Redirecting to verify phone (shop requires phone verification)");
          return NextResponse.redirect(new URL("/auth/verify-phone", request.url));
        }
      } catch (error) {
        console.error("Middleware - Error checking shop verification:", error);
        // Continue as if no verification required in case of error
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