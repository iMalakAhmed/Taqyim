"use client";

import React, { useState } from "react";
import {
  useGetCommentsByReviewQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from "../../redux/services/commentApi";
import { useGetCurrentUserQuery } from "../../redux/services/authApi";
import { CommentType } from "@/app/redux/services/types";

type CommentsProps = {
  reviewId: number;
};

export default function Comments({ reviewId }: CommentsProps) {
  const {
    data: comments,
    isLoading,
    isError,
  } = useGetCommentsByReviewQuery(reviewId);

  const {
    data: currentUser,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useGetCurrentUserQuery();

  const [createComment, { isLoading: isCreating }] = useCreateCommentMutation();
  const [updateComment, { isLoading: isUpdating }] = useUpdateCommentMutation();
  const [deleteComment, { isLoading: isDeleting }] = useDeleteCommentMutation();

  const [newContent, setNewContent] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const handleAddComment = async () => {
    if (!newContent.trim()) return;
    try {
      await createComment({ reviewId, content: newContent }).unwrap();
      setNewContent("");
    } catch (error) {
      console.error("Failed to add comment", error);
    }
  };

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
    } catch (error) {
      console.error("Failed to delete comment", error);
    }
  };

  if (isLoading || isUserLoading) return <div>Loading comments...</div>;
  if (isError || isUserError) return <div>Error loading comments.</div>;

  return (
    <div className="comments-section">
      <h2 className="text-xl font-bold mb-4">Comments</h2>

      {/* Add new comment */}
      <div className="mb-6">
        <textarea
          className="w-full p-2 border rounded"
          placeholder="Add your comment..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          rows={3}
          disabled={isCreating}
        />
        <button
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          onClick={handleAddComment}
          disabled={isCreating || !newContent.trim()}
        >
          {isCreating ? "Adding..." : "Add Comment"}
        </button>
      </div>

      {/* Comments list */}
      <ul>
        {comments?.map((comment) => {
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
                <div className="space-x-2">
                  {/* Show buttons only if current user is owner */}
                  {isOwner && (
                    <>
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
                    </>
                  )}
                </div>
              </div>

              {/* Comment content or edit textarea */}
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
    </div>
  );
}
