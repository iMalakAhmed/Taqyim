"use client";
import { useGetReviewsQuery } from "../redux/services/reviewApi";
import Review from "./ui/ReviewCard";

export default function Feed() {
  const { data: reviews, error, isLoading, isSuccess } = useGetReviewsQuery();

  if (isLoading) return <p>Loading reviews...</p>;
  if (error) return <p>Failed to load reviews.</p>;

  return (
    <div className="w-screen shadow-lg">
      {isSuccess && reviews?.length === 0 && <p>No reviews found.</p>}
      {isSuccess &&
        reviews?.map((review) => (
          <Review key={review.reviewId} reviewId={review.reviewId} />
        ))}
    </div>
  );
}
