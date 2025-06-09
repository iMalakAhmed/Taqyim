import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CommentReactionCounterState {
  [commentId: number]: number;
}

const initialState: CommentReactionCounterState = {};

export const commentReactionCounterSlice = createSlice({
  name: "commentReactionCounter",
  initialState,
  reducers: {
    setReactionCount: (
      state,
      action: PayloadAction<{ commentId: number; count: number }>
    ) => {
      const { commentId, count } = action.payload;
      state[commentId] = count;
    },
    incrementReactionCount: (state, action: PayloadAction<number>) => {
      const commentId = action.payload;
      if (state[commentId] !== undefined) {
        state[commentId] += 1;
      } else {
        state[commentId] = 1;
      }
    },
    decrementReactionCount: (state, action: PayloadAction<number>) => {
      const commentId = action.payload;
      if (state[commentId] !== undefined && state[commentId] > 0) {
        state[commentId] -= 1;
      }
    },
  },
});

export const {
  setReactionCount,
  incrementReactionCount,
  decrementReactionCount,
} = commentReactionCounterSlice.actions;

export default commentReactionCounterSlice.reducer;
