import { configureStore } from "@reduxjs/toolkit";
import { userApi } from "./services/UserApi";
import { businessApi } from "./services/BusinessApi"; 
import userReducer from "./slices/userSlice";
import businessReducer from "./slices/businessSlice";


export const store = configureStore({
  reducer: {
    [userApi.reducerPath]: userApi.reducer,
    [businessApi.reducerPath]: businessApi.reducer,
    user: userReducer,
    business: businessReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(userApi.middleware , businessApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

