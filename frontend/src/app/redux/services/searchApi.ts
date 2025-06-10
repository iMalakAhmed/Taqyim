import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { SearchUserDTO, SearchBusinessDTO, SearchReviewDTO, PaginatedResult } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const searchApi = createApi({
  reducerPath: "searchApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = sessionStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    searchUsers: builder.query<PaginatedResult<SearchUserDTO>, { query: string; page: number; pageSize: number }>({
      query: ({ query, page, pageSize }) => `/search/users?query=${query}&page=${page}&pageSize=${pageSize}`,
    }),
    searchBusinesses: builder.query<PaginatedResult<SearchBusinessDTO>, { query: string; page: number; pageSize: number }>({
      query: ({ query, page, pageSize }) => `/search/businesses?query=${query}&page=${page}&pageSize=${pageSize}`,
    }),
    searchReviews: builder.query<PaginatedResult<SearchReviewDTO>, { query: string; page: number; pageSize: number }>({
      query: ({ query, page, pageSize }) => `/search/reviews?query=${query}&page=${page}&pageSize=${pageSize}`,
    }),
  }),
});

export const { useSearchUsersQuery, useSearchBusinessesQuery, useSearchReviewsQuery } = searchApi; 