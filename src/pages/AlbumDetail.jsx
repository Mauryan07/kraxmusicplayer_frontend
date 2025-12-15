import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAlbumById,
    selectCurrentAlbum,
    selectAlbumsLoading,
    clearCurrentAlbum,
} from '../features/albums/albumsSlice';
import { playTrack } from '../features/player/playerSlice';
import { Loader, Button } from '../components/common';
import { API_BASE } from '../api/httpClient';

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
            dispatch(playTrack({ track: album.tracks[0], queue: album.tracks }));
        }
    };

    const handlePlayTrack = (track) => {
        dispatch(playTrack({ track, queue: album.tracks }));
    };

    const formatDuration = (seconds) => {
        if (! seconds) return '';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
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
                <p className="text-base-content/50 mb-4">Album not found</p>
                <Button onClick={() => navigate('/albums')}>Back to Albums</Button>
            </div>
        );
    }

    const artworkUrl = album.coverHash
        ? `${API_BASE}/api/track/${album.coverHash}/artwork`
        : album.tracks?.[0]?.fileHash
        ? `${API_BASE}/api/track/${album.tracks[0]. fileHash}/artwork`
        : null;

    return (
        <div className="space-y-6">
            {/* Album Header */}
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-48 h-48 rounded-2xl overflow-hidden bg-base-200 flex-shrink-0 mx-auto md:mx-0">
                    {artworkUrl ?  (
                        <img
                            src={artworkUrl}
                            alt={album.album || album.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e. target.style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-16 w-16 text-base-content/20"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-. 895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                                />
                            </svg>
                        </div>
                    )}
                </div>

                <div className="flex-1 text-center md:text-left">
                    <p className="text-sm text-base-content/50 uppercase tracking-wide">Album</p>
                    <h1 className="text-3xl font-bold mt-1">
                        {album. album || album.name || 'Unknown Album'}
                    </h1>
                    {album.artist && (
                        <p className="text-lg text-base-content/70 mt-2">{album.artist}</p>
                    )}
                    <p className="text-sm text-base-content/50 mt-2">
                        {album.tracks?.length || 0} tracks
                        {album.year && ` • ${album.year}`}
                    </p>
                    <div className="flex gap-2 mt-4 justify-center md:justify-start">
                        <Button variant="primary" onClick={handlePlayAll}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            Play All
                        </Button>
                        <Button variant="ghost" onClick={() => navigate('/albums')}>
                            Back
                        </Button>
                    </div>
                </div>
            </div>

            {/* Track List */}
            <div className="space-y-1">
                <div className="hidden sm:flex items-center gap-4 px-4 py-2 text-sm text-base-content/50 border-b border-base-200">
                    <span className="w-8 text-center">#</span>
                    <span className="flex-1">Title</span>
                    <span className="w-24 text-right">Duration</span>
                </div>

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
                        <span className="w-8 text-center hidden group-hover:block">
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mx-auto text-primary"
                  fill="currentColor"
                  viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>

                        {/* Track Info */}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{track.title || 'Unknown Title'}</p>
                            {track.artist && track.artist !== album.artist && (
                                <p className="text-sm text-base-content/70 truncate">{track.artist}</p>
                            )}
                        </div>

                        {/* Duration */}
                        <span className="w-24 text-right text-sm text-base-content/50">
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