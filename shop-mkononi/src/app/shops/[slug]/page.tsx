import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

interface ShopPageProps {
  params: {
    slug: string;
  };
}

export default async function ShopPage({ params }: ShopPageProps) {
  const shop = await prisma.shop.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      products: {
        where: { isActive: true },
        include: {
          images: true,
          reviews: {
            select: {
              rating: true,
            },
          },
        },
      },
      seller: {
        select: {
          name: true,
          isVerified: true,
          verificationStatus: true,
        },
      },
    },
  });

  if (!shop) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      {/* Shop Header */}
      <div className="relative h-64">
        {shop.bannerUrl ? (
          <Image
            src={shop.bannerUrl}
            alt={`${shop.name} banner`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="flex items-center justify-center gap-3 mb-2">
              {shop.logoUrl && (
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white">
                  <Image
                    src={shop.logoUrl}
                    alt={`${shop.name} logo`}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <h1 className="text-4xl font-bold">{shop.name}</h1>
                <div className="flex items-center gap-2 text-sm">
                  <span>{shop.location}</span>
                  {shop.seller.isVerified && (
                    <span className="text-green-400">✓ Verified</span>
                  )}
                </div>
              </div>
            </div>
            <p className="text-lg max-w-2xl mx-auto">{shop.description}</p>
          </div>
        </div>
      </div>

      {/* Shop Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Shop Info Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Shop Info</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Category
                  </h3>
                  <p className="mt-1">{shop.category.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Location
                  </h3>
                  <p className="mt-1">{shop.location}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Seller
                  </h3>
                  <p className="mt-1">{shop.seller.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Products
                  </h3>
                  <p className="mt-1">{shop.products.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="md:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {shop.products.map((product) => (
                <Link
                  key={product.id}
                  href={`/shops/${shop.slug}/products/${product.id}`}
                  className="group bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Product Image */}
                  <div className="relative h-48">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg group-hover:text-primary">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        KES {product.price.toLocaleString()}
                      </span>
                      {product.reviews.length > 0 && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {product.reviews.length} reviews
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 