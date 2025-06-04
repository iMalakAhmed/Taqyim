"use client";

import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import counterReducer from "./slices/counter/counterSlice";
import { jsonPlaceholderApi } from "./services/jsonPlaceHolderApi";
import { reviewApi } from "./services/reviewApis";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    [jsonPlaceholderApi.reducerPath]: jsonPlaceholderApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      jsonPlaceholderApi.middleware,
      reviewApi.middleware
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
