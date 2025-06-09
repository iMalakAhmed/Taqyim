"use client";

import { useParams } from "next/navigation";
import { useGetCommentQuery } from "@/app/redux/services/commentApi";
import CommentCard from "@/app/components/ui/CommentCard";

export default function CommentDetailPage() {
  const { id } = useParams();
  const commentId = Number(id);

  const { data: comment, isLoading, isError } = useGetCommentQuery(commentId);

  if (isLoading) return <div>Loading comment...</div>;
  if (isError || !comment) return <div>Comment not found.</div>;

  return (
    <div className="w-full min-h-screen pt-24 px-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Comment Details</h1>
      <CommentCard reviewId={comment.reviewId} comment={comment} />
    </div>
  );
}
