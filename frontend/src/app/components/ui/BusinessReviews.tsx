"use client";

import { useParams } from "next/navigation";
import { useGetReviewsQuery } from "@/app/redux/services/reviewApi";
import ReviewCard from "./ReviewCard";

export default function UserReviews() {
  const { id } = useParams();
  const businessId = parseInt(id as string);
  const { data: reviews, error, isLoading } = useGetReviewsQuery();

  const businessReviews = reviews?.filter((review) => review.business.businessId === businessId);

  return (
    <div className="mt-6 space-y-6">
      <h2 className="text-2xl font-bold">User's Reviews</h2>

      {businessReviews && businessReviews.length > 0 ? (
        businessReviews.map((review) => (
          <ReviewCard key={review.reviewId} reviewId={review.reviewId} />
        ))
      ) : (
        <p className="text-gray-500">This user hasn't written any reviews yet.</p>
      )}
    </div>
  );
}