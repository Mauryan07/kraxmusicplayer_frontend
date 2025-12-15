import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { httpClient } from '../../api/httpClient';
import { addToast } from '../ui/uiSlice';

export const fetchTracks = createAsyncThunk(
    'tracks/fetchTracks',
    async ({ page = 0, size = 20, sortBy = 'title', sortDir = 'asc' } = {}, { rejectWithValue }) => {
        try {
            const response = await httpClient.get('/api/tracks', {
                params: { page, size, sortBy, sortDir },
            });

            const tracks = response.data;

            return {
                content: tracks,
                page:  page,
                size:  size,
                hasMore: tracks.length >= size,
            };
        } catch (error) {
            console.error('fetchTracks error:', error. response?.data || error. message);
            return rejectWithValue(error.response?.data?. message || error.message || 'Failed to load tracks');
        }
    }
);

// Updated to match backend endpoint:  /api/search/title? name=query
export const searchTracks = createAsyncThunk(
    'tracks/searchTracks',
    async (query, { rejectWithValue }) => {
        try {
            const response = await httpClient.get('/api/search/title', {
                params: { name: query },
            });
            return response.data;
        } catch (error) {
            console.error('searchTracks error:', error. response?.data || error.message);
            return rejectWithValue(error.response?. data?.message || 'Search failed');
        }
    }
);

export const deleteTrack = createAsyncThunk(
    'tracks/deleteTrack',
    async (fileHash, { dispatch, rejectWithValue }) => {
        try {
            await httpClient.delete(`/api/track/${fileHash}`);
            dispatch(addToast({ type: 'success', message: 'Track deleted successfully' }));
            return fileHash;
        } catch (error) {
            const message = error.response?. data?.message || 'Failed to delete track';
            dispatch(addToast({ type: 'error', message }));
            return rejectWithValue(message);
        }
    }
);

export const deleteAllTracks = createAsyncThunk(
    'tracks/deleteAllTracks',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            await httpClient.delete('/api/track/deleteAll');
            dispatch(addToast({ type: 'success', message: 'All tracks deleted successfully' }));
            return true;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete all tracks';
            dispatch(addToast({ type: 'error', message }));
            return rejectWithValue(message);
        }
    }
);

const initialState = {
    items: [],
    page: 0,
    size: 24,
    hasMore: true,
    totalFetched: 0,
    loading: false,
    error: null,
    searchResults: [],
    searchLoading: false,
    deleteLoading: false,
};

const tracksSlice = createSlice({
    name:  'tracks',
    initialState,
    reducers: {
        clearSearchResults: (state) => {
            state.searchResults = [];
        },
        clearTracksError: (state) => {
            state. error = null;
        },
        resetTracks: (state) => {
            state.items = [];
            state.page = 0;
            state.hasMore = true;
            state.totalFetched = 0;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTracks. pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTracks.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.content || [];
                state. page = action.payload. page;
                state.size = action.payload. size;
                state.hasMore = action.payload.hasMore;
                state. totalFetched = (action.payload.page * action.payload.size) + action.payload.content.length;
            })
            .addCase(fetchTracks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(searchTracks.pending, (state) => {
                state. searchLoading = true;
            })
            .addCase(searchTracks.fulfilled, (state, action) => {
                state.searchLoading = false;
                state.searchResults = action.payload || [];
            })
            .addCase(searchTracks.rejected, (state) => {
                state.searchLoading = false;
                state.searchResults = [];
            })
            .addCase(deleteTrack.pending, (state) => {
                state. deleteLoading = true;
            })
            .addCase(deleteTrack.fulfilled, (state, action) => {
                state.deleteLoading = false;
                state.items = state.items.filter((t) => t.fileHash !== action.payload);
                state.searchResults = state.searchResults.filter((t) => t.fileHash !== action.payload);
            })
            .addCase(deleteTrack.rejected, (state) => {
                state. deleteLoading = false;
            })
            .addCase(deleteAllTracks.pending, (state) => {
                state.deleteLoading = true;
            })
            .addCase(deleteAllTracks.fulfilled, (state) => {
                state.deleteLoading = false;
                state.items = [];
                state.searchResults = [];
                state.hasMore = false;
                state.page = 0;
                state.totalFetched = 0;
            })
            .addCase(deleteAllTracks.rejected, (state) => {
                state.deleteLoading = false;
            });
    },
});

export const { clearSearchResults, clearTracksError, resetTracks } = tracksSlice. actions;

export const selectTracks = (state) => state.tracks. items;
export const selectTracksLoading = (state) => state.tracks.loading;
export const selectTracksError = (state) => state.tracks.error;
export const selectSearchResults = (state) => state.tracks. searchResults;
export const selectSearchLoading = (state) => state.tracks.searchLoading;
export const selectTracksPage = (state) => state.tracks.page;
export const selectTracksHasMore = (state) => state.tracks.hasMore;

const selectTracksState = (state) => state.tracks;

export const selectTracksPagination = createSelector(
    [selectTracksState],
    (tracks) => ({
        page: tracks.page,
        size: tracks.size,
        hasMore: tracks.hasMore,
        totalFetched:  tracks.totalFetched,
    })
);

export default tracksSlice. reducer;