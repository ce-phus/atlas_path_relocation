// components/DocumentSection.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadDocument, loadDocuments } from '../actions/profileActions';

const DocumentSection = ({ profile, expanded = false }) => {
    const dispatch = useDispatch();
    const { documents, documentsLoading } = useSelector(state => state.profileReducer);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    
    // Form state for document upload
    const [uploadForm, setUploadForm] = useState({
        document_type: '',
        document_file: null,
        description: '' // Optional field if you add it to model
    });

    // Common document types for dropdown
    const documentTypes = [
        'Passport',
        'Visa Application',
        'Birth Certificate',
        'Marriage Certificate',
        'Academic Certificates',
        'Proof of Income',
        'Bank Statements',
        'Employment Contract',
        'Rental Agreement',
        'Utility Bill',
        'Medical Records',
        'Insurance Documents',
        'Tax Returns',
        'Driver License',
        'Other'
    ];

    console.log("documents", documents);
    console.log("Profile in DocumentSection:", profile);

    const handleFileUpload = async (event) => {
        event.preventDefault(); // Prevent default form submission
        
        if (!uploadForm.document_file || !uploadForm.document_type) {
            alert('Please select a file and document type');
            return;
        }

        const formData = new FormData();
        formData.append('document_file', uploadForm.document_file);
        formData.append('document_type', uploadForm.document_type);
        formData.append('profile', profile.id);
        
        // Add optional description if provided
        if (uploadForm.description) {
            formData.append('description', uploadForm.description);
        }

        setUploading(true);
        try {
            await dispatch(uploadDocument(formData));
            setShowUploadModal(false);
            // Reset form after successful upload
            setUploadForm({
                document_type: '',
                document_file: null,
                description: ''
            });
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setUploadForm(prev => ({
                ...prev,
                document_file: file
            }));
            
            // Auto-set document type from filename if not already set
            if (!uploadForm.document_type) {
                const fileName = file.name.split('.')[0];
                const matchingType = documentTypes.find(type => 
                    type.toLowerCase().includes(fileName.toLowerCase()) ||
                    fileName.toLowerCase().includes(type.toLowerCase())
                );
                if (matchingType) {
                    setUploadForm(prev => ({
                        ...prev,
                        document_type: matchingType
                    }));
                }
            }
        }
    };

    const handleInputChange = (field, value) => {
        setUploadForm(prev => ({
            ...prev,
            [field]: value
        }));
    };



    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'awaiting review': return 'bg-yellow-100 text-yellow-800';
            case 'submitted': 
            default: return 'bg-blue-100 text-blue-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': 
                return <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>;
            case 'rejected':
                return <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>;
            case 'awaiting review':
                return <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>;
            case 'submitted':
            default:
                return <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>;
        }
    };

    // Extract documents array from paginated response
    const documentsArray = Array.isArray(documents) ? documents : (documents?.results || documents?.data || []);
    const displayDocuments = expanded ? documentsArray : documentsArray?.slice(0, 5);

    if (documentsLoading) {
        return (
            <div className="bg-white shadow rounded-lg p-6 mt-5">
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

    return (
        <div className="bg-white shadow rounded-lg p-6 mt-5">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Documents</h2>
                <div className="flex items-center space-x-2">
                    {!expanded && documentsArray?.length > 5 && (
                        <span className="text-sm text-gray-500">
                            {documentsArray.length - 5} more
                        </span>
                    )}
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="bg-indigo-600 text-white px-3 py-2 rounded-md text-sm hover:bg-indigo-700 flex items-center"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload Document
                    </button>
                </div>
            </div>

            {!documentsArray || documentsArray.length === 0 ? (
                <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="text-gray-500 mb-2">No documents uploaded yet</p>
                    <p className="text-sm text-gray-400 mb-4">
                        Upload your relocation documents for consultant review
                    </p>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700"
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
                                {getStatusIcon(document.status)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-medium text-gray-900">
                                    {document.document_type}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Uploaded {new Date(document.created_at).toLocaleDateString()}
                                </p>
                                {document.reviewed_by_name && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        Reviewed by: {document.reviewed_by_name}
                                    </p>
                                )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(document.status)}`}>
                                    {document.status}
                                </span>
                                <a
                                    href={document.document_file}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 hover:text-indigo-800 p-1"
                                    title="View Document"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </a>
                                <a
                                    href={document.document_file}
                                    download
                                    className="text-indigo-600 hover:text-indigo-800 p-1"
                                    title="Download Document"
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

            {/* Enhanced Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Document</h3>
                        
                        <form onSubmit={handleFileUpload} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Document Type *
                                </label>
                                <select
                                    required
                                    value={uploadForm.document_type}
                                    onChange={(e) => handleInputChange('document_type', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                >
                                    <option value="">Select Document Type</option>
                                    {documentTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Document File *
                                </label>
                                <input
                                    type="file"
                                    required
                                    onChange={handleFileChange}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Supported formats: PDF, Word, Images, Text files
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={uploadForm.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    rows="3"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="Add any notes about this document..."
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowUploadModal(false);
                                        setUploadForm({
                                            document_type: '',
                                            document_file: null,
                                            description: ''
                                        });
                                    }}
                                    disabled={uploading}
                                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading || !uploadForm.document_file || !uploadForm.document_type}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploading ? 'Uploading...' : 'Upload Document'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentSection;