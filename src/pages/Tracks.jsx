import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchTracks,
    searchTracks,
    selectTracks,
    selectTracksLoading,
    selectTracksError,
    selectTracksPagination,
    selectSearchResults,
    selectSearchLoading,
    clearSearchResults,
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
    const searchResults = useSelector(selectSearchResults);
    const searchLoading = useSelector(selectSearchLoading);

    const [currentPage, setCurrentPage] = useState(0);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (! isSearching) {
            dispatch(fetchTracks({ page:  currentPage, size: PAGE_SIZE }));
        }
    }, [dispatch, currentPage, isSearching]);

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

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setIsSearching(true);
            dispatch(searchTracks(searchQuery. trim()));
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setIsSearching(false);
        dispatch(clearSearchResults());
        setCurrentPage(0);
    };

    const handleRetry = () => {
        dispatch(fetchTracks({ page: currentPage, size: PAGE_SIZE }));
    };

    const displayTracks = isSearching ? searchResults : tracks;
    const displayLoading = isSearching ? searchLoading : loading;

    if (displayLoading && displayTracks.length === 0) {
        return (
            <div className="flex justify-center py-12">
                <Loader size="lg" text={isSearching ? 'Searching...' :  'Loading tracks...'} />
            </div>
        );
    }

    if (error && ! isSearching) {
        return (
            <div className="text-center py-12">
                <p className="text-4xl mb-4">😕</p>
                <p className="text-error mb-4">Error:  {error}</p>
                <Button onClick={handleRetry}>Try Again</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h1 className="text-3xl font-bold">All Tracks</h1>
                <div className="flex items-center gap-2">
                    {displayLoading && <span className="loading loading-spinner loading-sm"></span>}
                    <button
                        className={`btn btn-sm ${searchOpen ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setSearchOpen(! searchOpen)}
                    >
                        🔍 Search
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            {searchOpen && (
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search tracks by title..."
                        className="input input-bordered flex-1"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e. target.value)}
                        autoFocus
                    />
                    <Button type="submit" variant="primary" disabled={! searchQuery.trim()}>
                        Search
                    </Button>
                    {isSearching && (
                        <Button type="button" variant="ghost" onClick={handleClearSearch}>
                            Clear
                        </Button>
                    )}
                </form>
            )}

            {/* Search Results Info */}
            {isSearching && (
                <div className="flex items-center justify-between bg-base-200 rounded-lg p-3">
          <span className="text-sm">
            Found <strong>{searchResults.length}</strong> results for "{searchQuery}"
          </span>
                    <button className="btn btn-ghost btn-xs" onClick={handleClearSearch}>
                        ✕ Clear Search
                    </button>
                </div>
            )}

            {displayTracks.length > 0 ?  (
                <>
                    {/* Track List */}
                    <div className="space-y-2">
                        {displayTracks.map((track, index) => (
                            <TrackCard
                                key={track. fileHash || index}
                                track={track}
                                queue={displayTracks}
                            />
                        ))}
                    </div>

                    {/* Pagination Controls (only when not searching) */}
                    {!isSearching && (
                        <div className="flex justify-center items-center gap-4 pt-6 pb-4">
                            <Button
                                variant="outline"
                                disabled={currentPage === 0 || loading}
                                onClick={handlePrevPage}
                            >
                                ← Previous
                            </Button>

                            <span className="badge badge-lg badge-primary">
                Page {currentPage + 1}
              </span>

                            <Button
                                variant="outline"
                                disabled={! hasMore || loading}
                                onClick={handleNextPage}
                            >
                                Next →
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-16">
                    <p className="text-6xl mb-4">{isSearching ? '🔍' : '🎵'}</p>
                    <p className="text-xl text-base-content/70">
                        {isSearching ? 'No tracks found' : 'No tracks found'}
                    </p>
                    {isSearching ?  (
                        <Button variant="ghost" className="mt-4" onClick={handleClearSearch}>
                            Clear Search
                        </Button>
                    ) : (
                        <p className="text-sm text-base-content/50 mt-2">
                            Upload some MP3 files from the Admin page
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Tracks;