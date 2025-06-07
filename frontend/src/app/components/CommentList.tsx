"use client";

import React, { useState } from "react";
import {
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from "@/app/redux/services/commentApi";
import { CommentType } from "@/app/redux/services/types";
import { useDispatch } from "react-redux";
import { decrementCommentCount } from "@/app/redux/slices/commentCounterSlice";
import { useGetCurrentUserQuery } from "@/app/redux/services/authApi";

type CommentListProps = {
  reviewId: number;
  comments: CommentType[];
};

export default function CommentList({ reviewId, comments }: CommentListProps) {
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const [updateComment, { isLoading: isUpdating }] = useUpdateCommentMutation();
  const [deleteComment, { isLoading: isDeleting }] = useDeleteCommentMutation();
  const { data: currentUser } = useGetCurrentUserQuery();
  const dispatch = useDispatch();

  const handleEditClick = (comment: CommentType) => {
    setEditingCommentId(comment.commentId);
    setEditingContent(comment.content);
  };

  const handleUpdateComment = async () => {
    if (editingCommentId === null || !editingContent.trim()) return;
    try {
      await updateComment({
        id: editingCommentId,
        data: { reviewId, content: editingContent },
      }).unwrap();
      setEditingCommentId(null);
      setEditingContent("");
    } catch (error) {
      console.error("Failed to update comment", error);
    }
  };

  const handleDeleteComment = async (id: number) => {
    try {
      await deleteComment(id).unwrap();
      dispatch(decrementCommentCount(reviewId));
    } catch (error) {
      console.error("Failed to delete comment", error);
    }
  };

  return (
    <ul>
      {comments.map((comment) => {
        const isOwner = currentUser?.userId === comment.commenter.userId;

        return (
          <li key={comment.commentId} className="mb-4 border-b pb-2">
            <div className="flex justify-between items-center mb-1">
              <div>
                <strong>
                  {comment.commenter.firstName} {comment.commenter.lastName}
                </strong>{" "}
                <span className="text-gray-500 text-xs">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              {isOwner && (
                <div className="space-x-2">
                  {editingCommentId === comment.commentId ? (
                    <>
                      <button
                        className="text-green-600 hover:underline"
                        onClick={handleUpdateComment}
                        disabled={isUpdating}
                      >
                        Save
                      </button>
                      <button
                        className="text-gray-600 hover:underline"
                        onClick={() => setEditingCommentId(null)}
                        disabled={isUpdating}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => handleEditClick(comment)}
                    >
                      Edit
                    </button>
                  )}
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => handleDeleteComment(comment.commentId)}
                    disabled={isDeleting}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {editingCommentId === comment.commentId ? (
              <textarea
                className="w-full p-2 border rounded"
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                rows={3}
                disabled={isUpdating}
              />
            ) : (
              <p>{comment.content}</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
