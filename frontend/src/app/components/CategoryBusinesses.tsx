"use client";

import React from "react";
import Link from "next/link";
import { useGetAllBusinessesQuery } from "@/app/redux/services/BusinessApi";
import { useGetReviewsQuery } from "@/app/redux/services/reviewApi";
import BusinessCard from "@/app/components/ui/BusinessCard";
import ProductCard from "@/app/components/ui/ProductCard";
import ReviewCard from "@/app/components/ui/ReviewCard";

type CategoryBusinessesProps = {
  category: string;
};

export default function CategoryBusinesses({
  category,
}: CategoryBusinessesProps) {
  const {
    data: businesses,
    isLoading: loadingBusinesses,
    isError: errorBusinesses,
  } = useGetAllBusinessesQuery();
  const {
    data: reviews,
    isLoading: loadingReviews,
    isError: errorReviews,
  } = useGetReviewsQuery();

  if (loadingBusinesses || loadingReviews)
    return (
      <div>
        <p>Loading</p>
      </div>
    );
  if (errorBusinesses || errorReviews)
    return (
      <div>
        <p>"Failed to load data."</p>
      </div>
    );

  if (!businesses || !reviews) return null;

  // Normalize category string for matching (spaces vs dashes etc)
  const normalizedCategory = category.toLowerCase().replace(/-/g, " ");

  // Filter businesses by category
  const filteredBusinesses = businesses.filter(
    (b) =>
      Array.isArray(b.category) &&
      b.category.some((cat) => cat.toLowerCase() === normalizedCategory)
  );

  if (filteredBusinesses.length === 0)
    return (
      <p className="text-gray-500 italic">
        No businesses found in this category.
      </p>
    );

  return (
    <div className="space-y-10 md:ml-8">
      {filteredBusinesses.map((business) => {
        // Business reviews
        const businessReviews = reviews.filter(
          (r) => r.business?.businessId === business.businessId
        );

        return (
          <div
            key={business.businessId}
            className="border rounded-xl p-6 shadow"
          >
            {/* Business clickable card */}
            <Link
              href={`/business/${business.businessId}`}
              className="block hover:underline"
            >
              <BusinessCard business={business} />
            </Link>

            {/* Business Reviews */}
            {businessReviews.length > 0 && (
              <section className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Business Reviews</h3>
                <div className="space-y-4">
                  {businessReviews.map((review) => (
                    <ReviewCard
                      key={review.reviewId}
                      reviewId={review.reviewId}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Products */}
            {business.products?.length > 0 ? (
              <section className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Products</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {business.products.map((product) => {
                    // Reviews for this product
                    const productReviews = reviews.filter(
                      (r) => r.product?.productId === product.productId
                    );
                    return (
                      <div
                        key={product.productId}
                        className="border p-4 rounded shadow"
                      >
                        <ProductCard product={product} />

                        {/* Product reviews */}
                        {productReviews.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <h4 className="font-semibold">Reviews</h4>
                            {productReviews.map((review) => (
                              <ReviewCard
                                key={review.reviewId}
                                reviewId={review.reviewId}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : (
              <p className="mt-6 text-gray-500 italic">No products listed.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
