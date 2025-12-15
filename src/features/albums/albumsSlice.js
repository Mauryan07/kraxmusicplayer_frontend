import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { httpClient } from '../../api/httpClient';

export const fetchAlbums = createAsyncThunk(
    'albums/fetchAlbums',
    async (_, { rejectWithValue }) => {
        try {
            const response = await httpClient.get('/api/albums');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?. data?.message || 'Failed to load albums');
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

export const searchAlbums = createAsyncThunk(
    'albums/searchAlbums',
    async (query, { rejectWithValue }) => {
        try {
            const response = await httpClient.get('/api/search/album', {
                params: { query },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Search failed');
        }
    }
);

const initialState = {
    items: [],
    byId: {},
    currentAlbum: null,
    loading: false,
    error:  null,
    searchResults: [],
    searchLoading:  false,
};

const albumsSlice = createSlice({
    name: 'albums',
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
                state. loading = true;
                state.error = null;
            })
            .addCase(fetchAlbums.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload || [];
                action.payload?. forEach((album) => {
                    state.byId[album.id || album.album] = album;
                });
            })
            .addCase(fetchAlbums.rejected, (state, action) => {
                state. loading = false;
                state.error = action.payload;
            })
            .addCase(fetchAlbumById.pending, (state) => {
                state. loading = true;
            })
            .addCase(fetchAlbumById.fulfilled, (state, action) => {
                state.loading = false;
                state. currentAlbum = action.payload;
                const id = action.payload. id || action.payload.album;
                if (id) state.byId[id] = action.payload;
            })
            .addCase(fetchAlbumById.rejected, (state, action) => {
                state.loading = false;
                state.error = action. payload;
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
export const selectAlbumsLoading = (state) => state.albums.loading;
export const selectCurrentAlbum = (state) => state.albums.currentAlbum;
export const selectAlbumById = (id) => (state) => state.albums.byId[id];
export const selectAlbumSearchResults = (state) => state.albums. searchResults;

export default albumsSlice.reducer;