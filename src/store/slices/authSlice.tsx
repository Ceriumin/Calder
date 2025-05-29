import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { signIn, signOut, fetchUserAttributes, getCurrentUser, signUp, confirmSignUp } from 'aws-amplify/auth';

export interface AuthState {
  user: any | null;
  error: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authChecked?: boolean;
}

export const initialState: AuthState = {
  user: null,
  error: null,
  isLoading: false,
  isAuthenticated: false,
  authChecked: false,
};
  

export const checkAuthState = createAsyncThunk(
  'auth/checkAuthState',
  async (_, { rejectWithValue, getState }) => {

    const state = getState() as { auth: AuthState };

    try {
      const user = await getCurrentUser();
      const userAttributes = await fetchUserAttributes();
      return { ...user, attributes: userAttributes };
    } catch (error: any) {
      return rejectWithValue(error?.message || error?.toString() || 'Failed to fetch user');
    }
  }
);

export const signUpUser = createAsyncThunk(
  'auth/signUpUser',
  async (userData: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const { username, password } = userData;
      const user = await signUp({ username, password });
      return user;
    } catch (error: any) {
      return rejectWithValue(error?.message || error?.toString() || 'Failed to sign up');
    }
  }
);

export const confirmSignUpUser = createAsyncThunk(
  'auth/confirmSignUpUser',
  async (confirmationData: { username: string; code: string }, { rejectWithValue }) => {
    try {
      const { username, code } = confirmationData;
      await confirmSignUp({ username, confirmationCode: code });
      return { success: true };
    } catch (error: any) {
      return rejectWithValue(error?.message || error?.toString() || 'Failed to confirm sign up');
    }
  }
);

export const signInUser = createAsyncThunk(
  'auth/signInUser',
  async (credentials: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const { username, password } = credentials;
      const user = await signIn({ username, password });
      const userAttributes = await fetchUserAttributes();
      return { ...user, attributes: userAttributes };
    } catch (error: any) {
      return rejectWithValue(error?.message || error?.toString() || 'Failed to sign in');
    }
  }
);

export const signOutUser = createAsyncThunk(
  'auth/signOutUser',
  async (_, { rejectWithValue }) => {
    try {
      await signOut();
    } catch (error: any) {
      return rejectWithValue(error?.message || error?.toString() || 'Failed to sign out');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAuthState: (state) => {
      state.user = null;
      state.error = null;
      state.isLoading = false;
      state.isAuthenticated = false;
      state.authChecked = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuthState.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthState.fulfilled, (state, action) => {
        state.isLoading = false;

        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.isAuthenticated = false;
        }
        state.authChecked = true;
      })

      .addCase(checkAuthState.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.authChecked = true; 
      })
      .addCase(signUpUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = false;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      .addCase(confirmSignUpUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(confirmSignUpUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(confirmSignUpUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      .addCase(signInUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(signInUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(signInUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      .addCase(signOutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(signOutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.authChecked = false; 
      })
      .addCase(signOutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, resetAuthState } = authSlice.actions;
export default authSlice.reducer;

