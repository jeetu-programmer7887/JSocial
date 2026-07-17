import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoggedIn: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state) => {
      // Redux Toolkit uses Immer under the hood, 
      // allowing us to write "mutating" logic safely.
      state.isLoggedIn = true;
    },
    logout: (state) => {
      state.isLoggedIn = false;
    },
  },
});

// Export the actions so components can use them
export const { login, logout } = authSlice.actions;

// Export the reducer to wire it up to the store
export default authSlice.reducer;