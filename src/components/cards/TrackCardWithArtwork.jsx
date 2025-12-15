import React from 'react';
import { useDispatch } from 'react-redux';
import { playTrack, addToQueue } from '../../features/player/playerSlice';
import { getApiBase } from '../../api/httpClient';

const TrackCardWithArtwork = ({ track, queue = [] }) => {
    const dispatch = useDispatch();

    const handlePlay = () => {
        const playQueue = queue.length > 0 ?  queue : [track];
        dispatch(playTrack({ track, queue: playQueue }));
    };

    const handleAddToQueue = (e) => {
        e.stopPropagation();
        dispatch(addToQueue(track));
    };

    // Only create artwork URL if we have a valid fileHash
    const getArtworkUrl = () => {
        if (track.fileHash && typeof track.fileHash === 'number') {
            return `${getApiBase()}/api/track/${track.fileHash}/artwork`;
        }
        return null;
    };

    const artworkUrl = getArtworkUrl();

    const formatDuration = (seconds) => {
        if (seconds === null || seconds === undefined) return '';
        const num = Number(seconds);
        if (isNaN(num) || ! isFinite(num) || num < 0) return '';
        const mins = Math.floor(num / 60);
        const secs = Math.floor(num % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const durationText = formatDuration(track.duration);
    const subtitle = track.album || null;

    return (
        <div
            className="card bg-base-200 hover:bg-base-300 transition-all cursor-pointer group"
            onClick={handlePlay}
        >
            <figure className="aspect-square relative overflow-hidden bg-base-300">
                {artworkUrl ? (
                    <img
                        src={artworkUrl}
                        alt={track.title || 'Track'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            e.target.style. display = 'none';
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-base-content/20">
                        🎵
                    </div>
                )}

                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-content text-xl shadow-lg">
                        ▶️
                    </div>
                </div>

                {/* Duration badge */}
                {durationText && (
                    <div className="absolute bottom-2 right-2 badge badge-neutral badge-sm">
                        {durationText}
                    </div>
                )}
            </figure>

            <div className="card-body p-3">
                <h3 className="font-medium text-sm truncate">
                    {track. title || 'Untitled'}
                </h3>
                {subtitle && (
                    <p className="text-xs text-base-content/60 truncate">
                        {subtitle}
                    </p>
                )}

                <button
                    className="btn btn-ghost btn-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleAddToQueue}
                >
                    ➕ Add to Queue
                </button>
            </div>
        </div>
    );
};

export default TrackCardWithArtwork;