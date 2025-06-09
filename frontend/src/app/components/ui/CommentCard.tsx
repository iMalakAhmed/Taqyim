"use client";

import { useState, useEffect } from "react";
import {
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from "@/app/redux/services/commentApi";
import { CommentType } from "@/app/redux/services/types";
import { useDispatch, useSelector } from "react-redux";
import { decrementCommentCount } from "@/app/redux/slices/commentCounterSlice";
import { useGetCurrentUserQuery } from "@/app/redux/services/authApi";
import { setReactionCount } from "@/app/redux/slices/commentReactionCounterSlice";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import Button from "./Button";
import CommentReactionButtons from "../CommentReactionButtons";
import AddComment from "../AddComment";

type CommentProps = {
  reviewId: number;
  comment: CommentType;
};

export default function CommentCard({ reviewId, comment }: CommentProps) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(
    comment.isDeleted ? "[deleted]" : comment.content
  );
  const [replying, setReplying] = useState(false);
  const [deleted, setDeleted] = useState(comment.isDeleted);

  const [updateComment, { isLoading: isUpdating }] = useUpdateCommentMutation();
  const [deleteComment, { isLoading: isDeleting }] = useDeleteCommentMutation();
  const { data: currentUser } = useGetCurrentUserQuery();
  const dispatch = useDispatch();

  const reactionCount = useSelector(
    (state: any) => state.commentReactionCounter[comment.commentId] ?? 0
  );

  useEffect(() => {
    dispatch(
      setReactionCount({
        commentId: comment.commentId,
        count: comment.reactions?.length ?? 0,
      })
    );
  }, [dispatch, comment.commentId, comment.reactions?.length]);

  const isOwner = currentUser?.userId === comment.commenter.userId;

  const handleSave = async () => {
    if (!content.trim()) return;

    try {
      await updateComment({
        id: comment.commentId,
        data: { reviewId, content },
      }).unwrap();
      setEditing(false);
    } catch (error) {
      console.error("Failed to update comment", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComment(comment.commentId).unwrap();
      setContent("[deleted]");
      setDeleted(true);
      dispatch(decrementCommentCount(reviewId));
    } catch (error) {
      console.error("Failed to delete comment", error);
    }
  };
  const replyCount = useSelector(
    (state: any) => state.replyCounter[comment.commentId] ?? 0
  );

  return (
    <li className="mb-6 border-b border-gray-200 pb-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          {!deleted && (
            <>
              <strong className="text-gray-900">
                {comment.commenter.userName}
              </strong>{" "}
              <span className="text-gray-500 text-xs ml-2">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </>
          )}

          {!deleted && (
            <div className="mt-1 flex items-center space-x-4 text-gray-600 text-sm">
              <CommentReactionButtons
                commentId={comment.commentId}
                reactionCount={comment.reactions?.length ?? 0}
              />
              <span>
                {reactionCount} reaction{reactionCount !== 1 ? "s" : ""}
              </span>
              <span>
                {replyCount} repl{replyCount !== 1 ? "ies" : "y"}
              </span>
            </div>
          )}
        </div>

        {isOwner && !deleted && (
          <div className="space-x-2 flex items-center">
            {editing ? (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  disabled={isUpdating}
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setContent(comment.content);
                    setEditing(false);
                  }}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="none"
                  className="hover:text-primary"
                  size="sm"
                  onClick={() => setEditing(true)}
                  aria-label="Edit comment"
                >
                  <IconEdit size={20} />
                </Button>
                <Button
                  variant="none"
                  size="sm"
                  className="hover:text-accent"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  aria-label="Delete comment"
                >
                  <IconTrash size={20} />
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {editing ? (
        <textarea
          className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          disabled={isUpdating}
        />
      ) : (
        <p
          className={
            deleted
              ? "italic text-gray-400"
              : "text-gray-800 whitespace-pre-wrap"
          }
        >
          {content}
        </p>
      )}

      {!deleted && (
        <div className="mt-2">
          <button
            className="text-sm text-primary hover:underline focus:outline-none"
            onClick={() => setReplying(!replying)}
            aria-expanded={replying}
            aria-controls={`reply-form-${comment.commentId}`}
          >
            {replying ? "Cancel Reply" : "Reply"}
          </button>
        </div>
      )}

      {replying && (
        <div id={`reply-form-${comment.commentId}`} className="mt-3">
          <AddComment
            reviewId={reviewId}
            parentCommentId={comment.commentId}
            onCancel={() => setReplying(false)}
          />
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <ul className="ml-6 border-l border-gray-300 pl-4 mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.commentId}
              reviewId={reviewId}
              comment={reply}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
