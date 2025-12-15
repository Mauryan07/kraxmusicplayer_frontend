import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApiBase } from '../api/httpClient';
import { Button, Loader } from '../components/common';
import { TrackCard } from '../components/cards';

const AlbumDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [album, setAlbum] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            setLoading(true);
            // Fetch the album using albumName
            fetch(`${getApiBase()}/api/album/${encodeURIComponent(id)}`)
                .then(res => {
                    if (!res.ok) throw new Error('Not found');
                    return res.json();
                })
                .then(data => setAlbum(data))
                .catch(() => setAlbum(null))
                .finally(() => setLoading(false));
        }
    }, [id]);

    const albumTitle = album?.name || 'Untitled Album';
    const trackCount = album?.tracks?.length || 0;
    const artworkUrl = album?.artwork?.imageData
        ? `data:${album.artwork.mimeType};base64,${album.artwork.imageData}`
        : null;

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader size="lg" text="Loading album..." />
            </div>
        );
    }

    if (!album) {
        return (
            <div className="text-center py-12">
                <p className="text-4xl mb-4">😕</p>
                <p className="text-base-content/50 mb-4">Album not found</p>
                <Button onClick={() => navigate('/albums')}>Back to Albums</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-24">
            {/* Album Header */}
            <div className="flex flex-col md:flex-row gap-6">
                {/* Artwork */}
                <div className="w-40 h-40 sm:w-48 sm:h-48 mx-auto md:mx-0 rounded-2xl overflow-hidden bg-base-200 flex-shrink-0 shadow-lg">
                    {artworkUrl ? (
                        <img
                            src={artworkUrl}
                            alt={albumTitle}
                            className="w-full h-full object-cover"
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
                    <h1 className="text-2xl sm:text-3xl font-bold mt-1">{albumTitle}</h1>
                    <p className="text-base-content/60 mt-2">
                        {trackCount} {trackCount === 1 ? 'track' : 'tracks'}
                    </p>
                    <div className="flex gap-3 mt-6 justify-center md:justify-start flex-wrap">
                        <Button variant="ghost" onClick={() => navigate('/albums')}>
                            ← Back
                        </Button>
                    </div>
                </div>
            </div>

            {/* Track List */}
            <div className="space-y-2">
                {album.tracks && album.tracks.length > 0 ? (
                    album.tracks.map((track, index) => (
                        <TrackCard key={track.fileHash || index} track={track} queue={album.tracks} showDelete={false} />
                    ))
                ) : (
                    <p className="text-center text-base-content/50 py-8">No tracks in this album</p>
                )}
            </div>
        </div>
    );
};

export default AlbumDetail;