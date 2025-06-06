"use client";

import Image from "next/image";
import HorizontalLine from "./HorizontalLine";
import {
  useGetCurrentUserQuery,
  CurrentUserResponse,
} from "../../redux/services/authApi";
import { useGetReviewsQuery } from "../../redux/services/reviewApi";

export default function Review() {
  const {
    data: user,
    isLoading: isUserLoading,
    error: userError,
  } = useGetCurrentUserQuery();

  const {
    data: reviews,
    isLoading: isReviewsLoading,
    error: reviewsError,
  } = useGetReviewsQuery(user ? { userId: user.userId } : undefined, {
    skip: !user,
  });

  function StarRating({ rating }: { rating: number }) {
    return (
      <div className="flex space-x-1 text-yellow-500">
        {[...Array(5)].map((_, i) => (
          <span key={i}>{i < rating ? "★" : "☆"}</span>
        ))}
      </div>
    );
  }

  if (isUserLoading) return <div>Loading user profile...</div>;
  if (userError) return <div>Error loading user profile.</div>;
  if (!user) return null;

  return (
    <div className="w-full h-full flex flex-col gap-6 p-10 text-text">
      <div className="flex flex-row">
        <Image
          src="/default-profile.jpg"
          width={80}
          height={80}
          alt="user profile"
          className="rounded-full w-20 h-20"
        />
        <div className="flex flex-col py-2 px-5">
          <h1 className="font-heading text-2xl">
            {user.firstName} {user.lastName}
          </h1>

          <HorizontalLine className="w-96" />
        </div>
      </div>

      {isReviewsLoading && <p>Loading reviews...</p>}
      {reviewsError && <p>Error loading reviews.</p>}
      {reviews?.length === 0 && <p>No reviews found.</p>}

      {reviews?.map((review) => (
        <div
          key={review.reviewId}
          className="border rounded p-5 space-y-3 bg-white shadow"
        >
          <div className="flex justify-between items-center">
            <StarRating rating={review.rating} />
            <span className="text-xs text-gray-500">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}
