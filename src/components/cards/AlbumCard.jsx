import React from 'react';
import { useNavigate } from 'react-router-dom';

const AlbumCard = ({ album }) => {
    const navigate = useNavigate();

    // Defensive for both search and album list results.
    const albumTitle = album.name || album.album || 'Untitled Album';
    const trackCount = album.tracks ? album.tracks.length : (album.trackCount || 0);

    // Decode artwork if present (dataUri if search/album DTO returns artwork as imageData + mimeType)
    const artworkUrl = album.artwork?.imageData
        ? `data:${album.artwork.mimeType};base64,${album.artwork.imageData}`
        : null;

    const handleClick = () => {
        // Use album name (encoded) for route
        const albumName = encodeURIComponent(album.name || album.album);
        navigate(`/albums/${albumName}`);
    };

    return (
        <div
            className="card bg-base-200 hover:bg-base-300 transition-all cursor-pointer group"
            onClick={handleClick}
        >
            <figure className="aspect-square relative overflow-hidden bg-base-300">
                {artworkUrl ? (
                    <img
                        src={artworkUrl}
                        alt={albumTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-base-content/20">
                        💿
                    </div>
                )}
                {trackCount > 0 && (
                    <div className="absolute bottom-2 right-2 badge badge-neutral badge-sm">
                        {trackCount} {trackCount === 1 ? 'track' : 'tracks'}
                    </div>
                )}
            </figure>
            <div className="card-body p-4">
                <h3 className="font-semibold text-sm truncate">{albumTitle}</h3>
            </div>
        </div>
    );
};
export default AlbumCard;