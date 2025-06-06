import { configureStore } from "@reduxjs/toolkit";
import { usersApi } from "./services/userApi";
import { businessApi } from "./services/BusinessApi"; 
import userReducer from "./slices/userSlice";
import businessReducer from "./slices/businessSlice";
import { authApi } from "./services/authApi";
import { reviewApi } from "./services/reviewApis";

export const store = configureStore({
  reducer: {
    [usersApi.reducerPath]: usersApi.reducer,
    [businessApi.reducerPath]: businessApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
    user: userReducer,
    business: businessReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(
      usersApi.middleware,
      authApi.middleware,
      businessApi.middleware,
      reviewApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

