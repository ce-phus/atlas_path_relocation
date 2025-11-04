// components/DocumentSection.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadDocument } from '../actions/profileActions';

const DocumentSection = ({ profile, expanded = false }) => {
    const dispatch = useDispatch();
    const { documents, documentsLoading } = useSelector(state => state.profileReducer);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('document_file', file);
        formData.append('document_type', file.name.split('.')[0]);
        formData.append('profile', profile.id);

        setUploading(true);
        try {
            await dispatch(uploadDocument(formData));
            setShowUploadModal(false);
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'awaiting review': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-blue-100 text-blue-800';
        }
    };

    if (documentsLoading) {
        return (
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Documents</h2>
                <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const displayDocuments = expanded ? documents : documents?.slice(0, 5);

    return (
        <div className="bg-white shadow rounded-lg p-6 mt-5">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Documents</h2>
                <div className="flex items-center space-x-2">
                    {!expanded && documents?.length > 5 && (
                        <span className="text-sm text-gray-500">
                            {documents.length - 5} more documents
                        </span>
                    )}
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700"
                    >
                        Upload
                    </button>
                </div>
            </div>

            {!documents || documents.length === 0 ? (
                <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="text-gray-500">No documents uploaded yet</p>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700"
                    >
                        Upload Your First Document
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {displayDocuments.map((document) => (
                        <div
                            key={document.id}
                            className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                        >
                            <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                    {document.document_name || document.document_type}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Uploaded {new Date(document.created).toLocaleDateString()}
                                </p>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(document.status)}`}>
                                    {document.status}
                                </span>
                                <a
                                    href={document.document_file}
                                    download
                                    className="text-indigo-600 hover:text-indigo-800"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Document</h3>
                        <input
                            type="file"
                            onChange={handleFileUpload}
                            disabled={uploading}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                        <div className="mt-4 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowUploadModal(false)}
                                disabled={uploading}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={uploading}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {uploading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentSection;