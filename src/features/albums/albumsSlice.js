import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { httpClient } from '../../api/httpClient';

export const fetchAlbums = createAsyncThunk(
    'albums/fetchAlbums',
    async (_, { rejectWithValue }) => {
        try {
            const response = await httpClient.get('/api/albums');

            // FIX: Handle both direct array and Spring Boot paginated response (.content)
            const data = response.data;
            if (data.content && Array.isArray(data.content)) {
                return data.content;
            } else if (Array.isArray(data)) {
                return data;
            }

            // If we received an object but it's not the array we expected
            return [];
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
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to load album');
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
    error: null,
    searchResults: [],
    searchLoading: false,
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
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAlbums.fulfilled, (state, action) => {
                state.loading = false;
                // Ensure payload is an array before assigning
                const albums = Array.isArray(action.payload) ? action.payload : [];
                state.items = albums;

                // Safe forEach
                albums.forEach((album) => {
                    const id = album.id || album.album;
                    if (id) {
                        state.byId[id] = album;
                    }
                });
            })
            .addCase(fetchAlbums.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchAlbumById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAlbumById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentAlbum = action.payload;
                const id = action.payload.id || action.payload.album;
                if (id) state.byId[id] = action.payload;
            })
            .addCase(fetchAlbumById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(searchAlbums.pending, (state) => {
                state.searchLoading = true;
            })
            .addCase(searchAlbums.fulfilled, (state, action) => {
                state.searchLoading = false;
                state.searchResults = action.payload || [];
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
export const selectAlbumsError = (state) => state.albums.error; // Exported this
export const selectCurrentAlbum = (state) => state.albums.currentAlbum;
export const selectAlbumById = (id) => (state) => state.albums.byId[id];
export const selectAlbumSearchResults = (state) => state.albums.searchResults;

export default albumsSlice.reducer;