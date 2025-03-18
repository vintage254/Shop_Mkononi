"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

interface ShopWithDetails {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  location: string;
  category: {
    id: string;
    name: string;
    description: string | null;
  };
  products: { id: string; price: number }[];
  seller: {
    id: string;
    name: string;
    isVerified: boolean;
  };
}

export default function ShopDirectory() {
  const searchParams = useSearchParams();
  const [shops, setShops] = useState<ShopWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        searchParams.forEach((value, key) => {
          params.append(key, value);
        });
        
        const response = await fetch(`/api/shops?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch shops');
        }
        const data = await response.json();
        setShops(data);
      } catch (err) {
        console.error('Error fetching shops:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching shops');
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#0F766E] text-white px-6 py-2 rounded-lg hover:bg-[#EA580C] transition duration-300"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!shops.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          No shops found
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your filters or search terms
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {shops.map((shop) => (
        <Link
          key={shop.id}
          href={`/shops/${shop.slug}`}
          className="group bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          {/* Shop Banner */}
          <div className="relative h-48">
            {shop.bannerUrl ? (
              <Image
                src={shop.bannerUrl}
                alt={`${shop.name} banner`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-gray-400 dark:text-gray-500">{shop.name[0]}</span>
              </div>
            )}
          </div>

          {/* Shop Info */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              {shop.logoUrl && (
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src={shop.logoUrl}
                    alt={`${shop.name} logo`}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg group-hover:text-[#0F766E] transition-colors">
                  {shop.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>{shop.location}</span>
                  {shop.seller.isVerified && (
                    <span className="text-green-500">✓ Verified</span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
              {shop.description}
            </p>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                {shop.category.name}
              </span>
              <span className="font-medium">
                {shop.products.length} products
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 