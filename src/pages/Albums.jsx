import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAlbums,
    selectAlbums,
    selectAlbumsLoading,
    selectAlbumsError,
} from '../features/albums/albumsSlice';
import { AlbumCard } from '../components/cards';
import { Loader, Button } from '../components/common';

const Albums = () => {
    const dispatch = useDispatch();
    const albums = useSelector(selectAlbums);
    const loading = useSelector(selectAlbumsLoading);
    const error = useSelector(selectAlbumsError);

    useEffect(() => {
        dispatch(fetchAlbums());
    }, [dispatch]);

    if (loading && albums.length === 0) {
        return (
            <div className="flex justify-center py-12">
                <Loader size="lg" text="Loading albums..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-4xl mb-4">😕</p>
                <p className="text-error mb-4">Error: {error}</p>
                <Button onClick={() => dispatch(fetchAlbums())}>Try Again</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-3xl font-bold">Albums</h1>
            </div>
            {albums.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {albums.map((album, index) => (
                        <AlbumCard
                            key={album.id || album.name || index}
                            album={album}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-6xl mb-4">💿</p>
                    <p className="text-xl text-base-content/70">No albums found</p>
                    <p className="text-sm text-base-content/50 mt-2">
                        Upload tracks with album metadata
                    </p>
                </div>
            )}
        </div>
    );
};

export default Albums;