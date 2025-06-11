"use client";

import { useParams, notFound } from "next/navigation";
import { useGetAllBusinessesQuery } from "@/app/redux/services/BusinessApi";
import BusinessCard from "@/app/components/ui/BusinessCard";
import ProductCard from "@/app/components/ui/ProductCard";

const validCategories = [
  "Food-Dining",
  "Health-Wellness",
  "Entertainment-Lifestyle",
  "Services-Professional",
  "Retail-Shopping",
  "Education-Technology",
];

export default function CategoryPage() {
  const { category } = useParams();

  if (!category || !validCategories.includes(category)) {
    return notFound();
  }

  const { data: businesses, isLoading, isError } = useGetAllBusinessesQuery();

  if (!businesses || !Array.isArray(businesses))
    return <p>No businesses available.</p>;

  // Directly filter by exact category string in array
  const filteredBusinesses = businesses.filter(
    (b) => Array.isArray(b.category) && b.category.includes(category)
  );

  return (
    <main className="w-full min-h-screen bg-background text-text pt-24 p-96">
      <h1 className="text-3xl font-bold p-5">
        {category.replace(/-/g, " ")} Businesses
      </h1>

      {filteredBusinesses.length === 0 ? (
        <p className="text-gray-500 italic">
          No businesses found in this category.
        </p>
      ) : (
        filteredBusinesses.map((business) => (
          <div
            key={business.businessId}
            className="border rounded-xl p-4 shadow"
          >
            <BusinessCard business={business} />

            {business.products?.length > 0 ? (
              <section className="mt-4">
                <h2 className="text-lg font-semibold mb-2">Products</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {business.products.map((product) => (
                    <ProductCard key={product.productId} product={product} />
                  ))}
                </div>
              </section>
            ) : (
              <p className="text-gray-500 italic mt-2">No products listed.</p>
            )}
          </div>
        ))
      )}
    </main>
  );
}
