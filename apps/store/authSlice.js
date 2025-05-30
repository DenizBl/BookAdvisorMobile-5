import { createSlice } from '@reduxjs/toolkit';

const initialState = {
   token: null,
   userData: null,
   didTryAutoLogin: false,
};

const authSlice = createSlice({
   name: 'auth',
   initialState,
   reducers: {
      authenticate: (state, action) => {
         const { payload } = action;
         state.token = payload.token;
         state.userData = payload.userData;
         state.didTryAutoLogin = true;
      },
      setDidTryAutoLogin: (state, action) => {
         state.didTryAutoLogin = true;
      },
      logout: (state, action) => {
         state.token = null;
         state.userData = null;
         state.didTryAutoLogin = true;
      },
      updateLoggedInUserData: (state, action) => {
         state.userData = { ...state.userData, ...action.payload.newData };
      },
   },
});

export const setDidTryAutoLogin = authSlice.actions.setDidTryAutoLogin;
export const authenticate = authSlice.actions.authenticate;
export const updateLoggedInUserData = authSlice.actions.updateLoggedInUserData;
export const logout = authSlice.actions.logout;
export const authReducer = authSlice.reducer;
