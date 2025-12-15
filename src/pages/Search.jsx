import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    searchTracks,
    selectSearchResults,
    selectSearchLoading,
    clearSearchResults,
} from '../features/tracks/tracksSlice';
import {
    searchAlbums,
    selectAlbumSearchResults,
    clearAlbumSearchResults,
} from '../features/albums/albumsSlice';
import { TrackCard, AlbumCard } from '../components/cards';

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16. 65" y2="16.65" />
    </svg>
);

const Search = () => {
    const dispatch = useDispatch();
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    const trackResults = useSelector(selectSearchResults);
    const albumResults = useSelector(selectAlbumSearchResults);
    const trackLoading = useSelector(selectSearchLoading);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query), 300);
        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        if (debouncedQuery. trim()) {
            dispatch(searchTracks(debouncedQuery));
            dispatch(searchAlbums(debouncedQuery));
        } else {
            dispatch(clearSearchResults());
            dispatch(clearAlbumSearchResults());
        }
    }, [debouncedQuery, dispatch]);

    useEffect(() => {
        return () => {
            dispatch(clearSearchResults());
            dispatch(clearAlbumSearchResults());
        };
    }, [dispatch]);

    const hasResults = trackResults. length > 0 || albumResults.length > 0;
    const isSearching = trackLoading && debouncedQuery. trim();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Search</h1>

            {/* Search Input */}
            <label className="input input-bordered flex items-center gap-2">
                <input
                    type="text"
                    className="grow"
                    placeholder="Search for tracks or albums..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                />
                {isSearching ?  (
                    <span className="loading loading-spinner loading-sm" />
                ) : (
                    <SearchIcon />
                )}
            </label>

            {/* Results */}
            {debouncedQuery. trim() ? (
                <div className="space-y-8">
                    {albumResults.length > 0 && (
                        <section>
                            <h2 className="text-xl font-bold mb-4">Albums</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {albumResults.slice(0, 6).map((album, index) => (
                                    <AlbumCard key={album.id || album.album || index} album={album} />
                                ))}
                            </div>
                        </section>
                    )}

                    {trackResults.length > 0 && (
                        <section>
                            <h2 className="text-xl font-bold mb-4">Tracks</h2>
                            <div className="grid grid-cols-2 sm: grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {trackResults.map((track) => (
                                    <TrackCard key={track.fileHash} track={track} queue={trackResults} />
                                ))}
                            </div>
                        </section>
                    )}

                    {! isSearching && ! hasResults && (
                        <div className="text-center py-12">
                            <p className="text-6xl mb-4">😕</p>
                            <p className="text-base-content/50">No results found for "{debouncedQuery}"</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-6xl mb-4">🔍</p>
                    <p className="text-base-content/50 text-lg">Start typing to search</p>
                </div>
            )}
        </div>
    );
};

export default Search;