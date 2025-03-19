"use client";

import Link from "next/link";
import Image from "next/image";
import heroImage from '../../../public/images/hero-market.jpg';
import kenyaTheme from '../../../public/images/kenya-theme.jpg';

export default function Hero() {
  return (
    <section className="bg-[#0F766E] text-white py-12 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left side - Text content */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              <div className="relative inline-block">
                <span className="font-extrabold" style={{
                  background: 'linear-gradient(to bottom, #000 0%, #000 33%, #D62718 33%, #D62718 66%, #078930 66%, #078930 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0px 1px 1px rgba(255,255,255,0.3)',
                  padding: '0.2em 0',
                  WebkitTextStroke: '0.5px white'
                }}>
                  Gundua Shop Mkononi
                </span>
                
                <span className="block text-xl sm:text-2xl lg:text-3xl mt-2 text-[#F59E0B]">
                  Your Trusted Kenyan Marketplace
                </span>
              </div>
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
          <div className="relative w-full lg:w-1/2 h-[300px] sm:h-[400px] lg:h-[500px]">
            <Image
              src={heroImage}
              alt="Kenyan Market Scene"
              fill={true}
              quality={100}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
              className="object-cover rounded-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
} 