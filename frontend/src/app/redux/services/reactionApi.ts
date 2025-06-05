// redux/services/reactionApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { CreateReactionDTO, ReactionDTO } from "./dtos";

export const reactionApi = createApi({
  reducerPath: "reactionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers, { getState }: any) => {
      const token = getState().auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    reactToReview: builder.mutation<ReactionDTO | null, CreateReactionDTO>({
      query: (body) => ({
        url: "/reaction",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useReactToReviewMutation } = reactionApi;
