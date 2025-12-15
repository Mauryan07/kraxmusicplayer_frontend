import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchTracks,
    selectTracks,
    selectTracksLoading,
    selectTracksError,
    selectTracksPagination,
} from '../features/tracks/tracksSlice';
import { TrackCard } from '../components/cards';
import { Loader, Button } from '../components/common';

const PAGE_SIZE = 24;

const Tracks = () => {
    const dispatch = useDispatch();
    const tracks = useSelector(selectTracks);
    const loading = useSelector(selectTracksLoading);
    const error = useSelector(selectTracksError);
    const { page, hasMore } = useSelector(selectTracksPagination);

    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        dispatch(fetchTracks({ page:  currentPage, size: PAGE_SIZE }));
    }, [dispatch, currentPage]);

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleNextPage = () => {
        if (hasMore) {
            setCurrentPage(currentPage + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleRetry = () => {
        dispatch(fetchTracks({ page:  currentPage, size: PAGE_SIZE }));
    };

    if (loading && tracks.length === 0) {
        return (
            <div className="flex justify-center py-12">
                <Loader size="lg" text="Loading tracks..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-4xl mb-4">😕</p>
                <p className="text-error mb-4">Error:  {error}</p>
                <Button onClick={handleRetry}>
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">All Tracks</h1>
                <div className="flex items-center gap-2">
                    {loading && <span className="loading loading-spinner loading-sm"></span>}
                    <span className="text-sm text-base-content/50">
            Page {currentPage + 1}
          </span>
                </div>
            </div>

            {tracks.length > 0 ? (
                <>
                    {/* Track List */}
                    <div className="space-y-2">
                        {tracks.map((track, index) => (
                            <TrackCard
                                key={track.fileHash || index}
                                track={track}
                                queue={tracks}
                            />
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex justify-center items-center gap-4 pt-6 pb-4">
                        <Button
                            variant="outline"
                            disabled={currentPage === 0 || loading}
                            onClick={handlePrevPage}
                        >
                            ← Previous
                        </Button>

                        <div className="flex items-center gap-2">
              <span className="badge badge-lg badge-primary">
                Page {currentPage + 1}
              </span>
                        </div>

                        <Button
                            variant="outline"
                            disabled={! hasMore || loading}
                            onClick={handleNextPage}
                        >
                            Next →
                        </Button>
                    </div>

                    {/* Page info */}
                    <div className="text-center text-sm text-base-content/50">
                        Showing {tracks.length} tracks
                        {! hasMore && currentPage > 0 && ' (Last page)'}
                    </div>
                </>
            ) : (
                <div className="text-center py-16">
                    <p className="text-6xl mb-4">🎵</p>
                    <p className="text-xl text-base-content/70">No tracks found</p>
                    <p className="text-sm text-base-content/50 mt-2">
                        Upload some MP3 files from the Admin page
                    </p>
                </div>
            )}
        </div>
    );
};

export default Tracks;