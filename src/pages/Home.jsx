import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchHome,
    selectRecentTracks,
    selectHomeAlbums,
    selectHomeCounts,
    selectHomeLoading,
} from '../features/home/homeSlice';
import { TrackCardWithArtwork, AlbumCard } from '../components/cards';
import { Loader } from '../components/common';

const Home = () => {
    const dispatch = useDispatch();
    const recentTracks = useSelector(selectRecentTracks);
    const albums = useSelector(selectHomeAlbums);
    const counts = useSelector(selectHomeCounts);
    const loading = useSelector(selectHomeLoading);

    useEffect(() => {
        dispatch(fetchHome({ tracksLimit: 12, albumsLimit: 8 }));
    }, [dispatch]);

    if (loading && recentTracks.length === 0) {
        return (
            <div className="flex justify-center py-12">
                <Loader size="lg" text="Loading..." />
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Hero Section */}
            <div className="hero bg-gradient-to-br from-primary/20 via-base-200 to-secondary/20 rounded-2xl py-16">
                <div className="hero-content text-center">
                    <div className="max-w-lg">
                        <h1 className="text-5xl font-bold">KraxMusic</h1>
                        <p className="py-6 text-base-content/70 text-lg">
                            Your personal music streaming experience
                        </p>

                        {/* Quick Stats */}
                        <div className="flex justify-center gap-8 mb-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-primary">
                                    {counts?. totalTracks?. toLocaleString() || 0}
                                </div>
                                <div className="text-sm text-base-content/60">Tracks</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-secondary">
                                    {counts?.totalAlbums?.toLocaleString() || 0}
                                </div>
                                <div className="text-sm text-base-content/60">Albums</div>
                            </div>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <Link to="/tracks" className="btn btn-primary">
                                Browse Tracks
                            </Link>
                            <Link to="/albums" className="btn btn-outline">
                                View Albums
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Tracks */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">🎧 Recent Tracks</h2>
                    <Link to="/tracks" className="btn btn-ghost btn-sm">
                        View All →
                    </Link>
                </div>
                {recentTracks. length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {recentTracks.slice(0, 12).map((track, index) => (
                            <TrackCardWithArtwork
                                key={track. fileHash || index}
                                track={{
                                    fileHash: track.fileHash,
                                    title: track.title,
                                    duration: track.duration,
                                    album: track.album,
                                }}
                                queue={recentTracks. map((t) => ({
                                    fileHash: t.fileHash,
                                    title: t.title,
                                    duration: t.duration,
                                    album:  t.album,
                                }))}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-base-200 rounded-2xl">
                        <p className="text-4xl mb-2">🎵</p>
                        <p className="text-base-content/50">No tracks yet.  Upload some music! </p>
                        <Link to="/admin" className="btn btn-primary btn-sm mt-4">
                            Go to Admin
                        </Link>
                    </div>
                )}
            </section>

            {/* Albums */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">💿 Albums</h2>
                    <Link to="/albums" className="btn btn-ghost btn-sm">
                        View All →
                    </Link>
                </div>
                {albums.length > 0 ?  (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {albums.slice(0, 8).map((album, index) => (
                            <AlbumCard
                                key={album. name || index}
                                album={{
                                    name: album.name,
                                    album: album.name,
                                    trackCount: album.trackCount,
                                    // Pass the first track's fileHash for artwork
                                    firstTrackHash: album.sampleTracks?.[0]?.fileHash || null,
                                    tracks: album.sampleTracks?.map((t) => ({
                                        fileHash: t.fileHash,
                                        title: t.title,
                                        duration: t. duration,
                                    })),
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-base-200 rounded-2xl">
                        <p className="text-4xl mb-2">💿</p>
                        <p className="text-base-content/50">No albums yet</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;