import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js'; // Import the reducer we just exported

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});