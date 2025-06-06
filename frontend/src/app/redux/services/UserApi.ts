import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { UserDTO, UpdateUserDTO } from "./dtos";
// Helper to get token from cookies (simple example)
function getTokenFromCookie() {
  if (typeof document === "undefined") return null;
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1] ?? null
  );
}

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5273/api/users",
    credentials: "include", // Include credentials for cookie-based auth
    prepareHeaders: (headers) => {
      const token = getTokenFromCookie();
      console.log("Token from cookie:", token);
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
    updateUser: build.mutation<void, { id: number; data: UpdateUserDTO }>({
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
    getCurrentUser: build.query<UserDTO, void>({
    query: () => "/me",
    providesTags: ["User"],
}),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUserQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetCurrentUserQuery,
} = usersApi;
