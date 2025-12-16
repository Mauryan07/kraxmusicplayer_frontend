import { createSlice } from '@reduxjs/toolkit';

// Utility: return a shuffled array of up to N tracks, optionally excluding one fileHash.
function getShuffledArray(tracks, exclude = null, count = 20) {
    const pool = exclude ? tracks.filter(t => t.fileHash !== exclude) : [...tracks];
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, count);
}

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
    playedSet: [],
};

const playerSlice = createSlice({
    name: 'player',
    initialState,
    reducers: {
        setQueue: (state, action) => {
            state.queue = action.payload;
            state.playedSet = [];
            state.currentIndex = 0;
            state.currentTrack = state.queue[0] || null;
        },
        addToQueue: (state, action) => {
            const track = action.payload;
            const exists = state.queue.some((t) => t.fileHash === track.fileHash);
            if (!exists) state.queue.push(track);
        },
        removeFromQueue: (state, action) => {
            const index = action.payload;
            if (index >= 0 && index < state.queue.length) {
                state.queue.splice(index, 1);
                if (index < state.currentIndex) state.currentIndex--;
                else if (index === state.currentIndex) {
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
        },
        playTrack: (state, action) => {
            const { track, queue } = action.payload;
            if (queue) {
                state.queue = queue;
                state.currentIndex = queue.findIndex((t) => t.fileHash === track.fileHash);
                state.currentTrack = track;
                state.status = 'loading';
                state.playedSet = [];
                state.position = 0;
            } else {
                const index = state.queue.findIndex((t) => t.fileHash === track.fileHash);
                if (index !== -1) {
                    state.currentIndex = index;
                    state.currentTrack = track;
                    state.status = 'loading';
                    state.position = 0;
                    if (state.shuffle && !state.playedSet.includes(track.fileHash)) {
                        state.playedSet.push(track.fileHash);
                    }
                }
            }
        },
        playAtIndex: (state, action) => {
            const index = action.payload;
            if (index >= 0 && index < state.queue.length) {
                state.currentIndex = index;
                state.currentTrack = state.queue[index];
                state.status = 'loading';
                state.position = 0;
                if (state.shuffle) {
                    const hash = state.queue[index].fileHash;
                    if (!state.playedSet.includes(hash)) state.playedSet.push(hash);
                }
            }
        },
        playNext: (state) => {
            if (state.queue.length === 0) return;
            if (state.repeat === 'one') {
                state.status = 'loading';
                state.position = 0;
                return;
            }
            if (state.shuffle) {
                if (state.currentIndex < state.queue.length - 1) {
                    state.currentIndex += 1;
                    state.currentTrack = state.queue[state.currentIndex];
                    state.playedSet.push(state.currentTrack.fileHash);
                    state.status = 'loading';
                    state.position = 0;
                } else {
                    // At end of shuffle: generate a new random, non-repeating queue of 20
                    // Always from the current queue universe.
                    const fresh = getShuffledArray(state.queue, null, 20);
                    state.queue = fresh;
                    state.currentIndex = 0;
                    state.currentTrack = state.queue[0];
                    state.playedSet = [state.currentTrack.fileHash];
                    state.status = 'loading';
                    state.position = 0;
                }
            } else {
                let nextIndex = state.currentIndex + 1;
                if (nextIndex >= state.queue.length) {
                    if (state.repeat === 'all') nextIndex = 0;
                    else {
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
                if (state.repeat === 'all') prevIndex = state.queue.length - 1;
                else prevIndex = 0;
            }
            state.currentIndex = prevIndex;
            state.currentTrack = state.queue[prevIndex];
            state.status = 'loading';
            state.position = 0;
        },
        setStatus: (state, action) => { state.status = action.payload; },
        setPosition: (state, action) => { state.position = action.payload; },
        setDuration: (state, action) => { state.duration = action.payload; },
        setVolume: (state, action) => {
            state.volume = action.payload;
            state.muted = action.payload === 0;
        },
        toggleMute: (state) => { state.muted = !state.muted; },
        toggleShuffle: (state) => {
            state.shuffle = !state.shuffle;
            if (state.shuffle && state.currentTrack && state.queue.length > 1) {
                const shuffled = getShuffledArray(state.queue, state.currentTrack.fileHash, 19);
                state.queue = [state.currentTrack, ...shuffled];
                state.currentIndex = 0;
                state.playedSet = [state.currentTrack.fileHash];
            } else {
                state.playedSet = [];
            }
        },
        setRepeat: (state, action) => { state.repeat = action.payload; },
        toggleRepeat: (state) => {
            const modes = ['off', 'all', 'one'];
            const currentIndex = modes.indexOf(state.repeat);
            state.repeat = modes[(currentIndex + 1) % modes.length];
        },
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
    toggleShuffle,
    setRepeat,
    toggleRepeat,
} = playerSlice.actions;

export const selectPlayerState = (state) => state.player;
export const selectCurrentTrack = (state) => state.player.currentTrack;
export const selectQueue = (state) => state.player.queue;
export const selectCurrentIndex = (state) => state.player.currentIndex;
export const selectIsPlaying = (state) => state.player.status === 'playing';
export const selectPlayerStatus = (state) => state.player.status;
export const selectPosition = (state) => state.player.position;
export const selectDuration = (state) => state.player.duration;
export const selectVolume = (state) => state.player.volume;
export const selectIsMuted = (state) => state.player.muted;
export const selectShuffle = (state) => state.player.shuffle;
export const selectRepeat = (state) => state.player.repeat;

export default playerSlice.reducer;