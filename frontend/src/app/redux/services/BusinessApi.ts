import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const businessApi = createApi({
  reducerPath: "businessApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000/api/" }), 
  endpoints: (builder) => ({
    getBusinessById: builder.query({
      query: (id) => `businesses/${id}`,
    }),
    updateBusiness: builder.mutation({
      query: ({ id, body }) => ({
        url: `businesses/${id}`,
        method: "PUT",
        body,
      }),
    }),
  }),
});

export const { useGetBusinessByIdQuery, useUpdateBusinessMutation } = businessApi;
