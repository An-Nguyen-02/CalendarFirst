// store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/AuthSlice.ts";

// Create the store
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // optional: avoid warnings if you store non-serializable things
    }),
});

// Infer types from store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
