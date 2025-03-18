import Link from "next/link";
import { Category } from "@prisma/client";

interface CategoryListProps {
  categories: Category[];
}

export default function CategoryList({ categories }: CategoryListProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Shop by Category</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/shops?category=${category.id}`}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h3 className="font-medium">{category.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {category.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
} 