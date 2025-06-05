"use client";

import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import counterReducer from "./slices/counter/counterSlice";
import { jsonPlaceholderApi } from "./services/jsonPlaceHolderApi";
import { authApi } from "./services/authApi";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    [jsonPlaceholderApi.reducerPath]: jsonPlaceholderApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(jsonPlaceholderApi.middleware, authApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
