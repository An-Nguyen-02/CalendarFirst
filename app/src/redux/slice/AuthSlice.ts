// store/authSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../types/types";

export interface AuthState {
  user: User | null;
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: AuthState = {
  user: null,
  status: "idle",
};

// Async thunk to fetch current session
export const fetchUser = createAsyncThunk<User>(
  "auth/fetchUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include", // send cookies
      });

      if (!res.ok) {
        throw new Error("Not authenticated");
      }
      return (await res.json()) as User;
    } catch (error) {
      let message = "Unknown error";
      if (error instanceof Error) {
        message = error.message;
      }
      return rejectWithValue(`Not authenticated: ${message}`);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.status = "idle";
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.status = "succeeded";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.status = "failed";
        state.user = null;
      });
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
