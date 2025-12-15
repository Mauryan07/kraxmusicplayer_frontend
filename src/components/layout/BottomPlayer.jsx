import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    selectCurrentTrack,
    selectPlayerStatus,
    selectPosition,
    selectDuration,
    selectVolume,
    selectIsMuted,
    selectShuffle,
    selectRepeat,
    playNext,
    playPrev,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
} from '../../features/player/playerSlice';
import playerService from '../../services/playerService';
import { getApiBase } from '../../api/httpClient';

const formatTime = (seconds) => {
    if (! seconds || isNaN(seconds) || seconds === Infinity) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const BottomPlayer = () => {
    const dispatch = useDispatch();
    const currentTrack = useSelector(selectCurrentTrack);
    const status = useSelector(selectPlayerStatus);
    const position = useSelector(selectPosition);
    const duration = useSelector(selectDuration);
    const volume = useSelector(selectVolume);
    const muted = useSelector(selectIsMuted);
    const shuffle = useSelector(selectShuffle);
    const repeat = useSelector(selectRepeat);

    const isPlaying = status === 'playing';
    const isLoading = status === 'loading';

    useEffect(() => {
        if (currentTrack) {
            playerService.loadTrack(currentTrack);
        }
    }, [currentTrack?. fileHash]);

    useEffect(() => {
        playerService.setVolume(muted ? 0 : volume);
    }, [volume, muted]);

    const handlePlayPause = () => {
        if (isPlaying) {
            playerService.pause();
        } else {
            playerService.play();
        }
    };

    const handleSeek = (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) {
            playerService.seek(value);
        }
    };

    const handleVolumeChange = (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) {
            dispatch(setVolume(value));
        }
    };

    const handleProgressClick = (e) => {
        if (! duration || duration === 0) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const newTime = percent * duration;
        if (! isNaN(newTime)) {
            playerService.seek(newTime);
        }
    };

    if (! currentTrack) return null;

    // Use dynamic API base
    const artworkUrl = currentTrack.fileHash
        ? `${getApiBase()}/api/track/${currentTrack.fileHash}/artwork`
        : null;

    const progress = duration > 0 ?  (position / duration) * 100 : 0;
    const subtitle = currentTrack. album || null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-base-200 border-t border-base-300 shadow-lg">
            {/* Progress Bar */}
            <div
                className="h-1 bg-base-300 cursor-pointer group"
                onClick={handleProgressClick}
            >
                <div
                    className="h-full bg-primary transition-all duration-150"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                />
            </div>

            {/* Player Content */}
            <div className="px-3 py-2 sm:px-4 sm:py-3">
                <div className="max-w-7xl mx-auto flex items-center gap-3 sm: gap-4">

                    {/* Artwork */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-base-300 flex-shrink-0">
                        {artworkUrl ? (
                            <img
                                src={artworkUrl}
                                alt={currentTrack.title || 'Now playing'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl">
                                🎵
                            </div>
                        )}
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                            {currentTrack.title || 'Untitled'}
                        </p>
                        {subtitle && (
                            <p className="text-xs text-base-content/60 truncate">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        <button
                            className={`btn btn-ghost btn-xs btn-circle hidden lg:flex ${shuffle ? 'text-primary' : 'text-base-content/50'}`}
                            onClick={() => dispatch(toggleShuffle())}
                            title="Shuffle"
                        >
                            🔀
                        </button>

                        <button
                            className="btn btn-ghost btn-sm btn-circle"
                            onClick={() => dispatch(playPrev())}
                            title="Previous"
                        >
                            ⏮️
                        </button>

                        <button
                            className="btn btn-primary btn-circle btn-sm sm:btn-md"
                            onClick={handlePlayPause}
                            disabled={isLoading}
                            title={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isLoading ? (
                                <span className="loading loading-spinner loading-xs sm:loading-sm" />
                            ) : (
                                <span className="text-sm sm:text-lg">{isPlaying ? '⏸️' :  '▶️'}</span>
                            )}
                        </button>

                        <button
                            className="btn btn-ghost btn-sm btn-circle"
                            onClick={() => dispatch(playNext())}
                            title="Next"
                        >
                            ⏭️
                        </button>

                        <button
                            className={`btn btn-ghost btn-xs btn-circle hidden lg:flex ${repeat !== 'off' ?  'text-primary' : 'text-base-content/50'}`}
                            onClick={() => dispatch(toggleRepeat())}
                            title={`Repeat:  ${repeat}`}
                        >
                            {repeat === 'one' ? '🔂' : '🔁'}
                        </button>
                    </div>

                    {/* Time & Seek - Desktop */}
                    <div className="hidden md:flex items-center gap-2 flex-1 max-w-xs">
            <span className="text-xs text-base-content/60 w-10 text-right font-mono">
              {formatTime(position)}
            </span>
                        <input
                            type="range"
                            min="0"
                            max={duration || 100}
                            value={position || 0}
                            onChange={handleSeek}
                            className="range range-xs range-primary flex-1"
                        />
                        <span className="text-xs text-base-content/60 w-10 font-mono">
              {formatTime(duration)}
            </span>
                    </div>

                    {/* Volume - Desktop only */}
                    <div className="hidden lg:flex items-center gap-2">
                        <button
                            className="btn btn-ghost btn-sm btn-circle"
                            onClick={() => dispatch(toggleMute())}
                            title={muted ? 'Unmute' :  'Mute'}
                        >
                            {muted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={muted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="range range-xs w-24"
                        />
                    </div>
                </div>

                {/* Mobile Time Display */}
                <div className="flex md:hidden justify-between text-xs text-base-content/50 mt-1 px-1">
                    <span className="font-mono">{formatTime(position)}</span>
                    <span className="font-mono">{formatTime(duration)}</span>
                </div>
            </div>
        </div>
    );
};

export default BottomPlayer;