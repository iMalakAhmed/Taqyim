import { configureStore } from "@reduxjs/toolkit";
import { userApi } from "./services/userApi";
import { businessApi } from "./services/BusinessApi";
import userReducer from "./slices/userSlice";
import businessReducer from "./slices/businessSlice";
import { authApi } from "./services/authApi";
import { reviewApi } from "./services/reviewApi";
import { reactionApi } from "./services/reactionApi";
import { mediaApi } from "./services/mediaApi";
import { commentApi } from "./services/commentApi";
import { connectionApi } from "./services/connectionApi";
import reactionCounterReducer from "./slices/reactionCounterSlice";
import commentCounterReducer from "./slices/commentCounterSlice";
import commentReactionCounterReducer from "./slices/commentReactionCounterSlice";
import { commentReactionApi } from "./services/commentReactionApi";
import replyCounterReducer from "./slices/replyCounterSlice";
import authReducer from "./slices/authSlice";
import { searchApi } from "./services/searchApi";
import { analyticsApi } from "./services/analyticsApi";
import { recommendationApi } from "./services/recommendationApi";
import { savedReviewApi } from "./services/savedReviewApi";

export const store = configureStore({
  reducer: {
    [userApi.reducerPath]: userApi.reducer,
    [businessApi.reducerPath]: businessApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
    [reactionApi.reducerPath]: reactionApi.reducer,
    [mediaApi.reducerPath]: mediaApi.reducer,
    [commentApi.reducerPath]: commentApi.reducer,
    [commentReactionApi.reducerPath]: commentReactionApi.reducer,
    [connectionApi.reducerPath]: connectionApi.reducer,
    [searchApi.reducerPath]: searchApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
    [recommendationApi.reducerPath]: recommendationApi.reducer,
    [savedReviewApi.reducerPath]: savedReviewApi.reducer,
    auth: authReducer,
    user: userReducer,
    business: businessReducer,
    reactionCounter: reactionCounterReducer,
    commentCounter: commentCounterReducer,
    commentReactionCounter: commentReactionCounterReducer,
    replyCounter: replyCounterReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      userApi.middleware,
      authApi.middleware,
      businessApi.middleware,
      reviewApi.middleware,
      reactionApi.middleware,
      mediaApi.middleware,
      commentApi.middleware,
      commentReactionApi.middleware,
      connectionApi.middleware,
      searchApi.middleware,
      savedReviewApi.middleware,
      recommendationApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
