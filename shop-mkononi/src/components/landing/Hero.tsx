"use client";

import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="bg-[#0F766E] text-white py-12 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left side - Text content */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Gundua Shop Mkononi
              <span className="block text-xl sm:text-2xl lg:text-3xl mt-2 text-[#F59E0B]">
                Your Trusted Kenyan Marketplace
              </span>
            </h1>
            <p className="text-base sm:text-lg mb-8 opacity-90 max-w-2xl mx-auto lg:mx-0">
              Shop Mkononi empowers TikTok, Instagram sellers, and local businesses to create easy online shops, while offering buyers a trusted marketplace to discover a diverse range of products from verified sellers from the comfort of their phone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/shops"
                className="bg-[#EA580C] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#F59E0B] transition duration-300"
              >
                Browse Shops
              </Link>
              <Link
                href="/about"
                className="bg-[#F59E0B] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#EA580C] transition duration-300"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Right side - Image */}
          <div className="w-full lg:w-1/2">
            <div className="aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] relative rounded-lg overflow-hidden shadow-xl">
              <Image
                src="/images/hero-market.jpg"
                alt="Kenyan Market Scene"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 