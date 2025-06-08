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
    <li className="mb-4 border-b pb-2">
      <div className="flex justify-between items-center mb-1">
        <div>
          {!deleted && (
            <>
              <strong>
                {comment.commenter.firstName} {comment.commenter.lastName}
              </strong>{" "}
              <span className="text-gray-500 text-xs">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </>
          )}

          {!deleted && (
            <>
              <CommentReactionButtons
                commentId={comment.commentId}
                reactionCount={comment.reactions?.length ?? 0}
              />
              <p>{reactionCount} reactions</p>
              {!deleted && <p>{replyCount} replies</p>}
            </>
          )}
        </div>

        {isOwner && !deleted && (
          <div className="space-x-2 flex flex-row items-center">
            {editing ? (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  disabled={isUpdating}
                >
                  save
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
                  cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="none"
                  className="hover:text-primary"
                  size="sm"
                  onClick={() => setEditing(true)}
                >
                  <IconEdit size={20} />
                </Button>
                <Button
                  variant="none"
                  size="sm"
                  className="hover:text-accent"
                  onClick={handleDelete}
                  disabled={isDeleting}
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
          className="w-full p-2 border rounded"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          disabled={isUpdating}
        />
      ) : (
        <p className={deleted ? "italic text-gray-500" : ""}>{content}</p>
      )}

      {!deleted && (
        <div className="mt-1">
          <button
            className="text-sm text-primary hover:underline"
            onClick={() => setReplying(!replying)}
          >
            {replying ? "Cancel Reply" : "Reply"}
          </button>
        </div>
      )}

      {replying && (
        <AddComment
          reviewId={reviewId}
          parentCommentId={comment.commentId}
          onCancel={() => setReplying(false)}
        />
      )}

      {comment.replies && comment.replies.length > 0 && (
        <ul className="ml-6 border-l pl-4 mt-2">
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
