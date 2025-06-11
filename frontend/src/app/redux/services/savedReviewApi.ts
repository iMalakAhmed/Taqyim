import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ReviewType } from "./types"; // adjust path if needed

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
          body: userId, // ← send plain number, not { userId: userId }
          headers: {
            "Content-Type": "application/json" // make sure it's explicitly set
          }
        }),
        invalidatesTags: ["SavedReview"],
      }),
      

    unsaveReview: build.mutation<void, SavePayload>({
      query: ({ reviewId, userId }) => ({
        url: `/${reviewId}?userId=${userId}`,
        method: "DELETE",
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
