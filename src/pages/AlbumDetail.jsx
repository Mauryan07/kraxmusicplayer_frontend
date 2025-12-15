import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAlbumById,
    selectCurrentAlbum,
    selectAlbumsLoading,
    clearCurrentAlbum,
} from '../features/albums/albumsSlice';
import { playTrack, addToQueue } from '../features/player/playerSlice';
import { Loader, Button } from '../components/common';
import { getApiBase } from '../api/httpClient';

const AlbumDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const album = useSelector(selectCurrentAlbum);
    const loading = useSelector(selectAlbumsLoading);

    useEffect(() => {
        if (id) {
            dispatch(fetchAlbumById(id));
        }
        return () => {
            dispatch(clearCurrentAlbum());
        };
    }, [id, dispatch]);

    const handlePlayAll = () => {
        if (album?. tracks?.length > 0) {
            dispatch(playTrack({ track:  album.tracks[0], queue: album.tracks }));
        }
    };

    const handlePlayTrack = (track) => {
        dispatch(playTrack({ track, queue: album.tracks }));
    };

    const handleAddToQueue = (e, track) => {
        e.stopPropagation();
        dispatch(addToQueue(track));
    };

    const handleDownload = (e, track) => {
        e.stopPropagation();
        const audioUrl = `${getApiBase()}/api/track/${track. fileHash}/audio`;
        const link = document.createElement('a');
        link.href = audioUrl;
        link. download = `${track.title || 'track'}.mp3`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatDuration = (seconds) => {
        if (seconds === null || seconds === undefined) return '--:--';
        const num = Number(seconds);
        if (isNaN(num) || ! isFinite(num) || num < 0) return '--:--';
        const mins = Math.floor(num / 60);
        const secs = Math.floor(num % 60);
        return `${mins}:${secs. toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader size="lg" text="Loading album..." />
            </div>
        );
    }

    if (! album) {
        return (
            <div className="text-center py-12">
                <p className="text-4xl mb-4">😕</p>
                <p className="text-base-content/50 mb-4">Album not found</p>
                <Button onClick={() => navigate('/albums')}>Back to Albums</Button>
            </div>
        );
    }

    const artworkUrl = album. tracks?.[0]?. fileHash
        ? `${getApiBase()}/api/track/${album. tracks[0].fileHash}/artwork`
        : null;

    const albumName = album.name || 'Untitled Album';

    return (
        <div className="space-y-6">
            {/* Album Header */}
            <div className="flex flex-col md:flex-row gap-6">
                {/* Artwork */}
                <div className="w-48 h-48 mx-auto md:mx-0 rounded-2xl overflow-hidden bg-base-200 flex-shrink-0 shadow-lg">
                    {artworkUrl ?  (
                        <img
                            src={artworkUrl}
                            alt={albumName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e. target.style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl text-base-content/20">
                            💿
                        </div>
                    )}
                </div>

                {/* Album Info */}
                <div className="flex-1 text-center md:text-left">
                    <p className="text-sm text-base-content/50 uppercase tracking-wide">Album</p>
                    <h1 className="text-3xl font-bold mt-1">{albumName}</h1>
                    <p className="text-base-content/60 mt-2">
                        {album. tracks?.length || 0} {album.tracks?.length === 1 ? 'track' : 'tracks'}
                    </p>
                    <div className="flex gap-3 mt-6 justify-center md:justify-start">
                        <Button variant="primary" onClick={handlePlayAll}>
                            ▶️ Play All
                        </Button>
                        <Button variant="ghost" onClick={() => navigate('/albums')}>
                            ← Back
                        </Button>
                    </div>
                </div>
            </div>

            {/* Track List */}
            <div className="space-y-1">
                {/* Header */}
                <div className="hidden sm:flex items-center gap-4 px-4 py-2 text-sm text-base-content/50 border-b border-base-200">
                    <span className="w-8 text-center">#</span>
                    <span className="flex-1">Title</span>
                    <span className="w-32 text-center">Actions</span>
                    <span className="w-16 text-right">Duration</span>
                </div>

                {/* Tracks */}
                {album.tracks?.map((track, index) => (
                    <div
                        key={track.fileHash || index}
                        className="flex items-center gap-4 p-4 hover:bg-base-200 rounded-xl cursor-pointer transition-colors group"
                        onClick={() => handlePlayTrack(track)}
                    >
                        {/* Track Number / Play Icon */}
                        <span className="w-8 text-center text-base-content/50 group-hover:hidden">
              {index + 1}
            </span>
                        <span className="w-8 text-center hidden group-hover:block text-primary">
              ▶️
            </span>

                        {/* Track Info */}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{track. title || 'Untitled'}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                className="btn btn-ghost btn-xs btn-circle"
                                onClick={(e) => handleDownload(e, track)}
                                title="Download"
                            >
                                ⬇️
                            </button>
                            <button
                                className="btn btn-ghost btn-xs btn-circle"
                                onClick={(e) => handleAddToQueue(e, track)}
                                title="Add to queue"
                            >
                                ➕
                            </button>
                        </div>

                        {/* Duration */}
                        <span className="w-16 text-right text-sm text-base-content/50">
              {formatDuration(track.duration)}
            </span>
                    </div>
                ))}

                {(! album.tracks || album.tracks.length === 0) && (
                    <p className="text-center text-base-content/50 py-8">No tracks in this album</p>
                )}
            </div>
        </div>
    );
};

export default AlbumDetail;