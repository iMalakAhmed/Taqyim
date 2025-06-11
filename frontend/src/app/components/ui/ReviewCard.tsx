"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import HorizontalLine from "./HorizontalLine";
import { useGetCurrentUserQuery } from "../../redux/services/userApi";
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
  IconBookmark,
  IconBookmarkFilled,
  IconChevronRight,
  IconChevronLeft,
  IconX,
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
import FollowButton from "./FollowButton";
import MediaUpload, { getFullMediaUrl } from "../MediaUpload";
import {
  useSaveReviewMutation,
  useUnsaveReviewMutation,
  useGetSavedReviewsQuery,
} from "@/app/redux/services/savedReviewApi";
import SavedReviewButton from "./SavedReviewButton";
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
    refetch: refetchReview,
  } = useGetReviewQuery(reviewId);

  const { data: savedReviews = [] } = useGetSavedReviewsQuery(
    user?.userId ?? 0,
    {
      skip: !user?.userId,
    }
  );

  const isSaved = savedReviews.some((sr) => sr.reviewId === reviewId);
  const [saveReview] = useSaveReviewMutation();
  const [unsaveReview] = useUnsaveReviewMutation();

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
  const [media, setMedia] = useState(review?.media || []);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [isZoomed, setIsZoomed] = useState(false);

  // Helper function to safely access media
  const getMediaItems = () => review?.media || [];

  useEffect(() => {
    if (review) {
      setRating(review.rating);
      setComment(review.comment);
      setMedia(review.media ?? []);
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
      await updateReview({
        id: reviewId,
        data: {
          rating,
          comment,
          media: media.map((m) => ({
            mediaId: m.mediaId,
          })),
        },
      });
      await refetchReview();
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update review", error);
    }
  };

  const handleMediaUploadSuccess = async (mediaId: number) => {
    const res = await fetch(`/api/media/${mediaId}`);
    const newMedia = await res.json();
    setMedia((prev) => [...prev, newMedia]);
  };

  const handleMediaDeleteSuccess = (deletedId: number) => {
    setMedia((prev) => prev.filter((m) => m.mediaId !== deletedId));
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
          onClick={stopPropagation}
        >
          <Image
            src={
              review.user.profilePic && review.user.profilePic.trim() !== ""
                ? getFullMediaUrl(review.user.profilePic)
                : "/default-profile.jpg"
            }
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
            <FollowButton
              followingId={review.user.userId}
              followingType="User"
            />
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <HorizontalLine />
        <div className="flex flex-row items-center pt-3">
          <Link
            href={`/business/${review.business.businessId}`}
            onClick={stopPropagation}
            className="font-heading font-bold text-lg hover:underline"
          >
            {review.business.name}
          </Link>
          {review.product && (
            <Link
              href={`/product/${review.product.productId}`}
              onClick={stopPropagation}
              className="font-heading text-base pl-2 hover:underline"
            >
              - {review.product.name}
            </Link>
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
          <>
            <textarea
              className="w-full h-full border p-2 my-2 text-sm"
              value={comment}
              onClick={stopPropagation}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
            <div className="my-4">
              <MediaUpload
                existingMedia={media}
                reviewId={review.reviewId}
                onUploadSuccess={handleMediaUploadSuccess}
                onDeleteSuccess={handleMediaDeleteSuccess}
              />
            </div>
          </>
        ) : (
          <>
            {/* 📸 Media Grid */}
            {getMediaItems().length > 0 && (
              <div className="pb-3">
                <div
                  className={`grid gap-1 ${
                    getMediaItems().length === 1
                      ? "grid-cols-1"
                      : getMediaItems().length === 2
                      ? "grid-cols-2"
                      : "grid-cols-2"
                  }`}
                >
                  {getMediaItems()
                    .slice(0, 4)
                    .map((mediaItem, index) => (
                      <div
                        key={mediaItem.mediaId}
                        className={`relative overflow-hidden rounded cursor-pointer group h-32 w-full bg-black ${
                          getMediaItems().length === 3 && index === 2
                            ? "col-span-2"
                            : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageIndex(index);
                          setIsZoomed(false);
                        }}
                      >
                        <Image
                          src={getFullMediaUrl(mediaItem.filePath)}
                          alt={mediaItem.fileName || "Review media"}
                          fill
                          className="object-contain"
                        />

                        {/* <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                          <span className="text-white opacity-0 group-hover:opacity-100">
                            View
                          </span>
                        </div> */}

                        {index === 3 && getMediaItems().length > 4 && (
                          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                            <span className="text-white text-xl font-semibold">
                              +{getMediaItems().length - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 🖼️ Image Modal */}
            {selectedImageIndex !== null &&
              getMediaItems()[selectedImageIndex] && (
                <div
                  className="fixed inset-0 bg-opacity-90 z-50 flex items-center justify-center"
                  onClick={() => {
                    setSelectedImageIndex(null);
                    setIsZoomed(false);
                  }}
                >
                  <div
                    className="relative max-w-[90vw] max-h-[90vh] w-full h-full flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()} // prevent modal close on image click
                  >
                    {/* Close Button */}
                    <button
                      onClick={() => {
                        setSelectedImageIndex(null);
                        setIsZoomed(false);
                      }}
                      className="absolute top-4 right-4 text-text text-2xl z-50"
                    >
                      <IconX size={32} />
                    </button>

                    {/* Previous */}
                    <button
                      onClick={() => {
                        setSelectedImageIndex((prev) =>
                          prev !== null
                            ? (prev - 1 + getMediaItems().length) %
                              getMediaItems().length
                            : null
                        );
                        setIsZoomed(false);
                      }}
                      className="absolute left-4 p-2 text-text z-10"
                    >
                      <IconChevronLeft size={32} />
                    </button>

                    {/* Image Container */}
                    <div
                      className={`relative w-[80vw] h-[80vh] bg-black cursor-zoom-in`}
                      onClick={() => setIsZoomed((z) => !z)}
                    >
                      <Image
                        src={getFullMediaUrl(
                          getMediaItems()[selectedImageIndex].filePath
                        )}
                        alt={
                          getMediaItems()[selectedImageIndex].fileName ||
                          "Review media"
                        }
                        fill
                        className={`transition-transform duration-300 ${
                          isZoomed ? "object-cover scale-150" : "object-contain"
                        }`}
                      />
                    </div>

                    {/* Next */}
                    <button
                      onClick={() => {
                        setSelectedImageIndex((prev) =>
                          prev !== null
                            ? (prev + 1) % getMediaItems().length
                            : null
                        );
                        setIsZoomed(false);
                      }}
                      className="absolute right-4 p-2 text-text z-10"
                    >
                      <IconChevronRight size={32} />
                    </button>

                    {/* Counter */}
                    <div className="absolute bottom-4 left-0 right-0 text-center text-white">
                      {selectedImageIndex + 1} / {getMediaItems().length}
                    </div>
                  </div>
                </div>
              )}
          </>
        )}
        <HorizontalLine />
      </div>

      <div className="flex flex-row items-center justify-between pb-2">
        <div
          className="flex flex-row items-center gap-x-2"
          onClick={stopPropagation}
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

          <Button
  variant="none"
  size="sm"
  className="hover:text-secondary"
  disabled={isSaving}
  onClick={async (e) => {
    stopPropagation(e);
    if (isSaving) return; // prevent multiple clicks while saving

    setIsSaving(true);
    try {
      if (isSaved) {
        await unsaveReview({ reviewId, userId: user.userId }).unwrap();
      } else {
        await saveReview({ reviewId, userId: user.userId }).unwrap();
      }
    } catch (error) {
      console.error("Save/Unsave failed:", error);
    } finally {
      setIsSaving(false);
    }
  }}
>
  {isSaved ? <IconBookmarkFilled size={20} /> : <IconBookmark size={20} />}
</Button>





        </div>
        <div className="flex flex-row items-center font-body text-sm gap-2">
          <p>{reactionCount} reactions</p>
          <p>{commentCount} comments</p>
        </div>
      </div>
    </div>
  );
}