// redux/services/reactionApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { CreateReactionType, ReactionType } from "./types";
import { getTokenFromCookie } from "@/app/utils/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export const reactionApi = createApi({
  reducerPath: "reactionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = getTokenFromCookie();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Reaction"], // <-- Add this line
  endpoints: (builder) => ({
    reactToReview: builder.mutation<ReactionType | null, CreateReactionType>({
      query: (body) => ({
        url: "/reaction",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Reaction", id: "LIST" }],
    }),
    getUserReactionForReview: builder.query<ReactionType | null, number>({
      query: (reviewId) => `/reaction/review/${reviewId}/user`,
      providesTags: [{ type: "Reaction", id: "LIST" }],
    }),

    deleteReaction: builder.mutation<void, number>({
      query: (id) => ({
        url: `/reaction/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Reaction", id: "LIST" }],
    }),
  }),
});

export const {
  useReactToReviewMutation,
  useGetUserReactionForReviewQuery,
  useDeleteReactionMutation,
} = reactionApi;
