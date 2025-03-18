"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Category } from "@prisma/client";
import { useState, useEffect } from "react";

interface SearchFiltersProps {
  categories: Category[];
}

export default function SearchFilters({ categories }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    location: searchParams.get("location") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  });

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    router.push(`?${params.toString()}`);
  }, [filters, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>
      
      {/* Category Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          name="category"
          value={filters.category}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Location Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Location</label>
        <input
          type="text"
          name="location"
          value={filters.location}
          onChange={handleChange}
          placeholder="Enter location"
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
        />
      </div>

      {/* Price Range Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Price Range (KES)</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleChange}
            placeholder="Min"
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
          />
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleChange}
            placeholder="Max"
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
          />
        </div>
      </div>

      {/* Reset Filters Button */}
      <button
        onClick={() => setFilters({ category: "", location: "", minPrice: "", maxPrice: "" })}
        className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-md transition-colors"
      >
        Reset Filters
      </button>
    </div>
  );
} 