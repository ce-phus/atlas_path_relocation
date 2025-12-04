import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { updateDocumentStatus, loadDocuments } from '../../actions/profileActions'

const modalVariants = {
    hidden: { 
        opacity: 0,
        scale: 0.8
    },
    visible: { 
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            damping: 25,
            stiffness: 300
        }
    },
    exit: {
        opacity: 0,
        scale: 0.8,
        transition: {
            duration: 0.2
        }
    }
}

const API_URL = import.meta.env.VITE_API_URL

const ViewDocs = ({ onClose, documents: initialDocuments }) => {
    const dispatch = useDispatch();

    const { 
        statusLoading, 
        statusSuccess, 
        statusError 
    } = useSelector((state) => state.documentStatusReducer);
    
    const { documentloading, documenterror, success, documents: reduxDocuments } = useSelector((state) => state.profileReducer);
    
    // Use either initialDocuments or reduxDocuments
    const documents = initialDocuments || reduxDocuments || [];
    
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [statusChange, setStatusChange] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filteredDocs, setFilteredDocs] = useState([]);

    // Status options for dropdown
    const statusOptions = [
        { value: 'submitted', label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
        { value: 'awaiting review', label: 'Awaiting Review', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
        { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' }
    ];

    // Filter documents based on selected status
    useEffect(() => {
        if (filterStatus === 'all') {
            setFilteredDocs(documents);
        } else {
            setFilteredDocs(documents.filter(doc => doc.status === filterStatus));
        }
    }, [documents, filterStatus]);

    // Handle status update
    const handleStatusUpdate = () => {
        if (!selectedDoc || !statusChange) return;
        
        const statusData = { status: statusChange };
        dispatch(updateDocumentStatus(selectedDoc.id, statusData))
            .then(() => {
                setSelectedDoc(null);
                setStatusChange('');
                // Refresh documents after successful update
                dispatch(loadDocuments());
            });
    };

    const getStatusColor = (status) => {
        const statusMap = {
            'submitted': 'bg-blue-100 text-blue-800 border-blue-200',
            'awaiting review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'approved': 'bg-green-100 text-green-800 border-green-200',
            'rejected': 'bg-red-100 text-red-800 border-red-200'
        };
        return statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getFileIcon = (fileName) => {
        if (!fileName) return '📄';
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (['pdf'].includes(ext)) return '📄';
        if (['doc', 'docx'].includes(ext)) return '📝';
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return '🖼️';
        return '📎';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
        >
            <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-white rounded-2xl p-6 w-full max-w-4xl shadow-2xl mx-4 max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                    <div>
                        <h3 className="text-xl font-bold tracking-tight text-center mb-6 bg-gradient-to-r from-gray-800 to-indigo-600 bg-clip-text text-transparent inline-block [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                            Client Documents
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {documents.length} document{documents.length !== 1 ? 's' : ''} found
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        {/* Status Filter */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 text-black focus:border-indigo-500"
                        >
                            <option value="all">All Status</option>
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors duration-200"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </motion.button>
                    </div>
                </div>

                {/* Error Message */}
                {documenterror || statusError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">
                        Error: {documenterror || statusError}
                    </div>
                )}

                {/* Success Message */}
                {statusSuccess && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm">
                        Document status updated successfully!
                    </div>
                )}

                {/* Documents List */}
                <div className="space-y-4">
                    {filteredDocs.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                {filterStatus === 'all' ? 'No Documents' : `No ${filterStatus} Documents`}
                            </h4>
                            <p className="text-gray-500">
                                {filterStatus === 'all' 
                                    ? 'This client has not uploaded any documents yet.'
                                    : `No documents with status "${filterStatus}" found.`
                                }
                            </p>
                        </div>
                    ) : (
                        filteredDocs.map((doc) => {
                            console.log('Rendering document:', doc);
                            
                            let documentPath;
                            if (doc.document_file) {
                                if (doc.document_file.startsWith('http') || doc.document_file.startsWith('https')) {
                                    const documentPathUrl = new URL(doc.document_file);
                                    documentPath = documentPathUrl.pathname;
                                } else {
                                    documentPath = doc.document_file.startsWith("/") ? doc.document_file : `/${doc.document_file}`;
                                }
                            }

                            const fullDocumentURL = documentPath ? `${API_URL}${documentPath}` : null;

                            return (
                                <motion.div 
                                    key={doc.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-indigo-300 transition-colors duration-200"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        {/* Document Info */}
                                        <div className="flex items-start space-x-4 flex-1">
                                            <div className="w-12 h-12 bg-white border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <span className="text-xl">{getFileIcon(fullDocumentURL)}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <h4 className="font-semibold text-gray-900 truncate">
                                                        {doc.document_name || doc.document_type}
                                                    </h4>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(doc.status)}`}>
                                                        {doc.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    Type: {doc.document_type}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                                                    <span>Uploaded: {formatDate(doc.created_at)}</span>
                                                    {doc.reviewed_by_name && (
                                                        <span>Reviewed by: {doc.reviewed_by_name}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center space-x-3">
                                            {/* View/Download */}
                                            <div className="flex space-x-2">
                                                {doc.document_file && (
                                                    <motion.a
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        href={fullDocumentURL}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                                                        title="View Document"
                                                    >
                                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </motion.a>
                                                )}
                                                {doc.document_file && (
                                                    <motion.a
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        href={fullDocumentURL}
                                                        download
                                                        className="p-2 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200"
                                                        title="Download Document"
                                                    >
                                                        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                    </motion.a>
                                                )}
                                            </div>

                                            {/* Update Status Button */}
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    setSelectedDoc(doc);
                                                    setStatusChange(doc.status);
                                                }}
                                                disabled={documentloading}
                                                className="px-3 py-2 cursor-pointer bg-indigo-600 cursor-pointer text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                            >
                                                Update Status
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })
                    )}
                </div>

                {/* Status Update Modal */}
                {selectedDoc && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl"
                        >
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Update Document Status
                            </h4>
                            <p className="text-gray-600 mb-2">
                                <span className="font-medium">{selectedDoc.document_name || selectedDoc.document_type}</span>
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                Current status: <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedDoc.status)}`}>
                                    {selectedDoc.status}
                                </span>
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        New Status
                                    </label>
                                    <select
                                        value={statusChange}
                                        onChange={(e) => setStatusChange(e.target.value)}
                                        className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        {statusOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="button"
                                        onClick={() => {
                                            setSelectedDoc(null);
                                            setStatusChange('');
                                        }}
                                        disabled={documentloading}
                                        className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 cursor-pointer"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleStatusUpdate}
                                        disabled={documentloading || !statusChange || statusChange === selectedDoc.status}
                                        className="px-4 py-2 cursor-pointer bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                    >
                                        {documentloading ? 'Updating...' : 'Update Status'}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center text-sm text-gray-500">
                        <div>
                            Showing {filteredDocs.length} of {documents.length} document{documents.length !== 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center space-x-4">
                            {/* Status Legend */}
                            <div className="flex items-center space-x-2">
                                {statusOptions.map(status => (
                                    <div key={status.value} className="flex items-center space-x-1">
                                        <div className={`w-2 h-2 rounded-full ${status.color.split(' ')[0]}`}></div>
                                        <span className="text-xs">{status.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default ViewDocs