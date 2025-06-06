import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  BusinessDTO,
  BusinessUpdateDto,
  BusinessCreateDto,
  BusinessLocationDTO,
  BusinessLocationCreateDto,
  BusinessLocationUpdateDto,
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

export const businessApi = createApi({
  reducerPath: "businessApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5273/api/businesses",
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = getTokenFromCookie();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Business"],
  endpoints: (builder) => ({
    getBusinessById: builder.query<BusinessDTO, number>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Business", id }],
    }),
    updateBusiness: builder.mutation<void, { id: number; body: BusinessUpdateDto }>({
      query: ({ id, body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Business", id }],
    }),
    createBusiness: builder.mutation<{ message: string; businessId: number }, BusinessCreateDto>({
      query: (body) => ({
        url: `/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Business"],
    }),
    verifyBusiness: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${id}/verify`,
        method: "PUT",
      }),
      invalidatesTags: ["Business"],
    }),
    unverifyBusiness: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${id}/unverify`,
        method: "PUT",
      }),
      invalidatesTags: ["Business"],
    }),
    getBusinessLocations: builder.query<BusinessLocationDTO[], number>({
      query: (businessId) => `/${businessId}/locations`,
      providesTags: (result, error, businessId) => [{ type: "Business", id: businessId }],
    }),
    updateLocation: builder.mutation<void, { businessId: number; locationId: number; body: BusinessLocationUpdateDto }>({
      query: ({ businessId, locationId, body }) => ({
        url: `/${businessId}/locations/${locationId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { businessId }) => [{ type: "Business", id: businessId }],
    }),
    createLocation: builder.mutation<void, { businessId: number; body: BusinessLocationCreateDto }>({
      query: ({ businessId, body }) => ({
        url: `/${businessId}/locations`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { businessId }) => [{ type: "Business", id: businessId }],
    }),
    deleteLocation: builder.mutation<void, { businessId: number; locationId: number }>({
      query: ({ businessId, locationId }) => ({
        url: `/${businessId}/locations/${locationId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { businessId }) => [{ type: "Business", id: businessId }],
    }),
  }),
});

export const {
  useGetBusinessByIdQuery,
  useUpdateBusinessMutation,
  useCreateBusinessMutation,
  useVerifyBusinessMutation,
  useUnverifyBusinessMutation,
  useGetBusinessLocationsQuery,
  useUpdateLocationMutation,
  useCreateLocationMutation,
  useDeleteLocationMutation,
} = businessApi;
