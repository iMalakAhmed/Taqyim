import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CommentCounterState {
  [reviewId: number]: number;
}

const initialState: CommentCounterState = {};

export const commentCounterSlice = createSlice({
  name: "commentCounter",
  initialState,
  reducers: {
    setCommentCount: (
      state,
      action: PayloadAction<{ reviewId: number; count: number }>
    ) => {
      const { reviewId, count } = action.payload;
      state[reviewId] = count;
    },
    incrementCommentCount: (state, action: PayloadAction<number>) => {
      const reviewId = action.payload;
      if (state[reviewId] !== undefined) {
        state[reviewId] += 1;
      } else {
        state[reviewId] = 1;
      }
    },
    decrementCommentCount: (state, action: PayloadAction<number>) => {
      const reviewId = action.payload;
      if (state[reviewId] !== undefined && state[reviewId] > 0) {
        state[reviewId] -= 1;
      }
    },
  },
});

export const { setCommentCount, incrementCommentCount, decrementCommentCount } =
  commentCounterSlice.actions;

export default commentCounterSlice.reducer;
