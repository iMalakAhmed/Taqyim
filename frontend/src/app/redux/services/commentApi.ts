import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { CommentType, CreateCommentType } from "./types";
import { getTokenFromCookie } from "@/app/utils/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export const commentApi = createApi({
  reducerPath: "commentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/comment`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = getTokenFromCookie();
      console.log("Token:", token);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Comment"],
  endpoints: (builder) => ({
    getCommentsByReview: builder.query<CommentType[], number>({
      query: (reviewId) => `review/${reviewId}`,
      providesTags: (result, error, reviewId) =>
        result
          ? [
              ...result.map(({ commentId }) => ({
                type: "Comment" as const,
                id: commentId,
              })),
              { type: "Comment", id: `REVIEW_${reviewId}` },
            ]
          : [{ type: "Comment", id: `REVIEW_${reviewId}` }],
    }),
    getComment: builder.query<CommentType, number>({
      query: (commentId) => `${commentId}`,
      providesTags: (result, error, id) => [{ type: "Comment", id }],
    }),
    createComment: builder.mutation<CommentType, CreateCommentType>({
      query: (body) => ({
        url: "",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { reviewId }) => [
        { type: "Comment", id: `REVIEW_${reviewId}` },
      ],
    }),
    updateComment: builder.mutation<
      void,
      { id: number; data: CreateCommentType }
    >({
      query: ({ id, data }) => ({
        url: `${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Comment", id }],
    }),
    deleteComment: builder.mutation<void, number>({
      query: (id) => ({
        url: `${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Comment", id }],
    }),
  }),
});

export const {
  useGetCommentsByReviewQuery,
  useGetCommentQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = commentApi;
