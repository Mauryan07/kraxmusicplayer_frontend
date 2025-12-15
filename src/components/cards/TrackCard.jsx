import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { playTrack, addToQueue } from '../../features/player/playerSlice';
import { selectIsAdmin } from '../../features/auth/authSlice';
import { deleteTrack } from '../../features/tracks/tracksSlice';
import { getApiBase } from '../../api/httpClient';

const TrackCard = ({ track, queue = [], showDelete = true }) => {
    const dispatch = useDispatch();
    const isAdmin = useSelector(selectIsAdmin);

    const handlePlay = () => {
        const playQueue = queue.length > 0 ?  queue : [track];
        dispatch(playTrack({ track, queue: playQueue }));
    };

    const handleAddToQueue = (e) => {
        e.stopPropagation();
        dispatch(addToQueue(track));
    };

    const handleDownload = (e) => {
        e.stopPropagation();
        const audioUrl = `${getApiBase()}/api/track/${track.fileHash}/audio`;
        const link = document.createElement('a');
        link.href = audioUrl;
        link. download = `${track.title || 'track'}.mp3`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm(`Delete "${track.title}"?`)) {
            dispatch(deleteTrack(track.fileHash));
        }
    };

    const formatDuration = (seconds) => {
        if (seconds === null || seconds === undefined) return '--:--';
        const num = Number(seconds);
        if (isNaN(num) || ! isFinite(num) || num < 0) return '--:--';
        const mins = Math.floor(num / 60);
        const secs = Math.floor(num % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

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
                    {track. title || 'Untitled'}
                </p>
                {subtitle && (
                    <p className="text-xs text-base-content/60 truncate">
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Duration */}
            <span className="text-xs text-base-content/50 tabular-nums hidden sm:block">
        {formatDuration(track. duration)}
      </span>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Download Button */}
                <button
                    className="btn btn-ghost btn-xs btn-circle"
                    onClick={handleDownload}
                    title="Download"
                >
                    ⬇️
                </button>

                {/* Add to Queue Button */}
                <button
                    className="btn btn-ghost btn-xs btn-circle"
                    onClick={handleAddToQueue}
                    title="Add to queue"
                >
                    ➕
                </button>

                {/* Delete Button (Admin only) */}
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