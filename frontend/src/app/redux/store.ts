import { configureStore } from "@reduxjs/toolkit";
import { userApi } from "./services/UserApi";
import { jsonPlaceholderApi } from "./services/JsonPlaceholderApi";
import counterReducer from "./slices/counterSlice";
import { businessApi } from "./services/BusinessApi"; 
import userReducer from "./slices/userSlice";
import businessReducer from "./slices/businessSlice";
import { authApi } from "./services/authApi";
import { reviewApi } from "./services/reviewApis";


export const store = configureStore({
  reducer: {
    [userApi.reducerPath]: userApi.reducer,
    [businessApi.reducerPath]: businessApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
    user: userReducer,
    business: businessReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(
      jsonPlaceholderApi.middleware,
      counterReducer.middleware,
      userApi.middleware,
      authApi.middleware,
      reviewApi.middleware
     , businessApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

