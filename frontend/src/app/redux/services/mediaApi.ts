import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { MediaType } from "./types";
import { getTokenFromCookie } from "@/app/utils/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export const mediaApi = createApi({
  reducerPath: "mediaApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = getTokenFromCookie();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Media"],
  endpoints: (builder) => ({
    getMedia: builder.query<MediaType[], { userId?: number } | void>({
      query: (arg) => {
        let url = "/media";
        if (arg?.userId) {
          url += `?userId=${arg.userId}`;
        }
        return url;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ mediaId }) => ({
                type: "Media" as const,
                id: mediaId,
              })),
              { type: "Media", id: "LIST" },
            ]
          : [{ type: "Media", id: "LIST" }],
    }),

    getMediaById: builder.query<MediaType, number>({
      query: (id) => `/media/${id}`,
      providesTags: (result, error, id) => [{ type: "Media", id }],
    }),

    uploadMedia: builder.mutation<MediaType, { file: File; reviewId?: number }>(
      {
        query: ({ file, reviewId }) => {
          const formData = new FormData();
          formData.append("file", file);
          if (reviewId) {
            formData.append("reviewId", reviewId.toString());
          }
          return {
            url: "/media",
            method: "POST",
            body: formData,
          };
        },
      }
    ),

    deleteMedia: builder.mutation<void, number>({
      query: (id) => ({
        url: `/media/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Media", id },
        { type: "Media", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetMediaQuery,
  useGetMediaByIdQuery,
  useUploadMediaMutation,
  useDeleteMediaMutation,
} = mediaApi;
