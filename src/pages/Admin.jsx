import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectIsAdmin } from '../features/auth/authSlice';
import { UploadDialog, PromoteDialog, DangerZone, LibraryStats } from '../components/admin';
import { Button } from '../components/common';

const Admin = () => {
    const isAdmin = useSelector(selectIsAdmin);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [promoteOpen, setPromoteOpen] = useState(false);

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

                    {/* Promote User Section */}
                    <div className="card bg-base-200 hover:bg-base-300 transition-colors">
                        <div className="card-body">
                            <div className="flex items-center gap-3">
                                <div className="text-4xl">👤</div>
                                <div>
                                    <h3 className="card-title text-lg">Promote User</h3>
                                    <p className="text-sm text-base-content/60">
                                        Grant admin privileges
                                    </p>
                                </div>
                            </div>
                            <div className="card-actions justify-end mt-4">
                                <Button variant="secondary" onClick={() => setPromoteOpen(true)}>
                                    Promote
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Refresh Library */}
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
                                <Button variant="ghost" disabled>
                                    Coming Soon
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