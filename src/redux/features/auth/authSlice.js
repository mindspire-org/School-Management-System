import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockUsers } from '../../../utils/mockData';
import { STORAGE_KEYS } from '../../../utils/constants';

// Mock API function for login
const loginAPI = async (credentials) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Find user in mock data
      const foundUser = Object.values(mockUsers).find(u => u.email === credentials.email);
      
      if (!foundUser) {
        reject(new Error('Invalid email or password'));
        return;
      }
      
      // Mock password check (in reality, never store passwords in frontend)
      // For demo purposes, any password is accepted
      if (!credentials.password) {
        reject(new Error('Password is required'));
        return;
      }
      
      // Create session
      const token = 'mock-jwt-token-' + Date.now();
      const userData = {
        ...foundUser,
        token,
        loginTime: new Date().toISOString(),
      };
      
      resolve({
        user: userData,
        token
      });
    }, 800);
  });
};

// Async thunk for login
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginAPI(credentials);
      // Store token in localStorage
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get stored user data if available
const getUserFromStorage = () => {
  const user = localStorage.getItem(STORAGE_KEYS.USER_DATA);
  return user ? JSON.parse(user) : null;
};

const initialState = {
  user: getUserFromStorage(),
  token: localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
  isAuthenticated: !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action) => {
      if (!state.user) return;
      
      const updatedUser = { ...state.user, ...action.payload };
      state.user = updatedUser;
      
      // Update localStorage
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, updateUser } = authSlice.actions;

export default authSlice.reducer;
