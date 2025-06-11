"use client";

import { IconBookmark, IconBookmarkFilled } from "@tabler/icons-react";
import { useSaveReviewMutation, useUnsaveReviewMutation, useGetSavedReviewsQuery } from "@/app/redux/services/savedReviewApi";
import { useGetCurrentUserQuery } from "@/app/redux/services/userApi";
import { useState } from "react";
import Button from "./Button";

type Props = {
  reviewId: number;
};

export default function SavedReviewButton({ reviewId }: Props) {
  const { data: user } = useGetCurrentUserQuery();
  const userId = user?.userId;

  const {
    data: savedReviews = [],
    isLoading: isSavedLoading,
  } = useGetSavedReviewsQuery(userId ?? 0, {
    skip: !userId,
  });

  const [saveReview] = useSaveReviewMutation();
  const [unsaveReview] = useUnsaveReviewMutation();

  const [localSaved, setLocalSaved] = useState(false);
  const isSaved = savedReviews.some((r) => r.reviewId === reviewId) || localSaved;

  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId || isProcessing) return;

    setIsProcessing(true);
    try {
      if (isSaved) {
        await unsaveReview({ reviewId, userId }).unwrap();
        setLocalSaved(false);
      } else {
        await saveReview({ reviewId, userId }).unwrap();
        setLocalSaved(true);
      }
    } catch (err) {
      console.error("Failed to toggle saved review:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      variant="none"
      size="sm"
      className="hover:text-secondary"
      onClick={handleClick}
      disabled={isProcessing || isSavedLoading}
    >
      {isProcessing ? (
        <span className="text-xs animate-pulse">...</span>
      ) : isSaved ? (
        <IconBookmarkFilled size={20} />
      ) : (
        <IconBookmark size={20} />
      )}
    </Button>
  );
}
