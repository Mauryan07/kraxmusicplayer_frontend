import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { httpClient, getApiBase } from '../api/httpClient';
import { addToast } from '../features/ui/uiSlice';
import { deleteAllTracks } from '../features/tracks/tracksSlice';
import { fetchHome, selectHomeCounts } from '../features/home/homeSlice';
import { Button, Loader } from '../components/common';

const ALLOWED_FILE_TYPES = ['. mp3', '.m4a'];
const ALLOWED_MIME_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/m4a', 'audio/x-m4a', 'audio/mp4'];

const Admin = () => {
    const dispatch = useDispatch();
    const counts = useSelector(selectHomeCounts);

    const [uploadFiles, setUploadFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [promoteUsername, setPromoteUsername] = useState('');
    const [promoting, setPromoting] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [deleting, setDeleting] = useState(false);

    const fileInputRef = useRef(null);

    useEffect(() => {
        dispatch(fetchHome({}));
    }, [dispatch]);

    // File Selection
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter((file) => {
            const ext = '.' + file.name.split('. ').pop().toLowerCase();
            return ALLOWED_FILE_TYPES. includes(ext) || ALLOWED_MIME_TYPES.includes(file.type);
        });

        if (validFiles.length !== files.length) {
            dispatch(addToast({
                type: 'warning',
                message: `Only MP3 and M4A files are allowed. ${files.length - validFiles.length} file(s) skipped.`
            }));
        }

        if (validFiles.length > 0) {
            setUploadFiles((prev) => [...prev, ...validFiles]);
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveFile = (index) => {
        setUploadFiles((prev) => prev.filter((_, i) => i !== index));
        setUploadProgress((prev) => {
            const newProgress = { ... prev };
            delete newProgress[index];
            return newProgress;
        });
    };

    const handleClearAllFiles = () => {
        setUploadFiles([]);
        setUploadProgress({});
    };

    // Upload Files
    const handleUpload = async () => {
        if (uploadFiles.length === 0) return;

        setUploading(true);
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < uploadFiles.length; i++) {
            const file = uploadFiles[i];
            const formData = new FormData();
            formData.append('file', file);

            try {
                setUploadProgress((prev) => ({ ...prev, [i]: 'uploading' }));

                await httpClient.post('/api/track/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                setUploadProgress((prev) => ({ ...prev, [i]: 'success' }));
                successCount++;
            } catch (error) {
                console.error('Upload error:', error);
                setUploadProgress((prev) => ({ ...prev, [i]: 'error' }));
                failCount++;
            }
        }

        setUploading(false);

        if (successCount > 0) {
            dispatch(addToast({ type: 'success', message: `${successCount} file(s) uploaded successfully` }));
            dispatch(fetchHome({}));
        }
        if (failCount > 0) {
            dispatch(addToast({ type: 'error', message:  `${failCount} file(s) failed to upload` }));
        }
    };

    // Promote User
    const handlePromoteUser = async () => {
        if (! promoteUsername. trim()) return;

        setPromoting(true);
        try {
            await httpClient.post('/api/auth/promote', { username: promoteUsername. trim() });
            dispatch(addToast({ type: 'success', message: `User "${promoteUsername}" promoted to admin` }));
            setPromoteUsername('');
        } catch (error) {
            dispatch(addToast({
                type: 'error',
                message: error.response?.data?.message || 'Failed to promote user'
            }));
        } finally {
            setPromoting(false);
        }
    };

    // Scan Library
    const handleScanLibrary = async () => {
        setScanning(true);
        try {
            await httpClient.post('/api/track/scan');
            dispatch(addToast({ type: 'success', message: 'Library scan completed' }));
            dispatch(fetchHome({}));
        } catch (error) {
            dispatch(addToast({
                type: 'error',
                message: error.response?. data?.message || 'Failed to scan library'
            }));
        } finally {
            setScanning(false);
        }
    };

    // Delete All Tracks
    const handleDeleteAll = async () => {
        if (deleteConfirm !== 'DELETE ALL') return;

        setDeleting(true);
        try {
            await dispatch(deleteAllTracks()).unwrap();
            setDeleteConfirm('');
            dispatch(fetchHome({}));
        } catch (error) {
            // Error handled in slice
        } finally {
            setDeleting(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math. log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        return ext === 'm4a' ? '🎵' : '🎶';
    };

    return (
        <div className="space-y-6 pb-24">
            {/* Header */}
            <div className="text-center sm:text-left">
                <h1 className="text-3xl font-bold flex items-center justify-center sm:justify-start gap-2">
                    🛠️ Admin Dashboard
                </h1>
                <p className="text-base-content/60 mt-1">Manage your music library</p>
            </div>

            {/* Library Statistics */}
            <div className="card bg-base-200 shadow-lg">
                <div className="card-body">
                    <h2 className="card-title text-lg">📊 Library Statistics</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        {/* Total Tracks */}
                        <div className="bg-base-100 rounded-xl p-4 text-center">
                            <div className="text-3xl mb-1">🎵</div>
                            <div className="text-2xl font-bold text-primary">
                                {counts?. totalTracks || 0}
                            </div>
                            <div className="text-xs text-base-content/60">Total Tracks</div>
                        </div>

                        {/* Total Albums */}
                        <div className="bg-base-100 rounded-xl p-4 text-center">
                            <div className="text-3xl mb-1">💿</div>
                            <div className="text-2xl font-bold text-secondary">
                                {counts?.totalAlbums || 0}
                            </div>
                            <div className="text-xs text-base-content/60">Total Albums</div>
                        </div>

                        {/* Format */}
                        <div className="bg-base-100 rounded-xl p-4 text-center">
                            <div className="text-3xl mb-1">📁</div>
                            <div className="text-lg font-bold">MP3/M4A</div>
                            <div className="text-xs text-base-content/60">Format</div>
                        </div>

                        {/* Status */}
                        <div className="bg-base-100 rounded-xl p-4 text-center">
                            <div className="text-3xl mb-1">✅</div>
                            <div className="text-lg font-bold text-success">Online</div>
                            <div className="text-xs text-base-content/60">Status</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <h2 className="text-xl font-bold flex items-center gap-2">⚡ Quick Actions</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Upload Tracks Card */}
                <div className="card bg-base-200 shadow-lg md:col-span-2 lg:col-span-2">
                    <div className="card-body">
                        <h3 className="card-title text-lg">
                            📤 Upload Tracks
                        </h3>
                        <p className="text-sm text-base-content/60">
                            Add new MP3 or M4A files to your library
                        </p>

                        {/* File Input */}
                        <div className="mt-4">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept=".mp3,.m4a,audio/mpeg,audio/mp3,audio/m4a,audio/x-m4a,audio/mp4"
                                multiple
                                className="hidden"
                            />

                            <div
                                className="border-2 border-dashed border-base-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary hover:bg-base-300/50 transition-all"
                                onClick={() => fileInputRef.current?. click()}
                            >
                                <div className="text-4xl mb-2">📁</div>
                                <p className="font-medium">Click to select files</p>
                                <p className="text-sm text-base-content/60 mt-1">
                                    MP3, M4A files supported
                                </p>
                            </div>
                        </div>

                        {/* File List */}
                        {uploadFiles.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {uploadFiles.length} file(s) selected
                  </span>
                                    <button
                                        className="btn btn-ghost btn-xs text-error"
                                        onClick={handleClearAllFiles}
                                        disabled={uploading}
                                    >
                                        🗑️ Clear All
                                    </button>
                                </div>

                                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                                    {uploadFiles.map((file, index) => (
                                        <div
                                            key={index}
                                            className={`flex items-center gap-3 p-3 rounded-lg ${
                                                uploadProgress[index] === 'success'
                                                    ? 'bg-success/20'
                                                    : uploadProgress[index] === 'error'
                                                        ? 'bg-error/20'
                                                        : uploadProgress[index] === 'uploading'
                                                            ? 'bg-warning/20'
                                                            : 'bg-base-300'
                                            }`}
                                        >
                                            <span className="text-xl">{getFileIcon(file. name)}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{file.name}</p>
                                                <p className="text-xs text-base-content/60">
                                                    {formatFileSize(file.size)}
                                                </p>
                                            </div>

                                            {/* Status Icon */}
                                            {uploadProgress[index] === 'uploading' && (
                                                <span className="loading loading-spinner loading-sm"></span>
                                            )}
                                            {uploadProgress[index] === 'success' && (
                                                <span className="text-success">✓</span>
                                            )}
                                            {uploadProgress[index] === 'error' && (
                                                <span className="text-error">✗</span>
                                            )}

                                            {/* Remove Button */}
                                            {! uploadProgress[index] && (
                                                <button
                                                    className="btn btn-ghost btn-xs btn-circle"
                                                    onClick={() => handleRemoveFile(index)}
                                                    disabled={uploading}
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Upload Button */}
                                <Button
                                    variant="primary"
                                    className="w-full mt-4"
                                    onClick={handleUpload}
                                    disabled={uploading || uploadFiles.length === 0}
                                >
                                    {uploading ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            Uploading...
                                        </>
                                    ) : (
                                        <>📤 Upload {uploadFiles.length} File(s)</>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Promote User Card */}
                <div className="card bg-base-200 shadow-lg">
                    <div className="card-body">
                        <h3 className="card-title text-lg">
                            👤 Promote User
                        </h3>
                        <p className="text-sm text-base-content/60">
                            Grant admin privileges to a user
                        </p>

                        <div className="mt-4 space-y-3">
                            <input
                                type="text"
                                placeholder="Enter username"
                                className="input input-bordered w-full"
                                value={promoteUsername}
                                onChange={(e) => setPromoteUsername(e.target.value)}
                                disabled={promoting}
                            />
                            <Button
                                variant="primary"
                                className="w-full"
                                onClick={handlePromoteUser}
                                disabled={promoting || !promoteUsername.trim()}
                            >
                                {promoting ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Promoting...
                                    </>
                                ) : (
                                    <>👤 Promote to Admin</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Scan Library Card */}
                <div className="card bg-base-200 shadow-lg">
                    <div className="card-body">
                        <h3 className="card-title text-lg">
                            🔄 Scan Library
                        </h3>
                        <p className="text-sm text-base-content/60">
                            Rescan music folder for new files
                        </p>

                        <div className="mt-4">
                            <Button
                                variant="secondary"
                                className="w-full"
                                onClick={handleScanLibrary}
                                disabled={scanning}
                            >
                                {scanning ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Scanning...
                                    </>
                                ) : (
                                    <>🔄 Scan Library</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="card bg-error/10 border border-error/30 shadow-lg">
                <div className="card-body">
                    <h2 className="card-title text-lg text-error">⚠️ Danger Zone</h2>

                    <div className="bg-base-100 rounded-xl p-4 mt-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex-1">
                                <h3 className="font-bold flex items-center gap-2">
                                    🗑️ Delete All Tracks
                                </h3>
                                <p className="text-sm text-base-content/60 mt-1">
                                    This will permanently delete all tracks from your library.  This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 space-y-3">
                            <div>
                                <label className="text-sm text-base-content/60 mb-1 block">
                                    Type <strong>DELETE ALL</strong> to confirm
                                </label>
                                <input
                                    type="text"
                                    placeholder="Type DELETE ALL"
                                    className="input input-bordered input-error w-full"
                                    value={deleteConfirm}
                                    onChange={(e) => setDeleteConfirm(e.target. value)}
                                    disabled={deleting}
                                />
                            </div>
                            <Button
                                variant="error"
                                className="w-full sm:w-auto"
                                onClick={handleDeleteAll}
                                disabled={deleting || deleteConfirm !== 'DELETE ALL'}
                            >
                                {deleting ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Deleting...
                                    </>
                                ) : (
                                    <>🗑️ Delete All Tracks</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;