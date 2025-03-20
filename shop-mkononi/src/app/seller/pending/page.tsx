"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ClipboardCheck, Clock, ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function SellerPendingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  useEffect(() => {
    if (session?.user) {
      // If user is already a verified seller, redirect to dashboard
      if (session.user.role === "SELLER") {
        router.push("/seller/dashboard");
        return;
      }
      
      // If user hasn't applied to be a seller, redirect to application page
      if (!session.user.requestedRole && session.user.verificationStatus !== "PENDING") {
        router.push("/seller/apply");
        return;
      }
    } else if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/seller/pending");
    }
  }, [session, router, status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0F766E]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <ShoppingBag className="h-12 w-12 text-[#0F766E]" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Application Under Review
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Your seller application is being reviewed by our team
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <div className="bg-blue-50 p-4 rounded-full">
              <Clock className="h-12 w-12 text-blue-500" />
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">Verification in Progress</h3>
              <p className="mt-2 text-sm text-gray-500">
                We're currently reviewing your ID and selfie verification. This process typically takes 1-2 business days.
              </p>
            </div>
            
            <div className="border-t border-gray-200 w-full pt-6">
              <h4 className="text-sm font-medium text-gray-900">What happens next?</h4>
              <ul className="mt-4 space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <ClipboardCheck className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="ml-3 text-sm text-left">
                    <p className="text-gray-700">Our team will review your submitted documents</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <ClipboardCheck className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="ml-3 text-sm text-left">
                    <p className="text-gray-700">You'll receive an email notification once your application is approved</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <ClipboardCheck className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="ml-3 text-sm text-left">
                    <p className="text-gray-700">After approval, you'll be able to create your shop and start selling</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="pt-4 w-full">
              <Link
                href="/"
                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F766E]"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
