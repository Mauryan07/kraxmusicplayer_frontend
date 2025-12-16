import React, { useEffect, useState } from 'react';
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
    selectQueue,
    playNext,
    playPrev,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
} from '../../features/player/playerSlice';
import playerService from '../../services/playerService';
import { getApiBase } from '../../api/httpClient';
import QueueList from '../../features/player/QueueList.jsx';
import MarqueeTrackTitle from '../player/MarqueeTrackTitle';

const SVG = {
    shuffle: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 3h5v5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 20l14-14" strokeLinecap="round" />
            <path d="M21 21l-5-5" strokeLinecap="round"/>
            <path d="M4 4l14 14" strokeLinecap="round"/>
        </svg>
    ),
    prev: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="19 20 9 12 19 4 19 20" />
            <rect x="5" y="4" width="2" height="16" rx="1" />
        </svg>
    ),
    play: (
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="6 4 20 12 6 20 6 4" />
        </svg>
    ),
    pause: (
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
    ),
    next: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5 20 15 12 5 4 5 20" />
            <rect x="17" y="4" width="2" height="16" rx="1" />
        </svg>
    ),
    repeat: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 1l4 4-4 4" />
            <path d="M3 11v-1a4 4 0 014-4h14" />
            <path d="M7 23l-4-4 4-4" />
            <path d="M21 13v1a4 4 0 01-4 4H3" />
        </svg>
    ),
    queue: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="6" width="18" height="2" rx="1"/>
            <rect x="3" y="12" width="18" height="2" rx="1"/>
            <rect x="3" y="18" width="12" height="2" rx="1"/>
        </svg>
    ),
    arrowDown: (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"/>
        </svg>
    ),
    volume: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M23 9v6"/>
        </svg>
    ),
    mute: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <line x1="23" y1="9" x2="17" y2="15"/>
            <line x1="17" y1="9" x2="23" y2="15"/>
        </svg>
    ),
};

const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds) || seconds === Infinity) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const useScreen = () => {
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return { isDesktop: width >= 1024 };
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
    const queue = useSelector(selectQueue);

    const [queueOpen, setQueueOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const { isDesktop } = useScreen();
    const isPlaying = status === 'playing';
    const isLoading = status === 'loading';

    useEffect(() => {
        if (currentTrack) playerService.loadTrack(currentTrack);
    }, [currentTrack?.fileHash]);

    useEffect(() => {
        playerService.setVolume(muted ? 0 : volume);
    }, [volume, muted]);

    const handlePlayPause = () => { isPlaying ? playerService.pause() : playerService.play(); };
    const handleSeek = (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) playerService.seek(value);
    };
    const handleVolumeChange = (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) dispatch(setVolume(value));
    };
    const handleProgressClick = (e) => {
        if (!duration || duration === 0) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const newTime = percent * duration;
        if (!isNaN(newTime)) playerService.seek(newTime);
    };
    if (!currentTrack) return null;
    const artworkUrl = currentTrack.fileHash
        ? `${getApiBase()}/api/track/${currentTrack.fileHash}/artwork`
        : null;
    const progress = duration > 0 ? (position / duration) * 100 : 0;
    const subtitle = currentTrack.album || null;
    const gradientClass =
        'bg-gradient-to-br from-base-300 via-base-200 to-base-100 dark:from-[#222] dark:via-[#111] dark:to-black';

    return (
        <>
            {/* Compact Player Bar */}
            {!expanded && (
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
                    <div className="px-3 py-2 sm:px-4 sm:py-3">
                        <div className="max-w-7xl mx-auto flex items-center gap-3 sm:gap-4">
                            {/* Artwork clickable! */}
                            <div
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-base-300 flex-shrink-0 cursor-pointer"
                                onClick={() => setExpanded(true)}
                            >
                                {artworkUrl ? (
                                    <img
                                        src={artworkUrl}
                                        alt={currentTrack.title || 'Now playing'}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.style.display = 'none'; }}
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
                                    <p className="text-xs text-base-content/60 truncate">{subtitle}</p>
                                )}
                            </div>
                            {/* Controls */}
                            <div className="flex items-center gap-1 sm:gap-2">
                                {!isDesktop && (
                                    <>
                                        <button
                                            className={`rounded-full bg-base-300 hover:bg-primary/60 transition-colors p-2 disabled:opacity-60 ${
                                                shuffle
                                                    ? 'text-primary'
                                                    : 'text-base-content/60'
                                            }`}
                                            onClick={() => dispatch(toggleShuffle())}
                                            title="Shuffle"
                                        >
                                            {SVG.shuffle}
                                        </button>
                                        <button
                                            className="rounded-full bg-primary text-primary-content hover:bg-primary/90 transition-colors p-2 shadow-md"
                                            onClick={handlePlayPause}
                                            disabled={isLoading}
                                            title={isPlaying ? 'Pause' : 'Play'}
                                        >
                                            {isLoading ? (
                                                <span className="loading loading-spinner loading-xs" />
                                            ) : isPlaying ? (
                                                SVG.pause
                                            ) : (
                                                SVG.play
                                            )}
                                        </button>
                                    </>
                                )}
                                {isDesktop && (
                                    <>
                                        <button
                                            className={`rounded-full p-2 hover:bg-base-300 ${
                                                shuffle
                                                    ? 'text-primary'
                                                    : 'text-base-content/50'
                                            }`}
                                            onClick={() => dispatch(toggleShuffle())}
                                            title="Shuffle"
                                        >
                                            {SVG.shuffle}
                                        </button>
                                        <button
                                            className="rounded-full p-2 hover:bg-base-300"
                                            onClick={() => dispatch(playPrev())}
                                            title="Previous"
                                        >
                                            {SVG.prev}
                                        </button>

                                        <button
                                            className="rounded-full bg-primary text-primary-content shadow-md p-2 hover:bg-primary/90"
                                            onClick={handlePlayPause}
                                            disabled={isLoading}
                                            title={isPlaying ? 'Pause' : 'Play'}
                                        >
                                            {isLoading ? (
                                                <span className="loading loading-spinner loading-xs" />
                                            ) : isPlaying ? (
                                                SVG.pause
                                            ) : (
                                                SVG.play
                                            )}
                                        </button>

                                        <button
                                            className="rounded-full p-2 hover:bg-base-300"
                                            onClick={() => dispatch(playNext())}
                                            title="Next"
                                        >
                                            {SVG.next}
                                        </button>
                                        <button
                                            className={`rounded-full p-2 hover:bg-base-300 ${
                                                repeat !== 'off'
                                                    ? 'text-primary'
                                                    : 'text-base-content/50'
                                            }`}
                                            onClick={() => dispatch(toggleRepeat())}
                                            title={`Repeat: ${repeat}`}
                                        >
                                            {SVG.repeat}
                                        </button>
                                        <button
                                            className="rounded-full p-2 hover:bg-base-300 relative"
                                            onClick={() => setQueueOpen(true)}
                                            title="View Queue"
                                        >
                                            {SVG.queue}
                                            {queue.length > 0 && (
                                                <span className="absolute -top-2 -right-2 badge badge-primary badge-xs">
                                                    {queue.length}
                                                </span>
                                            )}
                                        </button>
                                        <div className="hidden lg:flex items-center gap-2">
                                            <button
                                                className="rounded-full p-2 hover:bg-base-300"
                                                onClick={() => dispatch(toggleMute())}
                                                title={muted ? 'Unmute' : 'Mute'}
                                            >
                                                {muted || volume === 0
                                                    ? SVG.mute
                                                    : SVG.volume}
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
                                    </>
                                )}
                            </div>
                        </div>
                        {/* Mobile Time Display */}
                        <div className="flex md:hidden justify-between text-xs text-base-content/50 mt-1 px-1">
                            <span className="font-mono">{formatTime(position)}</span>
                            <span className="font-mono">{formatTime(duration)}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Expanded Overlay Player */}
            {expanded && (
                <>
                    <div
                        className={`fixed inset-0 z-[100] flex flex-col items-center px-2 pb-2 pt-10 md:pt-16 transition-all duration-200 ${gradientClass}`}
                    >
                        {/* Queue Button (top left) */}
                        <div className="absolute left-2 top-2">
                            <button
                                className="rounded-full p-2 bg-base-300 bg-opacity-60 hover:bg-base-100 shadow transition"
                                onClick={() => setQueueOpen(true)}
                                title="View Queue"
                            >
                                {SVG.queue}
                                {queue.length > 0 && (
                                    <span className="absolute -top-2 -right-2 badge badge-primary badge-xs">
                                        {queue.length}
                                    </span>
                                )}
                            </button>
                        </div>
                        {/* Collapse Button (top right) */}
                        <div className="absolute right-3 top-3 z-20">
                            <button
                                className="rounded-full p-1 bg-base-100/80 hover:bg-base-200 transition"
                                onClick={() => setExpanded(false)}
                                title="Minimize"
                            >
                                {SVG.arrowDown}
                            </button>
                        </div>
                        {/* Artwork center */}
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <div className="w-2/3 max-w-xs aspect-square rounded-3xl overflow-hidden bg-base-300 shadow-lg mb-6">
                                {artworkUrl ? (
                                    <img
                                        src={artworkUrl}
                                        alt={currentTrack.title || 'Now playing'}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-7xl text-base-content/20">
                                        🎵
                                    </div>
                                )}
                            </div>
                            {/* Track Info */}
                            <div className="text-center mb-4 px-2">
                                <MarqueeTrackTitle title={currentTrack.title || 'Untitled'} />
                                {subtitle && (
                                    <div className="text-base-content/60 text-sm truncate">{subtitle}</div>
                                )}
                            </div>
                            {/* Seek Bar */}
                            <div className="flex w-full max-w-lg mx-auto items-center gap-2 mb-4 px-2">
                                <span className="text-xs text-base-content/60 font-mono min-w-[36px] text-right">
                                    {formatTime(position)}
                                </span>
                                <input
                                    type="range"
                                    min="0"
                                    max={duration || 100}
                                    value={position || 0}
                                    onChange={handleSeek}
                                    className="range range-sm range-primary flex-1"
                                />
                                <span className="text-xs text-base-content/60 font-mono min-w-[36px] text-left">
                                    {formatTime(duration)}
                                </span>
                            </div>
                            {/* Controls */}
                            <div className="flex items-center justify-center gap-5 mt-2">
                                <button
                                    className={`rounded-full p-4 bg-base-300 hover:bg-primary/60 transition-colors text-xl ${
                                        shuffle
                                            ? 'text-primary'
                                            : 'text-base-content/60'
                                    }`}
                                    onClick={() => dispatch(toggleShuffle())}
                                    title="Shuffle"
                                >
                                    {SVG.shuffle}
                                </button>
                                <button
                                    className="rounded-full p-4 bg-base-300 hover:bg-base-100 transition-colors text-xl"
                                    onClick={() => dispatch(playPrev())}
                                    title="Previous"
                                >
                                    {SVG.prev}
                                </button>
                                <button
                                    className="rounded-full bg-primary text-primary-content shadow-lg p-6 hover:bg-primary/90 transition-colors text-3xl"
                                    onClick={handlePlayPause}
                                    disabled={isLoading}
                                    title={isPlaying ? 'Pause' : 'Play'}
                                >
                                    {isLoading ? (
                                        <span className="loading loading-spinner loading-md" />
                                    ) : isPlaying ? (
                                        SVG.pause
                                    ) : (
                                        SVG.play
                                    )}
                                </button>
                                <button
                                    className="rounded-full p-4 bg-base-300 hover:bg-base-100 transition-colors text-xl"
                                    onClick={() => dispatch(playNext())}
                                    title="Next"
                                >
                                    {SVG.next}
                                </button>
                                <button
                                    className={`rounded-full p-4 bg-base-300 hover:bg-primary/60 transition-colors text-xl ${
                                        repeat !== 'off'
                                            ? 'text-primary'
                                            : 'text-base-content/60'
                                    }`}
                                    onClick={() => dispatch(toggleRepeat())}
                                    title={`Repeat: ${repeat}`}
                                >
                                    {SVG.repeat}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Queue List Modal */}
            <QueueList isOpen={queueOpen} onClose={() => setQueueOpen(false)} />
        </>
    );
};

export default BottomPlayer;