import { createSlice } from '@reduxjs/toolkit';

// 1. Define the initial state for your authentication
const initialState = {
  user: null, 
  isAuthenticated: false, 
};

// 2. Create the slice
const authSlice = createSlice({
  name: 'auth', 
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },

    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    }
  },
});

// 3. Export the actions so you can dispatch them from your components
export const { setCredentials, logout, updateUserProfile } = authSlice.actions;

// 4. Export the reducer to be wired up in the store
export default authSlice.reducer;
