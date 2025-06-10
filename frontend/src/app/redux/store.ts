import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authApi } from './services/authApi';
import { searchApi } from './services/searchApi';
import { commentApi } from './services/commentApi';
import { commentReactionApi } from './services/commentReactionApi';
import { businessApi } from './services/BusinessApi';
import { userApi } from './services/userApi';
import { connectionApi } from './services/connectionApi';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [searchApi.reducerPath]: searchApi.reducer,
    [commentApi.reducerPath]: commentApi.reducer,
    [commentReactionApi.reducerPath]: commentReactionApi.reducer,
    [businessApi.reducerPath]: businessApi.reducer,
    [connectionApi.reducerPath]: connectionApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(searchApi.middleware)
      .concat(businessApi.middleware)
      .concat(commentApi.middleware)
      .concat(userApi.middleware)
      .concat(connectionApi.middleware)
      .concat(commentReactionApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 