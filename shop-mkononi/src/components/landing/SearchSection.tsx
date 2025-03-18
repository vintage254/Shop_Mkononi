"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function SearchSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSearch} className="relative">
        <div className="flex">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Tafuta Maduka au Bidhaa"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-l-lg border-2 border-[#0F766E] focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-6 w-6 text-[#EA580C]" />
          </div>
          <button
            type="submit"
            className="px-8 py-3 bg-[#0F766E] text-white rounded-r-lg hover:bg-[#EA580C] transition duration-300"
          >
            Search
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => router.push("/shops")}
          className="px-4 py-2 bg-[#F59E0B] text-white rounded-full hover:bg-[#EA580C] transition duration-300"
        >
          All Shops
        </button>
        <button
          onClick={() => router.push("/shops/handmade")}
          className="px-4 py-2 bg-[#F59E0B] text-white rounded-full hover:bg-[#EA580C] transition duration-300"
        >
          Handmade
        </button>
        <button
          onClick={() => router.push("/shops/second-hand")}
          className="px-4 py-2 bg-[#F59E0B] text-white rounded-full hover:bg-[#EA580C] transition duration-300"
        >
          Second-Hand
        </button>
        <button
          onClick={() => router.push("/shops/electronics")}
          className="px-4 py-2 bg-[#F59E0B] text-white rounded-full hover:bg-[#EA580C] transition duration-300"
        >
          Electronics
        </button>
        <button
          onClick={() => router.push("/shops/fashion")}
          className="px-4 py-2 bg-[#F59E0B] text-white rounded-full hover:bg-[#EA580C] transition duration-300"
        >
          Fashion
        </button>
      </div>
    </div>
  );
} 