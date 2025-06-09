"use client";

import { useParams } from "next/navigation";
import { useGetCommentQuery } from "@/app/redux/services/commentApi";
import CommentCard from "@/app/components/ui/CommentCard";
import HorizontalLine from "@/app/components/ui/HorizontalLine";

export default function CommentDetailPage() {
  const { id } = useParams();
  const commentId = Number(id);

  const { data: comment, isLoading, isError } = useGetCommentQuery(commentId);

  if (isLoading) return <div>Loading comment...</div>;
  if (isError || !comment) return <div>Comment not found.</div>;

  return (
    <div className="w-full min-h-screen bg-background  text-text pt-24 p-96">
      <div className="px-8 py-5 border">
        <h1 className="text-3xl font-heading font-bold mb-3">
          Comment Details
        </h1>
        <HorizontalLine className="mb-3" />
        <CommentCard reviewId={comment.reviewId} comment={comment} />
      </div>
    </div>
  );
}
