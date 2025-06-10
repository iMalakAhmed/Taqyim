import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CommentReactionType, CreateCommentReactionType } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export const commentReactionApi = createApi({
  reducerPath: "commentReactionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/CommentReaction`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = sessionStorage.getItem('token');
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["CommentReaction"],
  endpoints: (builder) => ({
    getReactionsByComment: builder.query<CommentReactionType[], number>({
      query: (commentId) => `comment/${commentId}`,
      providesTags: (result, error, commentId) =>
        result
          ? [
              ...result.map(({ commentReactionId }) => ({
                type: "CommentReaction" as const,
                id: commentReactionId,
              })),
              { type: "CommentReaction", id: `COMMENT_${commentId}` },
            ]
          : [{ type: "CommentReaction", id: `COMMENT_${commentId}` }],
    }),

    getReactionById: builder.query<CommentReactionType, number>({
      query: (id) => `${id}`,
      providesTags: (result, error, id) => [{ type: "CommentReaction", id }],
    }),

    createReaction: builder.mutation<
      CommentReactionType,
      CreateCommentReactionType
    >({
      query: (body) => ({
        url: "",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { commentId }) => [
        { type: "CommentReaction", id: `COMMENT_${commentId}` },
      ],
    }),

    deleteReaction: builder.mutation<void, number>({
      query: (id) => ({
        url: `${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "CommentReaction", id }],
    }),

    getUserReactionForComment: builder.query<
      CommentReactionType | null,
      number
    >({
      query: (commentId) => `comment/${commentId}/user`,
      providesTags: (result, error, commentId) => [
        { type: "CommentReaction", id: `USER_COMMENT_${commentId}` },
      ],
      // If no data, return null
      transformResponse: (response: CommentReactionType) => response ?? null,
    }),
  }),
});

export const {
  useGetReactionsByCommentQuery,
  useGetReactionByIdQuery,
  useCreateReactionMutation,
  useDeleteReactionMutation,
  useGetUserReactionForCommentQuery,
} = commentReactionApi;
