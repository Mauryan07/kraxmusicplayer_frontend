import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../features/ui/uiSlice';
import { API_BASE } from '../../api/httpClient';
import { Button } from '../common';

const UploadDialog = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e. target.files);
        const audioFiles = selectedFiles. filter(
            (file) =>
                file.type. startsWith('audio/') ||
                file.name.toLowerCase().endsWith('.mp3') ||
                file.name.toLowerCase().endsWith('.flac') ||
                file.name.toLowerCase().endsWith('.wav') ||
                file.name.toLowerCase().endsWith('.m4a') ||
                file.name. toLowerCase().endsWith('.ogg')
        );
        setFiles(audioFiles);
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setUploading(true);
        setProgress(0);

        try {
            // Create FormData with all files using 'files' as the key (matching backend)
            const formData = new FormData();
            files.forEach((file) => {
                formData.append('files', file); // Note: 'files' matches @RequestParam("files")
            });

            // Get auth token
            const token = localStorage.getItem('basicToken');

            // Use XMLHttpRequest for progress tracking
            const xhr = new XMLHttpRequest();

            // Create a promise to handle the async upload
            const uploadPromise = new Promise((resolve, reject) => {
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = Math.round((event.loaded / event.total) * 100);
                        setProgress(percentComplete);
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr.responseText);
                    } else {
                        reject(new Error(xhr.responseText || 'Upload failed'));
                    }
                });

                xhr.addEventListener('error', () => {
                    reject(new Error('Network error during upload'));
                });

                xhr.addEventListener('abort', () => {
                    reject(new Error('Upload aborted'));
                });
            });

            // Open and send request
            xhr.open('POST', `${API_BASE}/api/upload`);

            // Set authorization header if token exists
            if (token) {
                xhr.setRequestHeader('Authorization', `Basic ${token}`);
            }

            // Send the form data
            xhr. send(formData);

            // Wait for upload to complete
            const response = await uploadPromise;

            dispatch(
                addToast({
                    type: 'success',
                    message: `Successfully uploaded ${files.length} track(s)`,
                })
            );

            // Reset state and close dialog
            setFiles([]);
            setProgress(0);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            onClose();

        } catch (error) {
            console.error('Upload error:', error);
            dispatch(
                addToast({
                    type: 'error',
                    message:  error.message || 'Failed to upload tracks',
                })
            );
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const droppedFiles = Array.from(e. dataTransfer.files);
        const audioFiles = droppedFiles.filter(
            (file) =>
                file.type.startsWith('audio/') ||
                file.name.toLowerCase().endsWith('.mp3') ||
                file.name.toLowerCase().endsWith('.flac') ||
                file.name.toLowerCase().endsWith('.wav') ||
                file.name.toLowerCase().endsWith('.m4a') ||
                file.name.toLowerCase().endsWith('.ogg')
        );
        setFiles((prev) => [...prev, ...audioFiles]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleRemoveFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleClearAll = () => {
        setFiles([]);
        if (fileInputRef. current) {
            fileInputRef.current.value = '';
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math. log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (! isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-backdrop bg-black/50" onClick={! uploading ?  onClose : undefined}></div>
            <div className="modal-box max-w-2xl">
                <button
                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={onClose}
                    disabled={uploading}
                >
                    ✕
                </button>

                <h3 className="font-bold text-lg mb-4">Upload Tracks</h3>

                {/* Drop zone */}
                <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        uploading
                            ? 'border-base-300 bg-base-200 cursor-not-allowed'
                            : 'border-base-300 hover:border-primary hover:bg-base-200'
                    }`}
                    onClick={() => ! uploading && fileInputRef.current?. click()}
                    onDrop={! uploading ? handleDrop : undefined}
                    onDragOver={!uploading ?  handleDragOver :  undefined}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mx-auto text-base-content/30 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                    </svg>
                    <p className="text-base-content/70">
                        {uploading
                            ? 'Uploading...'
                            : 'Drag & drop audio files here, or click to browse'}
                    </p>
                    <p className="text-xs text-base-content/50 mt-2">
                        Supports MP3, FLAC, WAV, M4A, OGG
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="audio/*,. mp3,.flac,.wav,.m4a,.ogg"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                </div>

                {/* Selected files list */}
                {files.length > 0 && (
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">{files.length} file(s) selected</p>
                            {! uploading && (
                                <button
                                    className="btn btn-ghost btn-xs text-error"
                                    onClick={handleClearAll}
                                >
                                    Clear All
                                </button>
                            )}
                        </div>
                        <ul className="max-h-48 overflow-y-auto space-y-2 bg-base-200 rounded-lg p-2">
                            {files.map((file, index) => (
                                <li
                                    key={index}
                                    className="flex items-center justify-between p-2 bg-base-100 rounded-lg"
                                >
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 text-primary flex-shrink-0"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-. 895-3-2 1.343-2 3-2 3 . 895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                                            />
                                        </svg>
                                        <div className="min-w-0">
                                            <p className="text-sm truncate">{file. name}</p>
                                            <p className="text-xs text-base-content/50">
                                                {formatFileSize(file. size)}
                                            </p>
                                        </div>
                                    </div>
                                    {!uploading && (
                                        <button
                                            className="btn btn-ghost btn-xs btn-circle"
                                            onClick={() => handleRemoveFile(index)}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Progress bar */}
                {uploading && (
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">Uploading...</span>
                            <span className="text-sm">{progress}%</span>
                        </div>
                        <progress
                            className="progress progress-primary w-full"
                            value={progress}
                            max="100"
                        ></progress>
                    </div>
                )}

                {/* Actions */}
                <div className="modal-action">
                    <Button variant="ghost" onClick={onClose} disabled={uploading}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleUpload}
                        disabled={files.length === 0 || uploading}
                        loading={uploading}
                    >
                        {uploading ? `Uploading (${progress}%)` : `Upload ${files.length > 0 ? `(${files.length})` : ''}`}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UploadDialog;