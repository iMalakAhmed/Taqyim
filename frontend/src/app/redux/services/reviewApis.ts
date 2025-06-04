import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  ReviewDTO,
  CreateReviewDTO,
  UpdateReviewDTO,
  CommentDTO,
  CreateCommentDTO,
  ReactionDTO,
  CreateReactionDTO,
} from "./dtos";

export const reviewApi = createApi({
  reducerPath: "reviewApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/review",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Reviews", "Review", "Comments", "Reactions"],
  endpoints: (build) => ({
    getReviews: build.query<
      ReviewDTO[],
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

    getReview: build.query<ReviewDTO, number>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Review", id }],
    }),

    createReview: build.mutation<ReviewDTO, CreateReviewDTO>({
      query: (body) => ({
        url: "",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Reviews", id: "LIST" }],
    }),

    updateReview: build.mutation<void, { id: number; data: UpdateReviewDTO }>({
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

    addComment: build.mutation<
      CommentDTO,
      { reviewId: number; comment: CreateCommentDTO }
    >({
      query: ({ reviewId, comment }) => ({
        url: `/${reviewId}/comment`,
        method: "POST",
        body: comment,
      }),
      invalidatesTags: (result, error, { reviewId }) => [
        { type: "Review", id: reviewId },
      ],
    }),

    addReaction: build.mutation<
      ReactionDTO | void,
      { reviewId: number; reaction: CreateReactionDTO }
    >({
      query: ({ reviewId, reaction }) => ({
        url: `/${reviewId}/reaction`,
        method: "POST",
        body: reaction,
      }),
      invalidatesTags: (result, error, { reviewId }) => [
        { type: "Review", id: reviewId },
      ],
    }),
  }),
});

export const {
  useGetReviewsQuery,
  useGetReviewQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useAddCommentMutation,
  useAddReactionMutation,
} = reviewApi;
