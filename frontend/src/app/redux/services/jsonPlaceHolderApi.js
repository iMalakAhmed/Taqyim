//THIS IS AN EXAMPLE RTK QUERY USING https://jsonplaceholder.typicode.com/

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const jsonPlaceholderApi = createApi({
  reducerPath: "jsonPlaceholderApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://jsonplaceholder.typicode.com/", //intial base url
  }),
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: () => "posts", //Query to fetch posts for queries with param ex; query: (id) => `posts/{id}`
    }),
    createPost: builder.mutation({
      //mutation -> modifying data ex: POST, PUT, DELETE
      query: (newPost) => ({
        url: "posts",
        method: "POST", //method of mutation POST TO /posts
        body: newPost, //body sent with request
      }),
    }),
  }),
});

export const { useGetPostsQuery, useCreatePostMutation } = jsonPlaceholderApi; //hooks are autogenereted by rtk
