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
  endpoints: (builder) => ({
    reactToReview: builder.mutation<ReactionType | null, CreateReactionType>({
      query: (body) => ({
        url: "/reaction",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useReactToReviewMutation } = reactionApi;
