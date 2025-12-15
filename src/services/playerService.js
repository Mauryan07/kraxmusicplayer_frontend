import store from '../app/store';
import {
    setStatus,
    setPosition,
    setDuration,
    playNext,
} from '../features/player/playerSlice';
import { getApiBase } from '../api/httpClient';

class PlayerService {
    constructor() {
        this.audio = new Audio();
        this.audio.preload = 'metadata';

        // Bind event handlers
        this. audio.addEventListener('loadedmetadata', this.handleLoadedMetadata.bind(this));
        this.audio.addEventListener('timeupdate', this. handleTimeUpdate.bind(this));
        this.audio.addEventListener('ended', this. handleEnded.bind(this));
        this.audio.addEventListener('error', this. handleError.bind(this));
        this.audio.addEventListener('playing', () => store.dispatch(setStatus('playing')));
        this.audio. addEventListener('pause', () => store.dispatch(setStatus('paused')));
        this.audio.addEventListener('waiting', () => store.dispatch(setStatus('loading')));
    }

    loadTrack(track) {
        if (! track?. fileHash) return;

        store.dispatch(setStatus('loading'));

        // Use dynamic API base
        const audioUrl = `${getApiBase()}/api/track/${track.fileHash}/audio`;

        console.log('[Player] Loading track:', audioUrl);

        this.audio.src = audioUrl;
        this.audio.load();
    }

    play() {
        this.audio.play().catch((err) => {
            console.error('[Player] Play error:', err);
            store.dispatch(setStatus('error'));
        });
    }

    pause() {
        this.audio.pause();
    }

    seek(time) {
        if (! isNaN(time) && isFinite(time)) {
            this.audio. currentTime = time;
        }
    }

    setVolume(volume) {
        this.audio.volume = Math. max(0, Math.min(1, volume));
    }

    handleLoadedMetadata() {
        const duration = this.audio.duration;
        if (!isNaN(duration) && isFinite(duration)) {
            store.dispatch(setDuration(duration));
        }
        this.play();
    }

    handleTimeUpdate() {
        const position = this.audio.currentTime;
        if (! isNaN(position)) {
            store.dispatch(setPosition(position));
        }
    }

    handleEnded() {
        store. dispatch(playNext());
    }

    handleError(e) {
        console. error('[Player] Audio error:', e);
        store.dispatch(setStatus('error'));
    }
}

const playerService = new PlayerService();
export default playerService;