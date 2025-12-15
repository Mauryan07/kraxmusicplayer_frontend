import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAlbums, selectAlbums, selectAlbumsLoading } from '../features/albums/albumsSlice';
import { AlbumCard } from '../components/cards';
import { Loader } from '../components/common';

const Albums = () => {
    const dispatch = useDispatch();
    const albums = useSelector(selectAlbums);
    const loading = useSelector(selectAlbumsLoading);

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

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Albums</h1>

            {albums.length > 0 ?  (
                <div className="grid grid-cols-2 sm:grid-cols-3 md: grid-cols-4 lg:grid-cols-5 gap-6">
                    {albums.map((album, index) => (
                        <AlbumCard key={album. id || album.album || index} album={album} />
                    ))}
                </div>
            ) : (
                <p className="text-base-content/50 text-center py-12">No albums found</p>
            )}
        </div>
    );
};

export default Albums;