"use client";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AuthResponse, LoginCredentials, RegisterData } from "./types";

// Define the interface for the current user response
export interface CurrentUserResponse {
  userId: number;
  email: string;
  userName: string;
  type: string;
  // Add business information if the user is a business owner
  usersBusinesses?: Array<{ BusinessId: number; Name: string }>; // Adjusted to match backend DTO structure
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    // No baseUrl here, as we are using full URLs below
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
        url: "http://localhost:5273/api/auth/login", // Full URL
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation<AuthResponse, RegisterData>({
      query: (data) => ({
        url: "http://localhost:5273/api/auth/register", // Full URL
        method: "POST",
        body: data,
      }),
    }),
    getCurrentUser: builder.query<CurrentUserResponse, void>({
      query: () => "http://localhost:5273/api/auth/userinfo", // Changed endpoint name
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useGetCurrentUserQuery } =
  authApi;
