import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { playTrack } from '../../features/player/playerSlice';
import { getApiBase } from '../../api/httpClient';

const AlbumCard = ({ album }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleClick = () => {
        const albumId = album.id || encodeURIComponent(album.album || album.name);
        navigate(`/albums/${albumId}`);
    };

    const handlePlayAlbum = (e) => {
        e.stopPropagation();
        if (album.tracks && album.tracks. length > 0) {
            dispatch(playTrack({ track: album.tracks[0], queue: album.tracks }));
        }
    };

    // Get artwork URL from first track's fileHash
    const getArtworkUrl = () => {
        const fileHash = album.firstTrackHash ||
            album.coverHash ||
            album.tracks?.[0]?. fileHash;

        if (fileHash && fileHash !== 'artwork') {
            return `${getApiBase()}/api/track/${fileHash}/artwork`;
        }
        return null;
    };

    const artworkUrl = getArtworkUrl();
    const albumName = album.album || album.name || 'Untitled Album';
    const trackCount = album.trackCount || album.tracks?.length || 0;

    return (
        <div
            className="card bg-base-200 hover:bg-base-300 transition-all cursor-pointer group"
            onClick={handleClick}
        >
            <figure className="aspect-square relative overflow-hidden bg-base-300">
                {artworkUrl ?  (
                    <img
                        src={artworkUrl}
                        alt={albumName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            e. target.style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-base-content/20">
                        💿
                    </div>
                )}

                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover: opacity-100 transition-opacity flex items-center justify-center">
                    <button
                        className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-content text-xl shadow-lg"
                        onClick={handlePlayAlbum}
                    >
                        ▶️
                    </button>
                </div>

                {/* Track count badge */}
                {trackCount > 0 && (
                    <div className="absolute bottom-2 right-2 badge badge-neutral badge-sm">
                        {trackCount} {trackCount === 1 ? 'track' : 'tracks'}
                    </div>
                )}
            </figure>

            <div className="card-body p-4">
                <h3 className="font-semibold text-sm truncate">{albumName}</h3>
            </div>
        </div>
    );
};

export default AlbumCard;