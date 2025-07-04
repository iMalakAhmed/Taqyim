import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  BusinessType,
  BusinessUpdateType,
  BusinessCreateType,
  BusinessLocationType,
  BusinessLocationCreateType,
  BusinessLocationUpdateType,
  ProductType,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export const businessApi = createApi({
  reducerPath: "businessApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/businesses`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = sessionStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Business"],
  endpoints: (builder) => ({
    getBusinessById: builder.query<BusinessType, number>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Business", id }],
    }),
    updateBusiness: builder.mutation<
      void,
      { id: number; body: BusinessUpdateType }
    >({
      query: ({ id, body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Business", id }],
    }),
    createBusiness: builder.mutation<
      { message: string; businessId: number },
      BusinessCreateType
    >({
      query: (body) => ({
        url: `/`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
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
    deleteBusiness: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Business"],
    }),
    getBusinessLocations: builder.query<BusinessLocationType[], number>({
      query: (businessId) => `/${businessId}/locations`,
      providesTags: (result, error, businessId) => [
        { type: "Business", id: businessId },
      ],
    }),
    updateLocation: builder.mutation<
      void,
      {
        businessId: number;
        locationId: number;
        body: BusinessLocationUpdateType;
      }
    >({
      query: ({ businessId, locationId, body }) => ({
        url: `/${businessId}/locations/${locationId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { businessId }) => [
        { type: "Business", id: businessId },
      ],
    }),
    createLocation: builder.mutation<
      void,
      { businessId: number; body: BusinessLocationCreateType }
    >({
      query: ({ businessId, body }) => ({
        url: `/${businessId}/locations`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { businessId }) => [
        { type: "Business", id: businessId },
      ],
    }),
    deleteLocation: builder.mutation<
      void,
      { businessId: number; locationId: number }
    >({
      query: ({ businessId, locationId }) => ({
        url: `/${businessId}/locations/${locationId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { businessId }) => [
        { type: "Business", id: businessId },
      ],
    }),
    getAllBusinesses: builder.query<BusinessType[], void>({
      query: () => `/`,
      providesTags: ["Business"],
    }),
    getMyBusiness: builder.query<BusinessType, void>({
      query: () => ({
        url: "/my",
        method: "GET",
      }),
      providesTags: ["Business"],
    }),
    createProduct: builder.mutation<
      void,
      { businessId: number; body: ProductType }
    >({
      query: ({ businessId, body }) => ({
        url: `/${businessId}/products`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { businessId }) => [
        { type: "Business", id: businessId },
      ],
    }),
    getProductsByBusiness: builder.query<ProductType[], number>({
      query: (businessId) => `/${businessId}/products`,
    }),

    updateProduct: builder.mutation<
      void,
      { businessId: number; productId: number; body: ProductType }
    >({
      query: ({ businessId, productId, body }) => ({
        url: `/${businessId}/products/${productId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { businessId }) => [{ type: "Business", id: businessId }],
    }),


    deleteProduct: builder.mutation<
      void,
      { businessId: number; productId: number }
    >({
      query: ({ businessId, productId }) => ({
        url: `/${businessId}/products/${productId}`,
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
  useDeleteBusinessMutation,
  useGetAllBusinessesQuery,
  useGetMyBusinessQuery,
  useCreateProductMutation,
  useGetProductsByBusinessQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = businessApi;
