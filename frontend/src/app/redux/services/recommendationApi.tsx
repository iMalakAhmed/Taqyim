"use client";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export const recommendationApi = createApi({
  reducerPath: "recommendationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/recommendation`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = sessionStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getRecommendedBusinesses: builder.query<any[], number>({
      query: (userId) => `businesses/${userId}`,
    }),
    getRecommendedUsers: builder.query<any[], number>({
      query: (userId) => `users/${userId}`,
    }),
    getRecommendedReviews: builder.query<any[], number>({
      query: (userId) => `reviews/${userId}`,
    }),
  }),
});

export const {
  useGetRecommendedBusinessesQuery,
  useGetRecommendedUsersQuery,
  useGetRecommendedReviewsQuery,
} = recommendationApi;
