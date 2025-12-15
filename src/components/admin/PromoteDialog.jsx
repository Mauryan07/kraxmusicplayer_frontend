import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../features/ui/uiSlice';
import { httpClient } from '../../api/httpClient';
import { Button, Input } from '../common';

const PromoteDialog = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const [userId, setUserId] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePromote = async () => {
        if (! userId. trim()) return;

        setLoading(true);
        try {
            await httpClient.post(`/api/admin/promote/${userId. trim()}`);
            dispatch(addToast({
                type: 'success',
                message: `User ${userId} promoted to admin`,
            }));
            setUserId('');
            onClose();
        } catch (error) {
            dispatch(addToast({
                type: 'error',
                message: error.response?.data?.message || 'Failed to promote user',
            }));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-backdrop bg-black/50" onClick={onClose}></div>
            <div className="modal-box">
                <button
                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={onClose}
                >
                    ✕
                </button>

                <h3 className="font-bold text-lg mb-4">Promote User to Admin</h3>

                <Input
                    label="User ID or Username"
                    placeholder="Enter user ID or username"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                />

                <p className="text-sm text-base-content/70 mt-2">
                    This will grant admin privileges to the specified user.
                </p>

                <div className="modal-action">
                    <Button variant="ghost" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={handlePromote}
                        disabled={! userId.trim() || loading}
                        loading={loading}
                    >
                        Promote
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PromoteDialog;