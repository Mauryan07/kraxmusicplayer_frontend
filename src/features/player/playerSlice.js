import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentTrack: null,
    queue: [],
    currentIndex: 0,
    status: 'idle', // idle | loading | playing | paused | error
    position: 0,
    duration: 0,
    volume: 1,
    muted: false,
    shuffle: false,
    repeat: 'off', // off | all | one
};

const playerSlice = createSlice({
    name: 'player',
    initialState,
    reducers: {
        playTrack: (state, action) => {
            const { track, queue = [], startIndex } = action.payload;
            state.currentTrack = track;
            state.queue = queue. length > 0 ?  queue : [track];
            state.currentIndex = startIndex ??  queue.findIndex((t) => t.fileHash === track. fileHash);
            if (state.currentIndex === -1) state.currentIndex = 0;
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
            if (action.payload > 0) state.muted = false;
        },
        toggleMute: (state) => {
            state.muted = ! state.muted;
        },
        toggleShuffle: (state) => {
            state.shuffle = !state.shuffle;
        },
        toggleRepeat: (state) => {
            const modes = ['off', 'all', 'one'];
            const currentIdx = modes.indexOf(state. repeat);
            state.repeat = modes[(currentIdx + 1) % modes.length];
        },
        playNext: (state) => {
            if (state.queue. length === 0) return;

            let nextIndex;
            if (state.shuffle) {
                nextIndex = Math.floor(Math.random() * state.queue. length);
            } else {
                nextIndex = state.currentIndex + 1;
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
            state.currentTrack = state. queue[nextIndex];
            state.status = 'loading';
            state. position = 0;
        },
        playPrev: (state) => {
            if (state.queue.length === 0) return;

            // If more than 3 seconds in, restart current track
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
            state.currentTrack = state. queue[prevIndex];
            state.status = 'loading';
            state.position = 0;
        },
        addToQueue: (state, action) => {
            const track = action.payload;
            // Avoid duplicates at end
            const lastTrack = state.queue[state.queue. length - 1];
            if (lastTrack?. fileHash !== track.fileHash) {
                state. queue.push(track);
            }
        },
        removeFromQueue: (state, action) => {
            const indexToRemove = action.payload;
            if (indexToRemove < 0 || indexToRemove >= state.queue.length) return;

            state.queue. splice(indexToRemove, 1);

            // Adjust currentIndex if needed
            if (indexToRemove < state.currentIndex) {
                state. currentIndex--;
            } else if (indexToRemove === state.currentIndex) {
                // If we removed the current track, play next
                if (state.queue.length > 0) {
                    state.currentIndex = Math.min(state. currentIndex, state. queue.length - 1);
                    state.currentTrack = state. queue[state.currentIndex];
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
    toggleShuffle,
    toggleRepeat,
    playNext,
    playPrev,
    addToQueue,
    removeFromQueue,
    clearQueue,
    setQueue,
} = playerSlice.actions;

// Selectors
export const selectCurrentTrack = (state) => state.player.currentTrack;
export const selectQueue = (state) => state.player.queue;
export const selectCurrentIndex = (state) => state.player.currentIndex;
export const selectPlayerStatus = (state) => state.player. status;
export const selectPosition = (state) => state.player.position;
export const selectDuration = (state) => state.player.duration;
export const selectVolume = (state) => state.player.volume;
export const selectIsMuted = (state) => state.player.muted;
export const selectShuffle = (state) => state.player. shuffle;
export const selectRepeat = (state) => state.player.repeat;

export default playerSlice.reducer;