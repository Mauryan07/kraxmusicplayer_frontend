import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    selectQueue,
    selectCurrentTrack,
    selectCurrentIndex,
    playTrack,
    removeFromQueue,
    clearQueue,
} from './playerSlice.js';

const QueueList = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const queue = useSelector(selectQueue);
    const currentTrack = useSelector(selectCurrentTrack);
    const currentIndex = useSelector(selectCurrentIndex);

    const handlePlayTrack = (track, index) => {
        dispatch(playTrack({ track, queue, startIndex: index }));
    };

    const handleRemove = (e, index) => {
        e.stopPropagation();
        dispatch(removeFromQueue(index));
    };

    const handleClearQueue = () => {
        if (window.confirm('Clear entire queue?')) {
            dispatch(clearQueue());
        }
    };

    // Format duration - handles both string "MM:SS" and numeric seconds
    const formatDuration = (duration) => {
        if (!duration && duration !== 0) {
            return '--:--';
        }

        // If already in MM: SS format
        if (typeof duration === 'string' && duration.includes(':')) {
            return duration;
        }

        const seconds = Number(duration);
        if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) {
            return duration.toString() || '--:--';
        }

        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Queue Panel */}
            <div className="relative w-full max-w-lg max-h-[80vh] bg-base-100 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-base-200">
                    <div>
                        <h2 className="text-lg font-bold">🎵 Queue</h2>
                        <p className="text-sm text-base-content/60">
                            {queue.length} {queue.length === 1 ? 'track' : 'tracks'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {queue.length > 0 && (
                            <button
                                className="btn btn-ghost btn-sm text-error"
                                onClick={handleClearQueue}
                            >
                                Clear All
                            </button>
                        )}
                        <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
                            ✕
                        </button>
                    </div>
                </div>

                {/* Queue Items */}
                <div className="flex-1 overflow-y-auto p-2">
                    {queue.length > 0 ? (
                        <div className="space-y-1">
                            {queue.map((track, index) => {
                                const isPlaying = currentTrack?.fileHash === track.fileHash && index === currentIndex;

                                return (
                                    <div
                                        key={`${track.fileHash}-${index}`}
                                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all group ${
                                            isPlaying
                                                ? 'bg-primary/20 border border-primary/30'
                                                : 'bg-base-200 hover:bg-base-300'
                                        }`}
                                        onClick={() => handlePlayTrack(track, index)}
                                    >
                                        {/* Index / Playing Indicator */}
                                        <div className="w-8 text-center">
                                            {isPlaying ?  (
                                                <span className="text-primary animate-pulse">🎵</span>
                                            ) : (
                                                <span className="text-base-content/50 text-sm">{index + 1}</span>
                                            )}
                                        </div>

                                        {/* Track Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-medium text-sm truncate ${isPlaying ? 'text-primary' :  ''}`}>
                                                {track.title || 'Untitled'}
                                            </p>
                                            {track.album && (
                                                <p className="text-xs text-base-content/60 truncate">
                                                    {track.album}
                                                </p>
                                            )}
                                        </div>

                                        {/* Duration */}
                                        <span className="text-xs text-base-content/50">
                      {formatDuration(track.duration)}
                    </span>

                                        {/* Remove Button */}
                                        <button
                                            className="btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => handleRemove(e, index)}
                                            title="Remove from queue"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-4xl mb-2">📭</p>
                            <p className="text-base-content/50">Queue is empty</p>
                            <p className="text-sm text-base-content/40 mt-1">
                                Add tracks to start playing
                            </p>
                        </div>
                    )}
                </div>

                {/* Now Playing Footer */}
                {currentTrack && (
                    <div className="p-4 border-t border-base-200 bg-base-200/50">
                        <p className="text-xs text-base-content/60 mb-1">Now Playing</p>
                        <p className="font-medium text-sm truncate">{currentTrack.title}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QueueList;