import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectIsAdmin } from '../features/auth/authSlice';
import { addToast } from '../features/ui/uiSlice';
import { httpClient } from '../api/httpClient';
import { UploadDialog, PromoteDialog, DangerZone, LibraryStats } from '../components/admin';
import { Button } from '../components/common';

const Admin = () => {
    const dispatch = useDispatch();
    const isAdmin = useSelector(selectIsAdmin);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [promoteOpen, setPromoteOpen] = useState(false);
    const [scanning, setScanning] = useState(false);

    const handleScanLibrary = async () => {
        setScanning(true);
        try {
            // Trigger the scan endpoint
            await httpClient.post('/api/admin/scan');
            dispatch(addToast({
                type: 'success',
                message: 'Library scan started successfully',
            }));
        } catch (error) {
            dispatch(addToast({
                type: 'error',
                message: error.response?.data?.message || 'Failed to start library scan',
            }));
        } finally {
            setScanning(false);
        }
    };

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">🛠️ Admin Dashboard</h1>
            </div>

            {/* Library Stats */}
            <section className="bg-base-100 rounded-2xl p-6 border border-base-200">
                <LibraryStats />
            </section>

            {/* Quick Actions */}
            <section>
                <h2 className="text-xl font-semibold mb-4">⚡ Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Upload Section */}
                    <div className="card bg-base-200 hover:bg-base-300 transition-colors">
                        <div className="card-body">
                            <div className="flex items-center gap-3">
                                <div className="text-4xl">📤</div>
                                <div>
                                    <h3 className="card-title text-lg">Upload Tracks</h3>
                                    <p className="text-sm text-base-content/60">
                                        Add new MP3 files to library
                                    </p>
                                </div>
                            </div>
                            <div className="card-actions justify-end mt-4">
                                <Button variant="primary" onClick={() => setUploadOpen(true)}>
                                    Upload
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Manage Users Section */}
                    <div className="card bg-base-200 hover:bg-base-300 transition-colors">
                        <div className="card-body">
                            <div className="flex items-center gap-3">
                                <div className="text-4xl">👤</div>
                                <div>
                                    <h3 className="card-title text-lg">Manage Users</h3>
                                    <p className="text-sm text-base-content/60">
                                        Promote or demote admins
                                    </p>
                                </div>
                            </div>
                            <div className="card-actions justify-end mt-4">
                                <Button variant="secondary" onClick={() => setPromoteOpen(true)}>
                                    Manage
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Scan Library Section (ENABLED) */}
                    <div className="card bg-base-200 hover:bg-base-300 transition-colors">
                        <div className="card-body">
                            <div className="flex items-center gap-3">
                                <div className="text-4xl">🔄</div>
                                <div>
                                    <h3 className="card-title text-lg">Scan Library</h3>
                                    <p className="text-sm text-base-content/60">
                                        Rescan music folder
                                    </p>
                                </div>
                            </div>
                            <div className="card-actions justify-end mt-4">
                                <Button
                                    variant="warning"
                                    onClick={handleScanLibrary}
                                    loading={scanning}
                                    disabled={scanning}
                                >
                                    {scanning ? 'Scanning...' : 'Scan Now'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Danger Zone */}
            <section>
                <h2 className="text-xl font-semibold mb-4 text-error">⚠️ Danger Zone</h2>
                <DangerZone />
            </section>

            {/* Dialogs */}
            <UploadDialog isOpen={uploadOpen} onClose={() => setUploadOpen(false)} />
            <PromoteDialog isOpen={promoteOpen} onClose={() => setPromoteOpen(false)} />
        </div>
    );
};

export default Admin;