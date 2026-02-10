import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../redux/slices/loginSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});
