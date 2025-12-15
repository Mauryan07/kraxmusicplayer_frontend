import React from 'react';

const ArtistCard = ({ artist, onClick }) => {
    // Placeholder - will be implemented later if needed
    return (
        <div className="card bg-base-200 hover: bg-base-300 transition-colors cursor-pointer">
            <figure className="aspect-square bg-base-300 rounded-full mx-4 mt-4">
                {/* Artist image placeholder */}
            </figure>
            <div className="card-body p-3 text-center">
                <h3 className="card-title text-sm truncate justify-center">Artist Name</h3>
            </div>
        </div>
    );
};

export default ArtistCard;