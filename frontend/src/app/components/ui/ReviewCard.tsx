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
import {
  IconEdit,
  IconMessage,
  IconShare3,
  IconStar,
  IconStarFilled,
  IconTrash,
  IconTrashOff,
} from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { setReactionCount } from "@/app/redux/slices/reactionCounterSlice";
import { setCommentCount } from "@/app/redux/slices/commentCounterSlice";
import { RootState } from "../../redux/store";
import { usePathname, useRouter } from "next/navigation";
import StarRating from "./StarRating";
import Link from "next/link";
import CopyToClipboardButton from "./ShareButton";
import { formatTimestamp } from "./FormatTimeStamp";

type ReviewCardProps = {
  reviewId: number;
};

const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

export default function ReviewCard({ reviewId }: ReviewCardProps) {
  const router = useRouter();
  const pathname = usePathname();

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

  const [isEditing, setIsEditing] = useState(false);

  const [rating, setRating] = useState<number>(review?.rating || 0);
  const [comment, setComment] = useState<string>(review?.comment || "");

  useEffect(() => {
    if (review) {
      setRating(review.rating);
      setComment(review.comment);
      dispatch(setReactionCount({ reviewId, count: review.reactions.length }));
      dispatch(setCommentCount({ reviewId, count: review.comments.length }));
    }
  }, [dispatch, review, reviewId]);

  const handleReviewDelete = async () => {
    try {
      await deleteReview(reviewId).unwrap();
      if (pathname.startsWith("/reviews/")) {
        router.push("/home");
      }
    } catch (error) {
      console.error("Failed to delete review", error);
    }
  };

  const handleReviewUpdate = async () => {
    try {
      await updateReview({ id: reviewId, data: { rating, comment } }).unwrap();
    } catch (error) {
      console.error("Failed to update review", error);
    }
  };

  if (isUserLoading || isReviewLoading) return <div>Loading...</div>;
  if (userError || reviewError) return <div>Error loading review.</div>;
  if (!user || !review) return null;

  const isOwner = user.userId === review.userId;

  return (
    <div
      className="w-full flex flex-col gap-3 pt-5 px-8 text-text border hover:cursor-pointer"
      onClick={() => router.push(`/reviews/${reviewId}`)}
    >
      <div className="flex flex-row items-center">
        <Link
          href={`/profile/${review.user.userId}`}
          className="flex flex-row items-center"
          onClick={(e) => {
            stopPropagation(e);
          }}
        >
          <Image
            src={review.user.profilePic || "/default-profile.jpg"}
            width={80}
            height={80}
            alt="user profile"
            className="w-16 h-16"
          />
          <div className="flex flex-col px-5">
            <h1 className="font-heading font-bold text-xl">
              {review.user.userName}
            </h1>
            <span className="text-xs text-text font-body">
              {formatTimestamp(review.createdAt)}
            </span>
          </div>
        </Link>

        {isOwner ? (
          <div className="flex gap-2 ml-auto">
            {isEditing ? (
              <>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={async (e) => {
                    stopPropagation(e);
                    await handleReviewUpdate();
                    setIsEditing(false);
                  }}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Saving..." : "Save"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    stopPropagation(e);
                    setIsEditing(false);
                    setRating(review.rating);
                    setComment(review.comment);
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="none"
                  className="hover:text-primary"
                  onClick={(e) => {
                    stopPropagation(e);
                    setIsEditing(true);
                  }}
                >
                  <IconEdit size={20} />
                </Button>
                <Button
                  size="sm"
                  variant="none"
                  className="hover:text-accent"
                  onClick={(e) => {
                    stopPropagation(e);
                    handleReviewDelete();
                  }}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <IconTrashOff size={20} />
                  ) : (
                    <IconTrash size={20} />
                  )}
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="ml-auto">
            <Button
              size="md"
              variant="secondary"
              onClick={(e) => {
                stopPropagation(e);
              }}
            >
              Follow
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <HorizontalLine />
        <div className="flex flex-row items-center pt-3">
          <h1 className="font-heading font-bold text-lg">Business Name</h1>
          {review.productId && (
            <h2 className="font-heading text-base pl-2">- Product Name</h2>
          )}

          {isEditing ? (
            <div className="flex space-x-1 cursor-pointer px-3">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className="text-xl"
                  onClick={(e) => {
                    stopPropagation(e);
                    setRating(i + 1);
                  }}
                >
                  {i < rating ? (
                    <IconStarFilled className="text-primary" size={16} />
                  ) : (
                    <IconStar className="text-primary" size={16} />
                  )}
                </span>
              ))}
            </div>
          ) : (
            <StarRating rating={review.rating} />
          )}
        </div>

        {isEditing ? (
          <textarea
            className="w-full h-full border  p-2 my-2 text-sm"
            value={comment}
            onClick={(e) => {
              stopPropagation(e);
            }}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
        ) : (
          <p className="text-sm font-body pt-2 pb-3">{review.comment}</p>
        )}

        <HorizontalLine />
      </div>

      <div className="flex flex-row items-center justify-between pb-2">
        <div
          className="flex flex-row items-center gap-x-2"
          onClick={(e) => {
            stopPropagation(e);
          }}
        >
          <ReactionButtons
            reviewId={reviewId}
            reactionCount={review.reactions.length}
          />

          <Button
            variant="none"
            size="sm"
            className="hover:text-secondary"
            onClick={(e) => {
              stopPropagation(e);
              router.push(`/reviews/${reviewId}`);
            }}
          >
            <IconMessage size={20} />
          </Button>

          <CopyToClipboardButton
            copyText={`https://localhost:3000/reviews/${reviewId}`}
          >
            <IconShare3 size={20} className="hover:text-secondary" />
          </CopyToClipboardButton>
        </div>
        <div className="flex flex-row items-center font-body text-sm gap-2">
          <p>{reactionCount} reactions</p>
          <p>{commentCount} comments</p>
        </div>
      </div>
    </div>
  );
}
