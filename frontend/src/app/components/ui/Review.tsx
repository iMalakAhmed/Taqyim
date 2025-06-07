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
import {
  IconMessage,
  IconShare3,
  IconStar,
  IconStarFilled,
} from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { setReactionCount } from "@/app/redux/slices/reactionCounterSlice";
import { setCommentCount } from "@/app/redux/slices/commentCounterSlice";
import { RootState } from "../../redux/store";

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

  const dispatch = useDispatch();
  const reactionCount = useSelector(
    (state: RootState) => state.reactionCounter[reviewId] || 0
  );

  const commentCount = useSelector(
    (state: RootState) => state.commentCounter[reviewId] || 0
  );

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

  useEffect(() => {
    if (review) {
      dispatch(setReactionCount({ reviewId, count: review.reactions.length }));
      dispatch(setCommentCount({ reviewId, count: review.comments.length }));
    }
  }, [dispatch, review, reviewId]);

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
      <div className="flex space-x-1 cursor-pointer px-3">
        {[...Array(5)].map((_, i) => (
          <span key={i}>
            {i < rating ? (
              <IconStarFilled className="text-primary" size={18} />
            ) : (
              <IconStar className="text-primary" size={18} />
            )}
          </span>
        ))}
      </div>
    );
  }

  if (isUserLoading || isReviewLoading) return <div>Loading...</div>;
  if (userError || reviewError) return <div>Error loading review.</div>;
  if (!user || !review) return null;

  const isOwner = user.userId === review.userId;

  return (
    <div className="w-full flex flex-col gap-4 px-10 py-8 text-text border">
      <div className="flex flex-row items-center">
        <Image
          src="/default-profile.jpg"
          width={80}
          height={80}
          alt="user profile"
          className="w-20 h-20"
        />
        <div className="flex flex-col px-5">
          <h1 className="font-heading font-bold text-2xl">
            {user.firstName} {user.lastName}
          </h1>
          <span className="text-sm text-text font-inter">
            {new Date(review.createdAt)
              .toLocaleDateString("en-UK", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
              .toUpperCase()}
          </span>
        </div>
      </div>
      <div className="flex flex-col">
        <HorizontalLine />
        <div className="flex flex-row items-center pt-5">
          <h1 className="font-heading font-bold text-xl">Business Name</h1>
          <StarRating rating={review.rating} />
        </div>

        <p className="text-base font-body pt-2 pb-5">{review.comment}</p>
        <HorizontalLine />
      </div>
      {/* {isOwner && (
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
        )} */}
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center">
          <ReactionButtons
            reviewId={reviewId}
            reactionCount={review.reactions.length}
          />
          <Button variant="none" size="sm">
            <IconMessage size={20} />
          </Button>
          <Button variant="none" size="sm">
            <IconShare3 size={20} />
          </Button>
        </div>
        <div className="flex flex-row items-center font-body text-sm gap-2">
          <p>{reactionCount} reactions</p>
          <p>{commentCount} comments</p>
        </div>
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
