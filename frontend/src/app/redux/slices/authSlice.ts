import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    userId: null,
    token: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.userId = action.payload.userId;
      state.token = action.payload.token;
    },
    clearUser: (state) => {
      state.userId = null;
      state.token = null;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
