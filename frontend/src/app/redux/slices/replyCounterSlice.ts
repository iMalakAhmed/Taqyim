// redux/slices/replyCounterSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ReplyCounterState {
  [commentId: number]: number;
}

const initialState: ReplyCounterState = {};

export const replyCounterSlice = createSlice({
  name: "replyCounter",
  initialState,
  reducers: {
    setReplyCount: (
      state,
      action: PayloadAction<{ commentId: number; count: number }>
    ) => {
      const { commentId, count } = action.payload;
      state[commentId] = count;
    },
    incrementReplyCount: (state, action: PayloadAction<number>) => {
      const commentId = action.payload;
      if (state[commentId] !== undefined) {
        state[commentId] += 1;
      } else {
        state[commentId] = 1;
      }
    },
    decrementReplyCount: (state, action: PayloadAction<number>) => {
      const commentId = action.payload;
      if (state[commentId] !== undefined && state[commentId] > 0) {
        state[commentId] -= 1;
      }
    },
  },
});

export const { setReplyCount, incrementReplyCount, decrementReplyCount } =
  replyCounterSlice.actions;

export default replyCounterSlice.reducer;
