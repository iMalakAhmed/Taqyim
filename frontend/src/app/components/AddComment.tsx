"use client";

import React, { useState } from "react";
import { useCreateCommentMutation } from "@/app/redux/services/commentApi";
import { useDispatch } from "react-redux";
import { incrementCommentCount } from "@/app/redux/slices/commentCounterSlice";

type AddCommentProps = {
  reviewId: number;
  onCancel: () => void;
};

export default function AddComment({ reviewId, onCancel }: AddCommentProps) {
  const [newContent, setNewContent] = useState("");
  const [createComment, { isLoading }] = useCreateCommentMutation();
  const dispatch = useDispatch();

  const handleAddComment = async () => {
    if (!newContent.trim()) return;
    try {
      await createComment({ reviewId, content: newContent }).unwrap();
      setNewContent("");
      dispatch(incrementCommentCount(reviewId));
      onCancel(); // close modal after successful add
    } catch (error) {
      console.error("Failed to add comment", error);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-text bg-opacity-50 flex justify-center items-center z-50"
      onClick={onCancel} // close modal when clicking outside content
    >
      <div
        className="bg-background rounded-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
      >
        <textarea
          className="w-full p-2 border rounded resize-none"
          placeholder="Add your comment..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          rows={4}
          disabled={isLoading}
        />
        <div className="mt-4 flex justify-end space-x-3">
          <button
            className="px-4 py-2 rounded border border-text hover:bg-gray-100"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            onClick={handleAddComment}
            disabled={isLoading || !newContent.trim()}
          >
            {isLoading ? "Adding..." : "Add Comment"}
          </button>
        </div>
      </div>
    </div>
  );
}
