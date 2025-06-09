import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getTokenFromCookie } from "@/app/utils/auth";
import { ConnectionType } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

type FollowPayload = {
  followingId: number;
  followingType: "User" | "Business";
};

type FollowQuery = {
  id: number;
  type: "User" | "Business";
};

export const connectionApi = createApi({
  reducerPath: "connectionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/connection`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = getTokenFromCookie();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Connection"],
  endpoints: (build) => ({
    followUser: build.mutation<void, FollowPayload>({
      query: (body) => ({
        url: `/follow`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Connection"],
    }),
    unfollowUser: build.mutation<void, FollowPayload>({
      query: (body) => ({
        url: `/unfollow`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Connection"],
    }),
    getFollowers: build.query<ConnectionType[], FollowQuery>({
      query: ({ id, type }) => `/followers/${id}?type=${type}`,
      providesTags: ["Connection"],
    }),
    getFollowing: build.query<ConnectionType[], FollowQuery>({
      query: ({ id, type }) => `/following/${id}?type=${type}`,
      providesTags: ["Connection"],
    }),
  }),
});

export const {
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetFollowersQuery,
  useGetFollowingQuery,
} = connectionApi;
