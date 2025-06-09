"use client";

import React, { useState } from "react";
import { useCreateCommentMutation } from "@/app/redux/services/commentApi";
import { useDispatch } from "react-redux";
import { incrementCommentCount } from "@/app/redux/slices/commentCounterSlice";
import Button from "./ui/Button";

type AddCommentProps = {
  reviewId: number;
  parentCommentId?: number | null; // optional parent comment for replies
  onCancel: () => void;
};

export default function AddComment({
  reviewId,
  parentCommentId = null,
  onCancel,
}: AddCommentProps) {
  const [newContent, setNewContent] = useState("");
  const [createComment, { isLoading }] = useCreateCommentMutation();
  const dispatch = useDispatch();

  const handleAddComment = async () => {
    if (!newContent.trim()) return;
    try {
      await createComment({
        reviewId,
        content: newContent,
        parentCommentId,
      }).unwrap();
      setNewContent("");
      dispatch(incrementCommentCount(reviewId));
      onCancel();
    } catch (error) {
      console.error("Failed to add comment", error);
    }
  };

  return (
    <div className="mt-4 p-4 bg-background">
      <textarea
        className="w-full p-2 resize-none text-sm border hover:outline-none outline-none"
        placeholder={
          parentCommentId ? "Add your reply..." : "Add your comment..."
        }
        value={newContent}
        onChange={(e) => setNewContent(e.target.value)}
        rows={3}
        disabled={isLoading}
      />
      <div className="mt-2 flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleAddComment}
          disabled={isLoading || !newContent.trim()}
        >
          {isLoading
            ? "Adding..."
            : parentCommentId
            ? "Add Reply"
            : "Add Comment"}
        </Button>
      </div>
    </div>
  );
}
