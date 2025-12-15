import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiBase } from '../../api/httpClient';

const AlbumCard = ({ album }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        const albumId = album.id || encodeURIComponent(album.album || album.name);
        navigate(`/albums/${albumId}`);
    };

    // Get artwork URL from first track's fileHash
    const getArtworkUrl = () => {
        const fileHash = album.firstTrackHash ||
        album.coverHash ||
        album.tracks?.[0]?.fileHash;

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