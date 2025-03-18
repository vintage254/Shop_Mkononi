import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
    const isSellerRoute = req.nextUrl.pathname.startsWith("/seller");
    const isVerifiedRoute = req.nextUrl.pathname.startsWith("/verified");

    if (isAdminRoute && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (isSellerRoute && token?.role !== "SELLER") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (isVerifiedRoute && !token?.isVerified) {
      return NextResponse.redirect(new URL("/verify", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/seller/:path*",
    "/verified/:path*",
    "/api/admin/:path*",
    "/api/seller/:path*",
  ],
}; 