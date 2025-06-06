import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  UserDTO,
  UpdateUserDto,
  AuthResponse,
  LoginCredentials,
  RegisterData,
} from "./dtos";

function getTokenFromCookie() {
  if (typeof document === "undefined") return null;
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1] ?? null
  );
}

export const userApi = createApi({
  reducerPath: "usersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5273/api/users",
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = getTokenFromCookie();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["User"],
  endpoints: (build) => ({
    getAllUsers: build.query<UserDTO[], void>({
      query: () => "/",
      providesTags: ["User"],
    }),
    getUser: build.query<UserDTO, number>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
    getCurrentUser: build.query<UserDTO, void>({
      query: () => "/me",
      providesTags: ["User"],
    }),
    updateUser: build.mutation<void, { id: number; data: UpdateUserDto }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "User", id }],
    }),
    deleteUser: build.mutation<void, number>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
    login: build.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: build.mutation<AuthResponse, RegisterData>({
      query: (data) => ({
        url: "/register",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUserQuery,
  useGetCurrentUserQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useLoginMutation,
  useRegisterMutation,
} = userApi;
