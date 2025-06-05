import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Assuming you have a baseApi setup elsewhere, otherwise you might need to adjust this
// import { baseApi } from './baseApi';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5273/',
    prepareHeaders: (headers, { endpoint }) => {
      // Log the URL being fetched
      console.log('Fetching endpoint:', endpoint);
      console.log('Resolved URL:', `http://localhost:5273/${endpoint}`); // Manually construct for logging clarity
      return headers;
    },
  }), // Set base URL to backend address
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: 'api/auth/login', // Corrected login URL relative to baseUrl
        method: 'POST',
        body: credentials,
      }),
    }),
    signup: builder.mutation({
      query: (userData) => ({
        url: 'api/auth/register', // Corrected signup URL relative to baseUrl
        method: 'POST',
        body: userData,
      }),
    }),
  }),
});

export const { useLoginMutation, useSignupMutation } = authApi; 