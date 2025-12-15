import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAlbums,
    searchAlbums,
    selectAlbums,
    selectAlbumsLoading,
    selectAlbumsError,
    selectAlbumSearchResults,
    selectAlbumSearchLoading,
    clearAlbumSearchResults,
} from '../features/albums/albumsSlice';
import { AlbumCard } from '../components/cards';
import { Loader, Button } from '../components/common';

const Albums = () => {
    const dispatch = useDispatch();
    const albums = useSelector(selectAlbums);
    const loading = useSelector(selectAlbumsLoading);
    const error = useSelector(selectAlbumsError);
    const searchResults = useSelector(selectAlbumSearchResults);
    const searchLoading = useSelector(selectAlbumSearchLoading);

    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        dispatch(fetchAlbums());
    }, [dispatch]);

    const handleSearch = (e) => {
        e. preventDefault();
        if (searchQuery.trim()) {
            setIsSearching(true);
            dispatch(searchAlbums(searchQuery.trim()));
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setIsSearching(false);
        dispatch(clearAlbumSearchResults());
    };

    const displayAlbums = isSearching ? searchResults : albums;
    const displayLoading = isSearching ? searchLoading : loading;

    if (displayLoading && displayAlbums.length === 0) {
        return (
            <div className="flex justify-center py-12">
                <Loader size="lg" text={isSearching ? 'Searching...' : 'Loading albums...'} />
            </div>
        );
    }

    if (error && ! isSearching) {
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
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h1 className="text-3xl font-bold">Albums</h1>
                <div className="flex items-center gap-2">
                    {displayLoading && <span className="loading loading-spinner loading-sm"></span>}
                    <button
                        className={`btn btn-sm ${searchOpen ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setSearchOpen(!searchOpen)}
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
                        placeholder="Search albums by name..."
                        className="input input-bordered flex-1"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target. value)}
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
            Found <strong>{searchResults.length}</strong> albums for "{searchQuery}"
          </span>
                    <button className="btn btn-ghost btn-xs" onClick={handleClearSearch}>
                        ✕ Clear Search
                    </button>
                </div>
            )}

            {displayAlbums.length > 0 ?  (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {displayAlbums.map((album, index) => (
                        <AlbumCard
                            key={album.id || album.name || index}
                            album={{
                                name: album.name,
                                album:  album.name,
                                trackCount: album.tracks?. length || 0,
                                firstTrackHash: album.tracks?.[0]?.fileHash || null,
                                tracks: album.tracks,
                            }}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-6xl mb-4">{isSearching ? '🔍' : '💿'}</p>
                    <p className="text-xl text-base-content/70">
                        {isSearching ? 'No albums found' : 'No albums yet'}
                    </p>
                    {isSearching ? (
                        <Button variant="ghost" className="mt-4" onClick={handleClearSearch}>
                            Clear Search
                        </Button>
                    ) : (
                        <p className="text-sm text-base-content/50 mt-2">
                            Upload tracks with album metadata
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Albums;