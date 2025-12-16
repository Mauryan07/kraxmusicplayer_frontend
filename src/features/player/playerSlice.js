import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { httpClient } from '../../api/httpClient';

// Thunk to fetch all tracks for shuffle pool
export const fetchGlobalTracks = createAsyncThunk(
    'player/fetchGlobalTracks',
    async (_, { rejectWithValue }) => {
        try {
            const response = await httpClient.get('/api/listTracks');
            // Return empty array if data is invalid, otherwise return data
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error('Failed to fetch global tracks for shuffle:', error);
            return rejectWithValue(error.message);
        }
    }
);

// Thunk to handle shuffle toggle with data fetching
export const toggleShuffle = createAsyncThunk(
    'player/toggleShuffle',
    async (_, { dispatch, getState }) => {
        const state = getState().player;

        if (state.shuffle) {
            // Turn Shuffle OFF
            dispatch(playerSlice.actions.setShuffleInternal(false));
            // We keep the current queue as is, playing linearly until done
        } else {
            // Turn Shuffle ON
            dispatch(playerSlice.actions.setShuffleInternal(true));

            let allTracks = state.globalTracks;

            // If we don't have the global list, fetch it
            if (!allTracks || allTracks.length === 0) {
                const action = await dispatch(fetchGlobalTracks());
                if (fetchGlobalTracks.fulfilled.match(action)) {
                    allTracks = action.payload;
                }
            }

            // Initialize the shuffle queue if we have tracks
            if (allTracks && allTracks.length > 0) {
                dispatch(playerSlice.actions.initShuffleQueue());
            }
        }
    }
);

const initialState = {
    queue: [],
    currentIndex: -1,
    currentTrack: null,
    status: 'idle', // 'idle' | 'loading' | 'playing' | 'paused' | 'error'
    position: 0,
    duration: 0,
    volume: 0.8,
    muted: false,
    shuffle: false,
    repeat: 'off', // 'off' | 'one' | 'all'
    playedSet: [], // Kept for legacy compatibility

    // New Shuffle Logic State
    globalTracks: [],      // Stores all tracks from /api/listTracks
    shuffledIndices: [],   // Random permutation of indices for globalTracks
    nextBatchStart: 0,     // Pointer for the next batch of 20
};

const playerSlice = createSlice({
    name: 'player',
    initialState,
    reducers: {
        setQueue: (state, action) => {
            state.queue = action.payload;
            state.playedSet = [];
            state.shuffle = false; // Reset shuffle if manually setting queue
        },
        addToQueue: (state, action) => {
            const track = action.payload;
            const exists = state.queue.some((t) => t.fileHash === track.fileHash);
            if (!exists) {
                state.queue.push(track);
            }
        },
        removeFromQueue: (state, action) => {
            const index = action.payload;
            if (index >= 0 && index < state.queue.length) {
                state.queue.splice(index, 1);
                if (index < state.currentIndex) {
                    state.currentIndex--;
                } else if (index === state.currentIndex) {
                    state.currentTrack = state.queue[state.currentIndex] || null;
                }
            }
        },
        clearQueue: (state) => {
            state.queue = [];
            state.currentIndex = -1;
            state.currentTrack = null;
            state.status = 'idle';
            state.position = 0;
            state.duration = 0;
            state.playedSet = [];
            state.nextBatchStart = 0;
        },
        playTrack: (state, action) => {
            const { track, queue } = action.payload;
            if (queue) {
                state.queue = queue;
                state.playedSet = [];
                state.shuffle = false; // Disable shuffle on specific play
            }
            const index = state.queue.findIndex((t) => t.fileHash === track.fileHash);
            if (index !== -1) {
                state.currentIndex = index;
                state.currentTrack = track;
                state.status = 'loading';
                state.position = 0;
            }
        },
        playAtIndex: (state, action) => {
            const index = action.payload;
            if (index >= 0 && index < state.queue.length) {
                state.currentIndex = index;
                state.currentTrack = state.queue[index];
                state.status = 'loading';
                state.position = 0;
            }
        },

        // Internal reducer to toggle the boolean flag
        setShuffleInternal: (state, action) => {
            state.shuffle = action.payload;
        },

        // Helper to randomize indices and load first batch
        initShuffleQueue: (state) => {
            if (state.globalTracks.length === 0) return;

            // 1. Create indices array [0, 1, ..., N-1]
            const indices = Array.from({ length: state.globalTracks.length }, (_, i) => i);

            // 2. Fisher-Yates Shuffle
            for (let i = indices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [indices[i], indices[j]] = [indices[j], indices[i]];
            }

            state.shuffledIndices = indices;
            state.nextBatchStart = 0;

            // 3. Load first batch
            playerSlice.caseReducers.loadNextShuffleBatch(state);
        },

        // Helper to load next 20 songs from shuffledIndices
        loadNextShuffleBatch: (state) => {
            const BATCH_SIZE = 20;
            const total = state.shuffledIndices.length;

            if (total === 0) return;

            // Check if we exhausted the global list
            if (state.nextBatchStart >= total) {
                if (state.repeat === 'all') {
                    // Reshuffle and start over
                    for (let i = total - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [state.shuffledIndices[i], state.shuffledIndices[j]] = [state.shuffledIndices[j], state.shuffledIndices[i]];
                    }
                    state.nextBatchStart = 0;
                } else {
                    // Stop playing
                    state.status = 'idle';
                    return;
                }
            }

            // Slice the next batch of indices
            const end = Math.min(state.nextBatchStart + BATCH_SIZE, total);
            const batchIndices = state.shuffledIndices.slice(state.nextBatchStart, end);

            // Map indices to actual track objects
            const newQueue = batchIndices.map(i => state.globalTracks[i]);

            state.queue = newQueue;
            state.currentIndex = 0;
            state.currentTrack = newQueue[0];
            state.status = 'loading';
            state.position = 0;
            state.nextBatchStart = end;
        },

        playNext: (state) => {
            if (state.queue.length === 0) return;

            // Repeat One logic: Replay current
            if (state.repeat === 'one') {
                state.status = 'loading';
                state.position = 0;
                return;
            }

            if (state.shuffle) {
                // Shuffle Mode Logic
                if (state.currentIndex < state.queue.length - 1) {
                    // Just play next in the current batch of 20
                    state.currentIndex++;
                    state.currentTrack = state.queue[state.currentIndex];
                    state.status = 'loading';
                    state.position = 0;
                } else {
                    // Batch ended, load next 20 random songs
                    playerSlice.caseReducers.loadNextShuffleBatch(state);
                }
            } else {
                // Standard Linear Logic
                let nextIndex = state.currentIndex + 1;

                if (nextIndex >= state.queue.length) {
                    if (state.repeat === 'all') {
                        nextIndex = 0;
                    } else {
                        state.status = 'idle';
                        return;
                    }
                }

                state.currentIndex = nextIndex;
                state.currentTrack = state.queue[nextIndex];
                state.status = 'loading';
                state.position = 0;
            }
        },
        playPrev: (state) => {
            if (state.queue.length === 0) return;

            if (state.position > 3) {
                state.position = 0;
                state.status = 'loading';
                return;
            }

            let prevIndex = state.currentIndex - 1;
            if (prevIndex < 0) {
                // For shuffle, we just loop the current batch for simplicity
                // or stop if not repeat all.
                if (state.repeat === 'all') {
                    prevIndex = state.queue.length - 1;
                } else {
                    prevIndex = 0;
                }
            }
            state.currentIndex = prevIndex;
            state.currentTrack = state.queue[prevIndex];
            state.status = 'loading';
            state.position = 0;
        },
        setStatus: (state, action) => {
            state.status = action.payload;
        },
        setPosition: (state, action) => {
            state.position = action.payload;
        },
        setDuration: (state, action) => {
            state.duration = action.payload;
        },
        setVolume: (state, action) => {
            state.volume = action.payload;
            state.muted = action.payload === 0;
        },
        toggleMute: (state) => {
            state.muted = !state.muted;
        },
        setRepeat: (state, action) => {
            state.repeat = action.payload;
        },
        toggleRepeat: (state) => {
            const modes = ['off', 'all', 'one'];
            const currentIndex = modes.indexOf(state.repeat);
            state.repeat = modes[(currentIndex + 1) % modes.length];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchGlobalTracks.fulfilled, (state, action) => {
                state.globalTracks = action.payload;
            });
    },
});

export const {
    setQueue,
    addToQueue,
    removeFromQueue,
    clearQueue,
    playTrack,
    playAtIndex,
    playNext,
    playPrev,
    setStatus,
    setPosition,
    setDuration,
    setVolume,
    toggleMute,
    setRepeat,
    toggleRepeat,
} = playerSlice.actions;

export const selectPlayerState = (state) => state.player;
export const selectCurrentTrack = (state) => state.player.currentTrack;
export const selectQueue = (state) => state.player.queue;
export const selectIsPlaying = (state) => state.player.status === 'playing';
export const selectPlayerStatus = (state) => state.player.status;
export const selectPosition = (state) => state.player.position;
export const selectDuration = (state) => state.player.duration;
export const selectVolume = (state) => state.player.volume;
export const selectIsMuted = (state) => state.player.muted;
export const selectShuffle = (state) => state.player.shuffle;
export const selectRepeat = (state) => state.player.repeat;
// ADDED: Missing selector
export const selectCurrentIndex = (state) => state.player.currentIndex;

export default playerSlice.reducer;