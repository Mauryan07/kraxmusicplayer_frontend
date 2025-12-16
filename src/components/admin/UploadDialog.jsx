import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../features/ui/uiSlice';
import { httpClient } from '../../api/httpClient';
import { Button } from '../common';

const UploadDialog = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleFileChange = (e) => {
        // Prevent event bubbling which can cause refreshes on some mobile browsers
        e.stopPropagation();

        if (e.target.files && e.target.files.length > 0) {
            const selected = Array.from(e.target.files).filter(file =>
                file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|flac|m4a|ogg)$/i)
            );
            setFiles(prev => [...prev, ...selected]);

            // Reset input value to allow selecting the same file again if needed
            e.target.value = '';
        }
    };

    const handleUpload = async (e) => {
        // CRITICAL: Stop propagation and prevent default to avoid mobile refresh
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (files.length === 0) return;

        setUploading(true);
        setProgress(0);

        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });

        try {
            await httpClient.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percent);
                }
            });

            dispatch(addToast({ type: 'success', message: `Uploaded ${files.length} tracks successfully` }));
            setFiles([]);
            onClose();

        } catch (error) {
            console.error('Upload failed:', error);
            dispatch(addToast({
                type: 'error',
                message: error.response?.data?.message || 'Upload failed'
            }));
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    const removeFile = (e, index) => {
        e.preventDefault();
        e.stopPropagation();
        setFiles(files.filter((_, i) => i !== index));
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open z-50">
            {/* Backdrop with stopPropagation to prevent clicks passing through */}
            <div
                className="modal-backdrop bg-black/60"
                onClick={(e) => {
                    e.stopPropagation();
                    if (!uploading) onClose();
                }}
            ></div>

            <div className="modal-box relative bg-base-100 p-6 max-w-lg w-full mx-4">
                <h3 className="font-bold text-xl mb-4 text-center">Upload Music</h3>

                {/* File Selection Area - Using LABEL for native mobile support */}
                {/* Visual feedback changes based on uploading state */}
                <label
                    className={`
                        flex flex-col items-center justify-center w-full h-32 
                        border-2 border-dashed rounded-xl cursor-pointer
                        transition-colors duration-200
                        ${uploading ? 'border-base-200 bg-base-200 opacity-50 cursor-not-allowed' : 'border-primary/50 hover:bg-base-200 hover:border-primary'}
                    `}
                    onClick={(e) => uploading && e.preventDefault()}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <div className="text-4xl mb-2">📂</div>
                        <p className="mb-1 text-sm font-semibold">
                            {uploading ? 'Uploading...' : 'Tap to select files'}
                        </p>
                        <p className="text-xs text-base-content/60">MP3, FLAC, WAV</p>
                    </div>

                    {/* The Input is hidden but functional inside the label */}
                    <input
                        type="file"
                        multiple
                        accept="audio/*"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                </label>

                {/* File List */}
                {files.length > 0 && (
                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold">{files.length} selected</span>
                            {!uploading && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setFiles([]);
                                    }}
                                    className="text-xs text-error font-semibold px-2 py-1"
                                    type="button"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>
                        <div className="max-h-40 overflow-y-auto bg-base-200/50 rounded-lg p-2 space-y-2">
                            {files.map((f, i) => (
                                <div key={i} className="flex justify-between items-center bg-base-100 p-2 rounded shadow-sm">
                                    <span className="truncate text-sm flex-1 mr-2">{f.name}</span>
                                    {!uploading && (
                                        <button
                                            onClick={(e) => removeFile(e, i)}
                                            className="btn btn-circle btn-ghost btn-xs text-error min-h-0 h-6 w-6"
                                            type="button"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Progress Bar */}
                {uploading && (
                    <div className="mt-4 w-full">
                        <progress
                            className="progress progress-primary w-full h-3"
                            value={progress}
                            max="100"
                        ></progress>
                        <p className="text-center text-xs mt-1 font-mono">{progress}%</p>
                    </div>
                )}

                {/* Actions */}
                <div className="modal-action mt-6 flex gap-3">
                    <Button
                        variant="ghost"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onClose();
                        }}
                        disabled={uploading}
                        type="button"
                        className="flex-1"
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="primary"
                        onClick={handleUpload}
                        disabled={files.length === 0 || uploading}
                        loading={uploading}
                        type="button"
                        className="flex-1"
                    >
                        {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UploadDialog;