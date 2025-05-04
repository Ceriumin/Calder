import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    null: (state = null) => state,
  },
});

