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
        const playQueue = queue.length > 0 ? queue : [track];
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
        link.download = `${track.title || 'track'}.mp3`;
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

    // Format duration string/seconds
    const formatDuration = (duration) => {
        if (!duration && duration !== 0) {
            return '--:--';
        }
        if (typeof duration === 'string' && duration.includes(':')) return duration;
        const seconds = Number(duration);
        if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Robustly support title field
    const displayTitle = track.title || track.name || 'Untitled';

    const subtitle = track.album || track.albumName || null;

    return (
        <div
            className="flex items-center gap-3 p-3 bg-base-200 hover:bg-base-300 rounded-lg cursor-pointer transition-all"
            onClick={handlePlay}
        >
            <div className="w-10 h-10 flex items-center justify-center bg-base-300 hover:bg-primary hover:text-primary-content rounded-full flex-shrink-0 transition-colors">
                <span className="text-sm">▶️</span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{displayTitle}</p>
                {subtitle && (
                    <p className="text-xs text-base-content/60 truncate">{subtitle}</p>
                )}
            </div>
            <span className="text-xs text-base-content/50 tabular-nums min-w-[45px] text-right">
                {formatDuration(track.duration)}
            </span>
            <div className="flex items-center gap-1">
                <button
                    className="btn btn-ghost btn-xs btn-circle"
                    onClick={handleDownload}
                    title="Download"
                >
                    ⬇️
                </button>
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