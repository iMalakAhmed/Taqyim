import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ReviewType } from "../redux/services/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

type SavePayload = {
  reviewId: number;
  userId: number;
};

export const savedReviewApi = createApi({
  reducerPath: "savedReviewApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/SavedReviews`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = sessionStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["SavedReview"],
  endpoints: (build) => ({
    saveReview: build.mutation<void, SavePayload>({
        query: ({ reviewId, userId }) => ({
          url: `/${reviewId}`,
          method: "POST",
          body: userId, // ✅ send raw number instead of { userId }
          headers: {
            "Content-Type": "application/json",
          },
        }),
        invalidatesTags: ["SavedReview"],
      }),      
    unsaveReview: build.mutation<void, SavePayload>({
      query: ({ reviewId, userId }) => ({
        url: `/${reviewId}?userId=${userId}`,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["SavedReview"],
    }),
    getSavedReviews: build.query<ReviewType[], number>({
      query: (userId) => `/${userId}`,
      providesTags: ["SavedReview"],
    }),
  }),
});

export const {
  useSaveReviewMutation,
  useUnsaveReviewMutation,
  useGetSavedReviewsQuery,
} = savedReviewApi;
