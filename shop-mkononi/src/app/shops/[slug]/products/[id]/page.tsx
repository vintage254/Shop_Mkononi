import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { StarIcon } from "@heroicons/react/20/solid";

interface ProductPageProps {
  params: {
    slug: string;
    id: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      images: true,
      category: true,
      shop: {
        select: {
          name: true,
          slug: true,
          location: true,
          seller: {
            select: {
              name: true,
              isVerified: true,
              verificationStatus: true,
            },
          },
        },
      },
      reviews: {
        include: {
          user: {
            select: {
              name: true,
              isVerified: true,
            },
          },
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Calculate average rating
  const averageRating =
    product.reviews.reduce((acc, review) => acc + review.rating, 0) /
    product.reviews.length;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden">
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

          {/* Thumbnail Grid */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1).map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden"
                >
                  <Image
                    src={image.url}
                    alt={`${product.name} ${index + 2}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Link
              href={`/shops/${product.shop.slug}`}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary"
            >
              {product.shop.name}
            </Link>
            <h1 className="text-3xl font-bold mt-2">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl font-bold">
                KES {product.price.toLocaleString()}
              </span>
              {product.reviews.length > 0 && (
                <div className="flex items-center gap-1">
                  <StarIcon className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {averageRating.toFixed(1)} ({product.reviews.length} reviews)
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
              {product.description}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Details</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Category
                </dt>
                <dd className="mt-1">{product.category.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Condition
                </dt>
                <dd className="mt-1 capitalize">{product.condition}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Stock
                </dt>
                <dd className="mt-1">{product.stock} available</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Location
                </dt>
                <dd className="mt-1">{product.shop.location}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Delivery Methods</h2>
            <ul className="space-y-2">
              {product.deliveryMethods.map((method, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <span>{method.name}</span>
                  <span className="font-medium">
                    KES {method.price.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <button className="w-full bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Add to Cart
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      {product.reviews.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Reviews</h2>
          <div className="space-y-6">
            {product.reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-5 h-5 ${
                          i < review.rating
                            ? "text-yellow-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {review.comment}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm font-medium">{review.user.name}</span>
                  {review.user.isVerified && (
                    <span className="text-green-500 text-sm">✓ Verified</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
} 