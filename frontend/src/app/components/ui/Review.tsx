"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import HorizontalLine from "./HorizontalLine";
import { useGetCurrentUserQuery } from "../../redux/services/authApi";
import {
  useGetReviewQuery,
  useDeleteReviewMutation,
  useUpdateReviewMutation,
} from "../../redux/services/reviewApi";
import ReactionButtons from "../ReactionButtons";
import Button from "./Button";
import Comments from "./Comment";

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

  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation();
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [rating, setRating] = useState<number>(review?.rating || 0);
  const [comment, setComment] = useState<string>(review?.comment || "");

  useEffect(() => {
    if (review) {
      setRating(review.rating);
      setComment(review.comment);
    }
  }, [review]);

  const handleReviewDelete = async () => {
    try {
      await deleteReview(reviewId).unwrap();
    } catch (error) {
      console.error("Failed to delete review", error);
    }
  };

  const handleReviewUpdate = async () => {
    try {
      await updateReview({ id: reviewId, data: { rating, comment } }).unwrap();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to update review", error);
    }
  };

  function StarRating({ rating }: { rating: number }) {
    return (
      <div className="flex space-x-1 text-yellow-500 cursor-pointer">
        {[...Array(5)].map((_, i) => (
          <span key={i}>{i < rating ? "★" : "☆"}</span>
        ))}
      </div>
    );
  }

  if (isUserLoading || isReviewLoading) return <div>Loading...</div>;
  if (userError || reviewError) return <div>Error loading review.</div>;
  if (!user || !review) return null;

  // Check if logged-in user is the owner of the review
  // Adjust the field `review.userId` if your API uses a different property
  const isOwner = user.userId === review.userId;

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

        {isOwner && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="primary"
              onClick={handleReviewDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Review"}
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsModalOpen(true)}
            >
              Update Review
            </Button>
          </div>
        )}

        <ReactionButtons
          reviewId={reviewId}
          reactionCount={review.reactions.length}
        />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
            <h2 className="text-xl font-bold mb-4">Update Review</h2>

            <label className="block mb-2">
              Rating:
              <div className="flex space-x-1 text-yellow-500 cursor-pointer">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className="text-2xl"
                    onClick={() => setRating(i + 1)}
                  >
                    {i < rating ? "★" : "☆"}
                  </span>
                ))}
              </div>
            </label>

            <label className="block mb-4">
              Comment:
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 mt-1"
                rows={4}
              />
            </label>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleReviewUpdate}
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update"}
              </Button>
            </div>
          </div>
        </div>
      )}
      <Comments reviewId={reviewId} commentCount={review.comments.length} />
    </div>
  );
}
