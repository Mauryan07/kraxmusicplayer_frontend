import { createSlice } from '@reduxjs/toolkit';

// --- Utility for random unique queue ---
function getShuffledQueue(allTracks, currentTrack, queueLength = 20) {
    // Remove currentTrack from shuffle pool, if present.
    const rest = allTracks.filter(t => t.fileHash !== currentTrack.fileHash);
    // Shuffle rest (Fisher-Yates)
    for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    // Start with currentTrack, then next 19 from pool (or fewer if not enough!)
    return [currentTrack, ...rest.slice(0, queueLength - 1)];
}

const initialState = {
    currentTrack: null,
    queue: [],
    currentIndex: 0,
    status: 'idle',
    position: 0,
    duration: 0,
    volume: 1,
    muted: false,
    shuffle: false,
    repeat: 'off', // off | all | one
    // ----
    allTracks: [], // full library, must be set by you (see below)
    unshuffledQueue: [],
};

const playerSlice = createSlice({
    name: 'player',
    initialState,
    reducers: {
        playTrack: (state, action) => {
            const { track, queue = [], startIndex, allTracks } = action.payload;
            state.currentTrack = track;
            state.queue = queue.length > 0 ? queue : [track];
            state.currentIndex = startIndex ?? state.queue.findIndex((t) => t.fileHash === track.fileHash);
            if (state.currentIndex === -1) state.currentIndex = 0;
            state.status = 'loading';
            state.position = 0;
            // Set allTracks if provided
            if (allTracks) state.allTracks = allTracks;
            // If shuffle is ON, always generate a new shuffle set!
            if (state.shuffle && state.allTracks.length) {
                state.unshuffledQueue = state.queue;
                state.queue = getShuffledQueue(state.allTracks, track, 20);
                state.currentIndex = 0;
            }
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
            if (action.payload > 0) state.muted = false;
        },
        toggleMute: (state) => {
            state.muted = !state.muted;
        },
        setAllTracks: (state, action) => {
            state.allTracks = action.payload;
        },
        toggleShuffle: (state) => {
            state.shuffle = !state.shuffle;
            if (state.shuffle) {
                // Save current queue for unshuffle restore
                state.unshuffledQueue = state.queue.slice();
                // Shuffle 20 random non-repeating tracks, starting from currentTrack
                if (state.currentTrack && state.allTracks.length) {
                    state.queue = getShuffledQueue(state.allTracks, state.currentTrack, 20);
                    state.currentIndex = 0;
                }
            } else {
                if (state.unshuffledQueue.length) {
                    // Try to restore track position
                    const prevIndex = state.unshuffledQueue.findIndex(t => t.fileHash === state.currentTrack?.fileHash);
                    state.queue = state.unshuffledQueue;
                    state.currentIndex = prevIndex !== -1 ? prevIndex : 0;
                }
            }
        },
        toggleRepeat: (state) => {
            const modes = ['off', 'all', 'one'];
            const currentIdx = modes.indexOf(state.repeat);
            state.repeat = modes[(currentIdx + 1) % modes.length];
        },
        playNext: (state) => {
            if (state.queue.length === 0) return;
            let nextIndex = state.currentIndex + 1;
            // If shuffle ON and end of queue, regenerate unique shuffle
            if (state.shuffle) {
                if (nextIndex >= state.queue.length) {
                    if (state.currentTrack && state.allTracks.length) {
                        state.queue = getShuffledQueue(state.allTracks, state.currentTrack, 20);
                        state.currentIndex = 0;
                        state.currentTrack = state.queue[0];
                        state.status = 'loading';
                        state.position = 0;
                        return;
                    }
                }
            }
            if (nextIndex >= state.queue.length) {
                if (state.repeat === 'all') {
                    nextIndex = 0;
                } else {
                    state.status = 'paused';
                    return;
                }
            }
            state.currentIndex = nextIndex;
            state.currentTrack = state.queue[nextIndex];
            state.status = 'loading';
            state.position = 0;
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
                prevIndex = state.repeat === 'all' ? state.queue.length - 1 : 0;
            }
            state.currentIndex = prevIndex;
            state.currentTrack = state.queue[prevIndex];
            state.status = 'loading';
            state.position = 0;
        },
        addToQueue: (state, action) => {
            const track = action.payload;
            const lastTrack = state.queue[state.queue.length - 1];
            if (lastTrack?.fileHash !== track.fileHash) {
                state.queue.push(track);
            }
        },
        removeFromQueue: (state, action) => {
            const indexToRemove = action.payload;
            if (indexToRemove < 0 || indexToRemove >= state.queue.length) return;
            state.queue.splice(indexToRemove, 1);
            if (indexToRemove < state.currentIndex) {
                state.currentIndex--;
            } else if (indexToRemove === state.currentIndex) {
                if (state.queue.length > 0) {
                    state.currentIndex = Math.min(state.currentIndex, state.queue.length - 1);
                    state.currentTrack = state.queue[state.currentIndex];
                    state.status = 'loading';
                } else {
                    state.currentTrack = null;
                    state.status = 'idle';
                }
            }
        },
        clearQueue: (state) => {
            state.queue = [];
            state.currentTrack = null;
            state.currentIndex = 0;
            state.status = 'idle';
            state.position = 0;
            state.duration = 0;
        },
        setQueue: (state, action) => {
            state.queue = action.payload;
        },
    },
});

export const {
    playTrack,
    setStatus,
    setPosition,
    setDuration,
    setVolume,
    toggleMute,
    setAllTracks,
    toggleShuffle,
    toggleRepeat,
    playNext,
    playPrev,
    addToQueue,
    removeFromQueue,
    clearQueue,
    setQueue,
} = playerSlice.actions;

export const selectCurrentTrack = (state) => state.player.currentTrack;
export const selectQueue = (state) => state.player.queue;
export const selectCurrentIndex = (state) => state.player.currentIndex;
export const selectPlayerStatus = (state) => state.player.status;
export const selectPosition = (state) => state.player.position;
export const selectDuration = (state) => state.player.duration;
export const selectVolume = (state) => state.player.volume;
export const selectIsMuted = (state) => state.player.muted;
export const selectShuffle = (state) => state.player.shuffle;
export const selectRepeat = (state) => state.player.repeat;

export default playerSlice.reducer;