"use client";

import React, { useEffect } from "react";
import { useGetCommentsByReviewQuery } from "@/app/redux/services/commentApi";
import { useDispatch } from "react-redux";
import { setCommentCount } from "@/app/redux/slices/commentCounterSlice";
import CommentList from "../CommentList";

type CommentsProps = {
  reviewId: number;
  commentCount: number;
};

export default function Comments({ reviewId, commentCount }: CommentsProps) {
  const {
    data: comments,
    isLoading,
    isError,
  } = useGetCommentsByReviewQuery(reviewId);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setCommentCount({ reviewId, count: commentCount }));
  }, [dispatch, commentCount, reviewId]);

  if (isLoading) return <div>Loading comments...</div>;
  if (isError) return <div>Error loading comments.</div>;

  return (
    <div className="comments-section">
      {comments && <CommentList reviewId={reviewId} comments={comments} />}
    </div>
  );
}
