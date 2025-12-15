import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { httpClient } from '../../api/httpClient';

export const fetchAlbums = createAsyncThunk(
    'albums/fetchAlbums',
    async (_, { rejectWithValue }) => {
        try {
            const response = await httpClient.get('/api/albums');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to load albums');
        }
    }
);

export const fetchAlbumById = createAsyncThunk(
    'albums/fetchAlbumById',
    async (albumId, { rejectWithValue }) => {
        try {
            const response = await httpClient.get(`/api/album/${albumId}`);
            return response. data;
        } catch (error) {
            return rejectWithValue(error. response?.data?.message || 'Failed to load album');
        }
    }
);

// Search albums endpoint:  /api/search/album? name=query
export const searchAlbums = createAsyncThunk(
    'albums/searchAlbums',
    async (query, { rejectWithValue }) => {
        try {
            const response = await httpClient.get('/api/search/album', {
                params: { name:  query },
            });
            return response. data;
        } catch (error) {
            console.error('searchAlbums error:', error.response?.data || error.message);
            return rejectWithValue(error.response?.data?.message || 'Search failed');
        }
    }
);

const initialState = {
    items: [],
    currentAlbum: null,
    loading: false,
    error: null,
    searchResults: [],
    searchLoading: false,
};

const albumsSlice = createSlice({
    name:  'albums',
    initialState,
    reducers: {
        clearCurrentAlbum: (state) => {
            state.currentAlbum = null;
        },
        clearAlbumSearchResults: (state) => {
            state.searchResults = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAlbums.pending, (state) => {
                state.loading = true;
                state. error = null;
            })
            .addCase(fetchAlbums.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload || [];
            })
            .addCase(fetchAlbums.rejected, (state, action) => {
                state. loading = false;
                state.error = action.payload;
            })
            .addCase(fetchAlbumById. pending, (state) => {
                state. loading = true;
                state.error = null;
            })
            .addCase(fetchAlbumById.fulfilled, (state, action) => {
                state. loading = false;
                state.currentAlbum = action. payload;
            })
            .addCase(fetchAlbumById.rejected, (state, action) => {
                state. loading = false;
                state.error = action.payload;
            })
            .addCase(searchAlbums.pending, (state) => {
                state.searchLoading = true;
            })
            .addCase(searchAlbums.fulfilled, (state, action) => {
                state. searchLoading = false;
                state. searchResults = action. payload || [];
            })
            .addCase(searchAlbums.rejected, (state) => {
                state.searchLoading = false;
                state.searchResults = [];
            });
    },
});

export const { clearCurrentAlbum, clearAlbumSearchResults } = albumsSlice.actions;

export const selectAlbums = (state) => state.albums.items;
export const selectCurrentAlbum = (state) => state.albums.currentAlbum;
export const selectAlbumsLoading = (state) => state.albums.loading;
export const selectAlbumsError = (state) => state.albums.error;
export const selectAlbumSearchResults = (state) => state.albums.searchResults;
export const selectAlbumSearchLoading = (state) => state.albums.searchLoading;

export default albumsSlice. reducer;