"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, ShoppingCart, User } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-[#0F766E]">Shop Mkononi</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/shops" className="text-gray-700 hover:text-[#EA580C]">
              Shops
            </Link>
            <Link href="/search" className="text-gray-700 hover:text-[#EA580C]">
              Search
            </Link>
            {session?.user && (
              <>
                <Link href="/cart" className="text-gray-700 hover:text-[#EA580C]">
                  <ShoppingCart className="h-6 w-6" />
                </Link>
                {session.user.role === "SELLER" && (
                  <Link href="/seller/dashboard" className="text-gray-700 hover:text-[#EA580C]">
                    Dashboard
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-4">
                <Link href="/profile" className="flex items-center space-x-2 text-gray-700">
                  <User className="h-5 w-5" />
                  <span>{session.user.name || 'Profile'}</span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="bg-[#EA580C] text-white px-4 py-2 rounded-lg hover:bg-[#F59E0B] transition duration-300"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/signin"
                  className="text-[#0F766E] hover:text-[#EA580C]"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-[#0F766E] text-white px-4 py-2 rounded-lg hover:bg-[#EA580C] transition duration-300"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/shops"
                className="text-gray-700 hover:text-[#EA580C] px-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Shops
              </Link>
              <Link
                href="/search"
                className="text-gray-700 hover:text-[#EA580C] px-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Search
              </Link>
              {session?.user && (
                <>
                  <Link
                    href="/cart"
                    className="text-gray-700 hover:text-[#EA580C] px-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Cart
                  </Link>
                  {session.user.role === "SELLER" && (
                    <Link
                      href="/seller/dashboard"
                      className="text-gray-700 hover:text-[#EA580C] px-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                </>
              )}
              {session ? (
                <>
                  <Link
                    href="/profile"
                    className="text-gray-700 hover:text-[#EA580C] px-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="text-left text-gray-700 hover:text-[#EA580C] px-2"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="text-gray-700 hover:text-[#EA580C] px-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="text-gray-700 hover:text-[#EA580C] px-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 