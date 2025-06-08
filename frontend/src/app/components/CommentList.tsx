"use client";

import React, { useEffect } from "react";
import { useGetCommentsByReviewQuery } from "@/app/redux/services/commentApi";
import { useDispatch } from "react-redux";
import { setCommentCount } from "@/app/redux/slices/commentCounterSlice";
import CommentCard from "./ui/CommentCard";
import { setReplyCount } from "../redux/slices/replyCounterSlice";

type CommentListProps = {
  reviewId: number;
  commentCount: number;
};

export default function CommentList({
  reviewId,
  commentCount,
}: CommentListProps) {
  const {
    data: comments,
    isLoading,
    isError,
  } = useGetCommentsByReviewQuery(reviewId);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setCommentCount({ reviewId, count: commentCount }));
  }, [dispatch, commentCount, reviewId]);

  useEffect(() => {
    if (comments) {
      comments.forEach((comment) => {
        dispatch(
          setReplyCount({
            commentId: comment.commentId,
            count: comment.replies?.filter((r) => !r.isDeleted).length ?? 0,
          })
        );
      });
    }
  }, [dispatch, comments]);

  if (isLoading) return <div>Loading comments...</div>;
  if (isError) return <div>Error loading comments.</div>;

  return (
    <ul>
      {comments?.map((comment) => (
        <CommentCard
          key={comment.commentId}
          reviewId={reviewId}
          comment={comment}
        />
      ))}
    </ul>
  );
}
