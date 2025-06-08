import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ReactionCounterState {
  [reviewId: number]: number; // key: reviewId, value: reactionCount
}

const initialState: ReactionCounterState = {};

export const reactionCounterSlice = createSlice({
  name: "reactionCounter",
  initialState,
  reducers: {
    setReactionCount: (
      state,
      action: PayloadAction<{ reviewId: number; count: number }>
    ) => {
      const { reviewId, count } = action.payload;
      state[reviewId] = count;
    },
    incrementReactionCount: (state, action: PayloadAction<number>) => {
      const reviewId = action.payload;
      if (state[reviewId] !== undefined) {
        state[reviewId] += 1;
      } else {
        state[reviewId] = 1;
      }
    },
    decrementReactionCount: (state, action: PayloadAction<number>) => {
      const reviewId = action.payload;
      if (state[reviewId] !== undefined && state[reviewId] > 0) {
        state[reviewId] -= 1;
      }
    },
  },
});

export const {
  setReactionCount,
  incrementReactionCount,
  decrementReactionCount,
} = reactionCounterSlice.actions;

export default reactionCounterSlice.reducer;
