import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authApi } from './services/authApi';
import { searchApi } from './services/searchApi';
import { commentApi } from './services/commentApi';
import { commentReactionApi } from './services/commentReactionApi';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [searchApi.reducerPath]: searchApi.reducer,
    [commentApi.reducerPath]: commentApi.reducer,
    [commentReactionApi.reducerPath]: commentReactionApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(searchApi.middleware)
      .concat(commentApi.middleware)
      .concat(commentReactionApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 