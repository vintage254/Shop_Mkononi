"use client";

import { ShieldCheckIcon, UserGroupIcon, TruckIcon } from "@heroicons/react/24/outline";

export default function TrustSection() {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#0F766E] mb-4">
            Tafuta Maduka Yanayotegemeka
          </h2>
          <p className="text-xl text-gray-600">
            Yamehakikishiwa Ubora
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Verified Sellers */}
          <div className="text-center p-6 rounded-lg bg-gray-50 hover:shadow-lg transition duration-300">
            <ShieldCheckIcon className="h-16 w-16 text-[#EA580C] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#0F766E] mb-2">
              Verified Sellers
            </h3>
            <p className="text-gray-600">
              All our sellers are ID-verified and vetted for quality service
            </p>
          </div>

          {/* Local Community */}
          <div className="text-center p-6 rounded-lg bg-gray-50 hover:shadow-lg transition duration-300">
            <UserGroupIcon className="h-16 w-16 text-[#EA580C] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#0F766E] mb-2">
              Local Community
            </h3>
            <p className="text-gray-600">
              Connect with trusted local sellers offering unique products
            </p>
          </div>

          {/* Secure Delivery */}
          <div className="text-center p-6 rounded-lg bg-gray-50 hover:shadow-lg transition duration-300">
            <TruckIcon className="h-16 w-16 text-[#EA580C] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#0F766E] mb-2">
              Secure Delivery
            </h3>
            <p className="text-gray-600">
              Safe and reliable delivery options across Kenya
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 