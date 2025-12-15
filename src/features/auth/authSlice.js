import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { httpClient } from '../../api/httpClient';
import { addToast } from '../ui/uiSlice';

const encodeCredentials = (username, password) => btoa(`${username}:${password}`);

export const login = createAsyncThunk(
    'auth/login',
    async ({ username, password }, { dispatch, rejectWithValue }) => {
        try {
            const token = encodeCredentials(username, password);
            localStorage.setItem('basicToken', token);
            localStorage.setItem('username', username);

            const response = await httpClient.get('/api/auth/me');
            dispatch(addToast({ type: 'success', message: `Welcome back, ${username}!` }));

            return {
                username:  response.data.username,
                roles: response.data. roles,
                token,
            };
        } catch (error) {
            localStorage.removeItem('basicToken');
            localStorage.removeItem('username');

            const message =
                error.response?.status === 401
                    ? 'Invalid username or password'
                    : error.response?.data?. message || 'Login failed.  Please try again.';

            dispatch(addToast({ type: 'error', message }));
            return rejectWithValue(message);
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async ({ username, password }, { dispatch, rejectWithValue }) => {
        try {
            await httpClient.post('/api/auth/register', { username, password });
            dispatch(addToast({ type: 'success', message: 'Account created successfully!' }));

            const loginResult = await dispatch(login({ username, password })).unwrap();
            return loginResult;
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.response?.data ||
                'Registration failed. Please try again. ';

            dispatch(addToast({ type: 'error', message }));
            return rejectWithValue(message);
        }
    }
);

export const fetchMe = createAsyncThunk(
    'auth/fetchMe',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('basicToken');
            const username = localStorage.getItem('username');

            if (!token || !username) {
                return rejectWithValue('No stored credentials');
            }

            const response = await httpClient.get('/api/auth/me');

            return {
                username: response.data.username,
                roles: response.data.roles,
                token,
            };
        } catch (error) {
            localStorage.removeItem('basicToken');
            localStorage.removeItem('username');
            return rejectWithValue('Session expired');
        }
    }
);

const initialState = {
    username: null,
    basicToken: null,
    roles: [],
    isAuthenticated: false,
    loading: false,
    error: null,
    initialized: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            localStorage.removeItem('basicToken');
            localStorage.removeItem('username');
            state.username = null;
            state.basicToken = null;
            state.roles = [];
            state. isAuthenticated = false;
            state. error = null;
        },
        clearAuthError: (state) => {
            state. error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.username = action.payload. username;
                state.basicToken = action.payload.token;
                state.roles = action.payload.roles;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state. error = action.payload;
                state.isAuthenticated = false;
            })
            .addCase(register.pending, (state) => {
                state. loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.username = action.payload. username;
                state.basicToken = action.payload.token;
                state.roles = action.payload. roles;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchMe. pending, (state) => {
                state. loading = true;
            })
            .addCase(fetchMe. fulfilled, (state, action) => {
                state.loading = false;
                state.username = action. payload.username;
                state.basicToken = action.payload.token;
                state.roles = action.payload.roles;
                state.isAuthenticated = true;
                state.initialized = true;
            })
            .addCase(fetchMe. rejected, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.initialized = true;
            });
    },
});

export const { logout, clearAuthError } = authSlice.actions;

export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectCurrentUser = (state) => state.auth. username;
export const selectUserRoles = (state) => state.auth.roles;
export const selectIsAdmin = (state) => state.auth.roles.includes('ROLE_ADMIN');
export const selectAuthLoading = (state) => state.auth. loading;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthInitialized = (state) => state.auth.initialized;

export default authSlice.reducer;