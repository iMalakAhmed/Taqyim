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
import {
  IconEdit,
  IconMessage,
  IconMessageFilled,
  IconShare3,
  IconTrash,
} from "@tabler/icons-react";
import Button from "./Button";
import CommentReactionButtons from "../CommentReactionButtons";
import AddComment from "../AddComment";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CopyToClipboardButton from "./ShareButton";
import Image from "next/image";
import { formatTimestamp } from "./FormatTimeStamp";
import FollowButton from "./FollowButton";
import { getFullMediaUrl } from "../MediaUpload";

type CommentProps = {
  reviewId: number;
  comment: CommentType;
};

const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

export default function CommentCard({ reviewId, comment }: CommentProps) {
  const router = useRouter();
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
    <li
      className="mb-6 border-b pb-4 text-text list-none"
      onClick={() => router.push(`/comments/${comment.commentId}`)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-row py-2">
          {!deleted && (
            <Link
              className="flex flex-row"
              href={`/profile?id=${comment.commenterId}`}
              onClick={(e) => {
                stopPropagation(e);
              }}
            >
              <Image
                src={
                  comment.commenter.profilePic &&
                  comment.commenter.profilePic.trim() !== ""
                    ? getFullMediaUrl(comment.commenter.profilePic)
                    : "/default-profile.jpg"
                }
                width={64}
                height={64}
                alt="user profile"
                className="w-12 h-12"
              />
              <div className="flex flex-col justify-center px-5">
                <strong className="">{comment.commenter.userName}</strong>{" "}
                <span className="font-body text-xs text-">
                  {formatTimestamp(comment.createdAt)}
                </span>
              </div>
            </Link>
          )}
        </div>

        {!deleted && (
          <>
            {isOwner ? (
              <div className="space-x-2 flex items-center">
                {editing ? (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        stopPropagation(e);
                        handleSave();
                      }}
                      disabled={isUpdating}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        stopPropagation(e);
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
                      onClick={(e) => {
                        stopPropagation(e);
                        setContent(comment.content);
                        setEditing(true);
                      }}
                      aria-label="Edit comment"
                    >
                      <IconEdit size={20} />
                    </Button>
                    <Button
                      variant="none"
                      size="sm"
                      className="hover:text-accent"
                      onClick={(e) => {
                        stopPropagation(e);
                        handleDelete();
                      }}
                      disabled={isDeleting}
                      aria-label="Delete comment"
                    >
                      <IconTrash size={20} />
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <FollowButton
                followingId={comment.commenterId}
                followingType="User"
              />
            )}
          </>
        )}
      </div>

      {editing ? (
        <textarea
          className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          disabled={isUpdating}
          onClick={(e) => {
            stopPropagation(e);
          }}
        />
      ) : (
        <p
          className={deleted ? "italic text-gray-400" : " whitespace-pre-wrap"}
        >
          {content}
        </p>
      )}

      {!deleted && (
        <div
          className="mt-1 flex flex-row items-center justify-between space-x-4 text-sm"
          onClick={(e) => {
            stopPropagation(e);
          }}
        >
          <div className="flex flex-row items-center">
            <CommentReactionButtons
              commentId={comment.commentId}
              reactionCount={comment.reactions?.length ?? 0}
            />

            <Button
              size="sm"
              variant="none"
              className="hover:text-secondary"
              onClick={(e) => {
                stopPropagation(e);
                setReplying(!replying);
              }}
              aria-expanded={replying}
              aria-controls={`reply-form-${comment.commentId}`}
            >
              {replying ? (
                <IconMessageFilled size={20} />
              ) : (
                <IconMessage size={20} />
              )}
            </Button>
            <CopyToClipboardButton
              copyText={`https://localhost:3000/comments/${comment.commentId}`}
            >
              <IconShare3 size={20} className="hover:text-secondary" />
            </CopyToClipboardButton>
          </div>
          <div className="flex flex-row gap-x-5 hover:cursor-pointer">
            <span>
              {reactionCount} reaction{reactionCount !== 1 ? "s" : ""}
            </span>
            <span>
              {replyCount} repl{replyCount !== 1 ? "ies" : "y"}
            </span>
          </div>
        </div>
      )}

      {replying && (
        <div
          id={`reply-form-${comment.commentId}`}
          className="mt-3"
          onClick={(e) => {
            stopPropagation(e);
          }}
        >
          <AddComment
            reviewId={reviewId}
            parentCommentId={comment.commentId}
            onCancel={() => setReplying(false)}
          />
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <ul className="ml-6 border-l pl-4 mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <li
              key={reply.commentId}
              onClick={(e) => {
                stopPropagation(e);
                router.push(`/comments/${reply.commentId}`);
              }}
              className="cursor-pointer"
            >
              <CommentCard reviewId={reviewId} comment={reply} />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
