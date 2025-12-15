import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import uiReducer from '../features/ui/uiSlice';
import homeReducer from '../features/home/homeSlice';
import tracksReducer from '../features/tracks/tracksSlice';
import albumsReducer from '../features/albums/albumsSlice';
import playerReducer from '../features/player/playerSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        ui: uiReducer,
        home: homeReducer,
        tracks: tracksReducer,
        albums:  albumsReducer,
        player: playerReducer,
    },
});

// Also export as default for backward compatibility
export default store;