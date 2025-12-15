import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { playTrack, addToQueue } from '../../features/player/playerSlice';
import { selectIsAdmin } from '../../features/auth/authSlice';
import { deleteTrack } from '../../features/tracks/tracksSlice';

const TrackCard = ({ track, queue = [], showDelete = true }) => {
    const dispatch = useDispatch();
    const isAdmin = useSelector(selectIsAdmin);

    const handlePlay = () => {
        const playQueue = queue.length > 0 ? queue : [track];
        dispatch(playTrack({ track, queue: playQueue }));
    };

    const handleAddToQueue = (e) => {
        e.stopPropagation();
        dispatch(addToQueue(track));
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm(`Delete "${track.title}"?`)) {
            dispatch(deleteTrack(track.fileHash));
        }
    };

    const formatDuration = (seconds) => {
        if (seconds === null || seconds === undefined) return '--: --';
        const num = Number(seconds);
        if (isNaN(num) || ! isFinite(num) || num < 0) return '--:--';
        const mins = Math.floor(num / 60);
        const secs = Math.floor(num % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Get subtitle - only show if available
    const subtitle = track.album || null;

    return (
        <div
            className="flex items-center gap-3 p-3 bg-base-200 hover:bg-base-300 rounded-lg cursor-pointer transition-all group"
            onClick={handlePlay}
        >
            {/* Play Icon */}
            <div className="w-10 h-10 flex items-center justify-center bg-base-300 group-hover:bg-primary group-hover:text-primary-content rounded-full flex-shrink-0 transition-colors">
                <span className="text-sm group-hover:scale-110 transition-transform">▶️</span>
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                    {track.title || 'Untitled'}
                </p>
                {subtitle && (
                    <p className="text-xs text-base-content/60 truncate">
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Duration */}
            <span className="text-xs text-base-content/50 tabular-nums">
        {formatDuration(track.duration)}
      </span>

            {/* Actions - Show on hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover: opacity-100 transition-opacity">
                <button
                    className="btn btn-ghost btn-xs btn-circle"
                    onClick={handleAddToQueue}
                    title="Add to queue"
                >
                    ➕
                </button>

                {isAdmin && showDelete && (
                    <button
                        className="btn btn-ghost btn-xs btn-circle text-error"
                        onClick={handleDelete}
                        title="Delete"
                    >
                        🗑️
                    </button>
                )}
            </div>
        </div>
    );
};

export default TrackCard;