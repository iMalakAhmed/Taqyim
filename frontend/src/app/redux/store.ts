import { configureStore } from "@reduxjs/toolkit";
import { userApi } from "./services/userApi";
import { businessApi } from "./services/BusinessApi";
import userReducer from "./slices/userSlice";
import businessReducer from "./slices/businessSlice";
import { authApi } from "./services/authApi";
import { reviewApi } from "./services/reviewApi";
import { reactionApi } from "./services/reactionApi";
import { mediaApi } from "./services/mediaApi";

export const store = configureStore({
  reducer: {
    [userApi.reducerPath]: userApi.reducer,
    [businessApi.reducerPath]: businessApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
    [reactionApi.reducerPath]: reactionApi.reducer,
    [mediaApi.reducerPath]: mediaApi.reducer,
    user: userReducer,
    business: businessReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      userApi.middleware,
      authApi.middleware,
      businessApi.middleware,
      reviewApi.middleware,
      reactionApi.middleware,
      mediaApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
