import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteAllTracks } from '../../features/tracks/tracksSlice';
import { fetchHome } from '../../features/home/homeSlice';
import { Button, Input } from '../common';

const DangerZone = () => {
    const dispatch = useDispatch();
    const [confirmText, setConfirmText] = useState('');
    const [loading, setLoading] = useState(false);
    const deleteLoading = useSelector((state) => state.tracks.deleteLoading);

    const handleDeleteAll = async () => {
        if (confirmText !== 'DELETE ALL') return;

        setLoading(true);
        try {
            await dispatch(deleteAllTracks()). unwrap();
            setConfirmText('');
            // Refresh stats after deletion
            dispatch(fetchHome({ tracksLimit: 1, albumsLimit: 1 }));
        } catch (error) {
            console.error('Delete all failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const isDeleteEnabled = confirmText === 'DELETE ALL';

    return (
        <div className="card bg-error/5 border-2 border-error/30">
            <div className="card-body">
                <div className="flex items-start gap-4">
                    <div className="text-4xl">🗑️</div>
                    <div className="flex-1">
                        <h3 className="card-title text-error">Delete All Tracks</h3>
                        <p className="text-base-content/70 mt-1">
                            This will permanently delete <strong>all tracks</strong> from your library.
                            This action <strong>cannot be undone</strong>.
                        </p>

                        <div className="mt-4 max-w-sm">
                            <label className="label">
                <span className="label-text">
                  Type <code className="bg-base-300 px-2 py-1 rounded text-error font-mono">DELETE ALL</code> to confirm
                </span>
                            </label>
                            <input
                                type="text"
                                placeholder="Type DELETE ALL"
                                className={`input input-bordered w-full ${
                                    confirmText && !isDeleteEnabled ? 'input-error' : ''
                                } ${isDeleteEnabled ? 'input-success' : ''}`}
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value. toUpperCase())}
                            />
                        </div>

                        <div className="mt-4">
                            <Button
                                variant="error"
                                onClick={handleDeleteAll}
                                disabled={!  isDeleteEnabled || loading || deleteLoading}
                                loading={loading || deleteLoading}
                            >
                                🗑️ Delete All Tracks
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DangerZone;