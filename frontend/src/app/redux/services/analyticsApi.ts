"use client";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BusinessAnalytics } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export const analyticsApi = createApi({
  reducerPath: "analyticsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = sessionStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getBusinessAnalytics: builder.query<BusinessAnalytics, number>({
      query: (businessId) => `business/${businessId}/analytics`,
    }),
  }),
});

export const { useGetBusinessAnalyticsQuery } = analyticsApi;
