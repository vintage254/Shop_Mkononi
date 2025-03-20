import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Hero from "@/components/landing/Hero";
import ShopDirectory from "@/components/ShopDirectory";
import SearchSection from "@/components/landing/SearchSection";
import TrustSection from "@/components/landing/TrustSection";
import CategoryList from "@/components/CategoryList";

export const dynamic = 'force-dynamic';

async function getCategories() {
  try {
    // Use a direct $queryRaw to avoid prepared statement issues
    const categoriesRaw = await prisma.$queryRaw`
      SELECT id, name, description, created_at as "createdAt", updated_at as "updatedAt"
      FROM categories
      ORDER BY name ASC
    `;
    
    // Convert the raw result to the expected format
    return Array.isArray(categoriesRaw) ? categoriesRaw : [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);
  const categories = await getCategories();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Search and Categories Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <SearchSection />
          <div className="mt-8">
            <CategoryList categories={categories} />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <TrustSection />

      {/* Shop Directory Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#0F766E]">
            Discover Our Verified Shops
          </h2>
          <ShopDirectory />
        </div>
      </section>
    </main>
  );
}
