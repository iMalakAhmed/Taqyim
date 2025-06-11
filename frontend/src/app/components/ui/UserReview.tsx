"use client";

import { useParams } from "next/navigation";
import { useGetReviewsQuery } from "@/app/redux/services/reviewApi";
import ReviewCard from "./ReviewCard";

export default function UserReviews() {
  const { id } = useParams();
  const userId = parseInt(id as string);
  const { data: reviews, error, isLoading } = useGetReviewsQuery();

  const userReviews = Array.isArray(reviews?.items)
    ? reviews.items.filter((review) => review.user.userId === userId)
    : [];

  return (
    <div className="mt-6 space-y-6">
      <h2 className="text-2xl font-bold">User's Reviews</h2>

      {userReviews && userReviews.length > 0 ? (
        userReviews.map((review) => (
          <ReviewCard key={review.reviewId} reviewId={review.reviewId} />
        ))
      ) : (
        <p className="text-gray-500">
          This user hasn't written any reviews yet.
        </p>
      )}
    </div>
  );
}
