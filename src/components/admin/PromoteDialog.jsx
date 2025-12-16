import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../features/ui/uiSlice';
import { httpClient } from '../../api/httpClient';
import { Button, Input } from '../common';

const PromoteDialog = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const [userId, setUserId] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAction = async (e, action) => {
        // Prevent form submission if inside a form
        if(e && e.preventDefault) e.preventDefault();

        if (!userId.trim()) return;

        setLoading(true);
        const endpoint = action === 'promote'
            ? `/api/admin/promote/${userId.trim()}`
            : `/api/admin/demote/${userId.trim()}`;

        const successMsg = action === 'promote'
            ? `User ${userId} promoted to admin`
            : `User ${userId} demoted from admin`;

        try {
            await httpClient.post(endpoint);
            dispatch(addToast({
                type: 'success',
                message: successMsg,
            }));
            setUserId('');
            onClose();
        } catch (error) {
            dispatch(addToast({
                type: 'error',
                message: error.response?.data?.message || `Failed to ${action} user`,
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
                    type="button"
                >
                    ✕
                </button>

                <h3 className="font-bold text-lg mb-4">Manage User Roles</h3>

                <Input
                    label="User ID or Username"
                    placeholder="Enter user ID or username"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                />

                <p className="text-sm text-base-content/70 mt-2">
                    Promote a user to Admin or Demote them back to standard user.
                </p>

                <div className="modal-action flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={loading}
                        type="button"
                    >
                        Cancel
                    </Button>

                    <Button
                        className="btn-error text-white"
                        onClick={(e) => handleAction(e, 'demote')}
                        disabled={!userId.trim() || loading}
                        loading={loading}
                        type="button"
                    >
                        Demote
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={(e) => handleAction(e, 'promote')}
                        disabled={!userId.trim() || loading}
                        loading={loading}
                        type="button"
                    >
                        Promote
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PromoteDialog;