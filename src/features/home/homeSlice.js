import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { httpClient } from '../../api/httpClient';

export const fetchHome = createAsyncThunk(
    'home/fetchHome',
    async ({ tracksLimit = 12, albumsLimit = 8 } = {}, { rejectWithValue }) => {
        try {
            const response = await httpClient.get('/api/home', {
                params:  { tracksLimit, albumsLimit },
            });
            return response. data;
        } catch (error) {
            console.error('fetchHome error:', error);
            return rejectWithValue(error.response?.data?. message || 'Failed to load home data');
        }
    }
);

const initialState = {
    counts: {
        totalTracks:  0,
        totalAlbums: 0,
    },
    recentTracks: [],
    albums: [],
    userInfo: null,
    loading: false,
    error:  null,
};

const homeSlice = createSlice({
    name: 'home',
    initialState,
    reducers:  {
        clearHomeError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchHome.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchHome.fulfilled, (state, action) => {
                state.loading = false;
                state.counts = action.payload.counts || { totalTracks:   0, totalAlbums: 0 };
                state.recentTracks = action.payload. recentTracks || [];
                state.albums = action.payload. albums || [];
                state.userInfo = action.payload.  userInfo || null;
            })
            .addCase(fetchHome.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearHomeError } = homeSlice.  actions;

// Selectors
export const selectHomeData = (state) => state.home;
export const selectRecentTracks = (state) => state.home.recentTracks;
export const selectHomeAlbums = (state) => state.home.albums;
export const selectHomeCounts = (state) => state.home.counts;
export const selectHomeLoading = (state) => state.home.loading;
export const selectHomeError = (state) => state.home.error;

export default homeSlice. reducer;