import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHome, selectHomeCounts, selectHomeLoading } from '../../features/home/homeSlice';
import StatsCard from './StatsCard';

const LibraryStats = () => {
    const dispatch = useDispatch();
    const counts = useSelector(selectHomeCounts);
    const loading = useSelector(selectHomeLoading);

    useEffect(() => {
        // Fetch stats on mount
        dispatch(fetchHome({ tracksLimit: 1, albumsLimit: 1 }));
    }, [dispatch]);

    const handleRefresh = () => {
        dispatch(fetchHome({ tracksLimit:  1, albumsLimit: 1 }));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">📊 Library Statistics</h3>
                <button
                    className="btn btn-ghost btn-sm"
                    onClick={handleRefresh}
                    disabled={loading}
                >
                    {loading ? (
                        <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                        '🔄'
                    )}
                    Refresh
                </button>
            </div>

            <div className="stats stats-vertical sm:stats-horizontal shadow w-full bg-base-200">
                <StatsCard
                    title="Total Tracks"
                    value={counts?. totalTracks}
                    icon="🎵"
                    description="MP3 files in library"
                    loading={loading}
                    color="primary"
                />
                <StatsCard
                    title="Total Albums"
                    value={counts?. totalAlbums}
                    icon="💿"
                    description="Unique albums"
                    loading={loading}
                    color="secondary"
                />
            </div>

            {/* Additional Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-base-200 rounded-xl p-4 text-center">
                    <div className="text-3xl mb-2">🎧</div>
                    <div className="text-2xl font-bold tabular-nums">
                        {loading ? '--' : counts?.totalTracks || 0}
                    </div>
                    <div className="text-xs text-base-content/60">Tracks</div>
                </div>

                <div className="bg-base-200 rounded-xl p-4 text-center">
                    <div className="text-3xl mb-2">💿</div>
                    <div className="text-2xl font-bold tabular-nums">
                        {loading ? '--' : counts?. totalAlbums || 0}
                    </div>
                    <div className="text-xs text-base-content/60">Albums</div>
                </div>

                <div className="bg-base-200 rounded-xl p-4 text-center">
                    <div className="text-3xl mb-2">📁</div>
                    <div className="text-2xl font-bold tabular-nums">
                        {loading ? '--' : 'MP3'}
                    </div>
                    <div className="text-xs text-base-content/60">Format</div>
                </div>

                <div className="bg-base-200 rounded-xl p-4 text-center">
                    <div className="text-3xl mb-2">✅</div>
                    <div className="text-2xl font-bold text-success">
                        {loading ? '--' :  'Online'}
                    </div>
                    <div className="text-xs text-base-content/60">Status</div>
                </div>
            </div>
        </div>
    );
};

export default LibraryStats;