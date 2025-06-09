"use client";

import { useParams } from "next/navigation";
import { useGetReviewQuery } from "@/app/redux/services/reviewApi";
import { useGetCurrentUserQuery } from "@/app/redux/services/authApi";

import AddComment from "@/app/components/AddComment";
import ReviewCard from "@/app/components/ui/ReviewCard";
import HorizontalLine from "@/app/components/ui/HorizontalLine";
import CommentList from "@/app/components/CommentList";

export default function ReviewDetailsPage() {
  const { id } = useParams();
  const reviewId = Number(id);

  const { data: review, isLoading: isReviewLoading } =
    useGetReviewQuery(reviewId);
  const { data: user, isLoading: isUserLoading } = useGetCurrentUserQuery();

  if (isReviewLoading || isUserLoading) return <div>Loading...</div>;
  if (!review || !user) return <div>Review not found.</div>;

  return (
    <div className="w-full min-h-screen pt-24 p-96">
      <ReviewCard reviewId={reviewId} />
      <div className="px-8 border">
        <AddComment reviewId={reviewId} onCancel={() => {}} />

        <div className="pt-4">
          <h2 className="text-xl pb-2 font-heading font-bold">Comments</h2>
          <HorizontalLine />
          <CommentList
            reviewId={reviewId}
            commentCount={review.comments.length}
          />
        </div>
      </div>
    </div>
  );
}
