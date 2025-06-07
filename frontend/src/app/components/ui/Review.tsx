"use client";

import Image from "next/image";
import HorizontalLine from "./HorizontalLine";
import { useGetCurrentUserQuery } from "../../redux/services/authApi";
import { useGetReviewQuery } from "../../redux/services/reviewApi";
import ReactionButtons from "../ReactionButtons";
import MediaUpload from "../MediaUpload";

type ReviewCardProps = {
  reviewId: number;
};

export default function ReviewCard({ reviewId }: ReviewCardProps) {
  const {
    data: user,
    isLoading: isUserLoading,
    error: userError,
  } = useGetCurrentUserQuery();

  const {
    data: review,
    isLoading: isReviewLoading,
    error: reviewError,
  } = useGetReviewQuery(reviewId);

  function StarRating({ rating }: { rating: number }) {
    return (
      <div className="flex space-x-1 text-yellow-500">
        {[...Array(5)].map((_, i) => (
          <span key={i}>{i < rating ? "★" : "☆"}</span>
        ))}
      </div>
    );
  }

  if (isUserLoading || isReviewLoading) return <div>Loading...</div>;
  if (userError || reviewError) return <div>Error loading review.</div>;
  if (!user || !review) return null;

  return (
    <div className="w-full flex flex-col gap-6 p-10 text-text border">
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

      <div className="p-5 space-y-3">
        <div className="flex justify-between items-center">
          <StarRating rating={review.rating} />
          <span className="text-xs text-gray-500">
            {new Date(review.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="text-sm">{review.comment}</p>
        <ReactionButtons reviewId={reviewId} />
        <MediaUpload />
      </div>
    </div>
  );
}
