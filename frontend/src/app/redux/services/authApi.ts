"use client";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AuthResponse, LoginCredentials, RegisterData } from "./types";

// Define the interface for the current user response
export interface CurrentUserResponse {
  userId: number;
  email: string;
  userName: string;
  type: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

console.log("authApi - NEXT_PUBLIC_API_BASE_URL:", process.env.NEXT_PUBLIC_API_BASE_URL);
console.log("authApi - API_BASE_URL constructed:", API_BASE_URL);

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = sessionStorage.getItem('token'); // Get token from session storage
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation<AuthResponse, RegisterData>({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
    }),
    getCurrentUser: builder.query<CurrentUserResponse, void>({
      query: () => "/auth/me",
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useGetCurrentUserQuery } =
  authApi;