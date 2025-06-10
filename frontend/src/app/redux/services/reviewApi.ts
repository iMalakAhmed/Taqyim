import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  ReviewType,
  CreateReviewType,
  UpdateReviewType,
  CommentType,
  CreateCommentType,
  ReactionType,
  CreateReactionType,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export const reviewApi = createApi({
  reducerPath: "reviewApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/review`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = sessionStorage.getItem('token');
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Reviews", "Review", "Comments", "Reactions"],
  endpoints: (build) => ({
    getReviews: build.query<
      ReviewType[],
      { businessId?: number; userId?: number } | void
    >({
      query: (params) => {
        const queryString = new URLSearchParams();
        if (params?.businessId)
          queryString.append("businessId", params.businessId.toString());
        if (params?.userId)
          queryString.append("userId", params.userId.toString());
        return `?${queryString.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ reviewId }) => ({
                type: "Review" as const,
                id: reviewId,
              })),
              { type: "Reviews", id: "LIST" },
            ]
          : [{ type: "Reviews", id: "LIST" }],
    }),

    getReview: build.query<ReviewType, number>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Review", id }],
    }),

    createReview: build.mutation<ReviewType, CreateReviewType>({
      query: (body) => ({
        url: "",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Reviews", id: "LIST" }],
    }),

    updateReview: build.mutation<void, { id: number; data: UpdateReviewType }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Review", id }],
    }),

    deleteReview: build.mutation<void, number>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Reviews", id: "LIST" }],
    }),
  }),
});

export const {
  useGetReviewsQuery,
  useGetReviewQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewApi;
