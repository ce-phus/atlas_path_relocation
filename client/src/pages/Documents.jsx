import React, { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout } from '../components'
import { uploadDocument, documentSearch, documentStatus } from '../actions/profileActions'
import { motion, AnimatePresence } from 'framer-motion'
import Skeleton from "react-loading-skeleton"

const Documents = () => {
    const dispatch = useDispatch();
    const { 
        documents, 
        documentsLoading, 
        documentsError,
        documentSearchResults,
        documentSearchLoading,
        documentStatusData,
        documentStatusLoading 
    } = useSelector(state => state.profileReducer);
    
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchTimeout, setSearchTimeout] = useState(null);

    // Form state for document upload
    const [uploadForm, setUploadForm] = useState({
        document_type: '',
        document_file: null,
        description: ''
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

    // Debounced search function
    const debouncedSearch = useCallback((query) => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        if (query.trim() === '') {
            // If search is cleared, load all documents
            dispatch(documentStatus());
            return;
        }

        const timeout = setTimeout(() => {
            dispatch(documentSearch(query));
        }, 500);

        setSearchTimeout(timeout);
    }, [searchTimeout, dispatch]);

    // Handle search input change
    const handleSearchChange = (value) => {
        setSearchTerm(value);
        debouncedSearch(value);
    };

    // Handle status filter change
    const handleFilterChange = (status) => {
        setFilter(status);
        if (status === 'all') {
            dispatch(documentStatus());
        } else {
            dispatch(documentStatus(status));
        }
    };

    // Load initial documents
    useEffect(() => {
        dispatch(documentStatus());
    }, [dispatch]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    // Determine which documents to display
    const getDisplayDocuments = () => {
        if (searchTerm.trim() !== '') {
            return documentSearchResults || [];
        }
        
        if (filter !== 'all' && documentStatusData?.documents) {
            return documentStatusData.documents;
        }
        
        // Default: all documents from status overview
        const documentsArray = Array.isArray(documents) ? documents : (documents?.results || documents?.data || []);
        return documentsArray;
    };

    // Get status counts from status overview data
    const getStatusCounts = () => {
        if (documentStatusData?.status_overview) {
            const statusCounts = {
                approved: 0,
                submitted: 0,
                'awaiting review': 0,
                rejected: 0,
                total: documentStatusData.total_documents || 0
            };

            documentStatusData.status_overview.forEach(item => {
                statusCounts[item.status] = item.count;
            });

            return statusCounts;
        }

        // Fallback to client-side calculation
        const documentsArray = Array.isArray(documents) ? documents : (documents?.results || documents?.data || []);
        return {
            approved: documentsArray.filter(doc => doc.status === 'approved').length,
            submitted: documentsArray.filter(doc => doc.status === 'submitted').length,
            'awaiting review': documentsArray.filter(doc => doc.status === 'awaiting review').length,
            rejected: documentsArray.filter(doc => doc.status === 'rejected').length,
            total: documentsArray.length
        };
    };

    const statusCounts = getStatusCounts();
    const displayDocuments = getDisplayDocuments();

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12
            }
        }
    };

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
    };

    const handleFileUpload = async (event) => {
        event.preventDefault();
        
        if (!uploadForm.document_file || !uploadForm.document_type) {
            alert('Please select a file and document type');
            return;
        }

        const formData = new FormData();
        formData.append('document_file', uploadForm.document_file);
        formData.append('document_type', uploadForm.document_type);
        
        if (uploadForm.description) {
            formData.append('description', uploadForm.description);
        }

        setUploading(true);
        try {
            await dispatch(uploadDocument(formData));
            setShowUploadModal(false);
            setUploadForm({
                document_type: '',
                document_file: null,
                description: ''
            });
            // Reload documents after upload
            dispatch(documentStatus());
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

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            setUploadForm(prev => ({
                ...prev,
                document_file: file
            }));
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
            case 'approved': return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            case 'awaiting review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'submitted': 
            default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': 
                return (
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                );
            case 'rejected':
                return (
                    <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>
                );
            case 'awaiting review':
                return (
                    <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                    </div>
                );
            case 'submitted':
            default:
                return (
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                    </div>
                );
        }
    };

    const getFileIcon = (fileName) => {
        const ext = fileName?.split('.').pop()?.toLowerCase();
        if (['pdf'].includes(ext)) {
            return '📄';
        } else if (['doc', 'docx'].includes(ext)) {
            return '📝';
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
            return '🖼️';
        } else {
            return '📎';
        }
    };

    // Check if we're currently loading data
    const isLoading = documentsLoading || documentSearchLoading || documentStatusLoading;

    // Search loading skeleton
    const SearchLoadingSkeleton = () => (
        <div className="space-y-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="bg-white/80 rounded-xl p-6 border border-gray-200/60">
                    <div className="flex items-center space-x-4">
                        <Skeleton circle width={48} height={48} />
                        <div className="flex-1 space-y-2">
                            <Skeleton width="60%" height={20} />
                            <Skeleton width="40%" height={16} />
                            <div className="flex space-x-2">
                                <Skeleton width={80} height={24} />
                                <Skeleton width={100} height={24} />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    if (isLoading && !displayDocuments.length) {
        return (
            <Layout>
                <div className="min-h-screen bg-white py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="animate-pulse space-y-8">
                            {/* Header Skeleton */}
                            <div className="text-center space-y-4">
                                <Skeleton height={40} width={200} className="mx-auto" />
                                <Skeleton height={20} width={300} className="mx-auto" />
                            </div>
                            
                            {/* Stats Skeleton */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                        <Skeleton height={24} width="75%" className="mb-2" />
                                        <Skeleton height={32} width="50%" />
                                    </div>
                                ))}
                            </div>

                            {/* Documents Skeleton */}
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
                                        <div className="flex items-center space-x-4">
                                            <Skeleton circle width={48} height={48} />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton height={16} width="75%" />
                                                <Skeleton height={12} width="50%" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (documentsError) {
        return (
            <Layout>
                <div className="min-h-screen bg-white py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gradient-to-br from-white to-red-50/80 shadow-xl rounded-2xl p-8 border border-red-100/60 backdrop-blur-sm text-center"
                        >
                            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Documents</h3>
                            <p className="text-gray-600 mb-4">{documentsError}</p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => dispatch(documentStatus())}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                Try Again
                            </motion.button>
                        </motion.div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-center mb-6 bg-gradient-to-r from-gray-800 to-indigo-600 bg-clip-text text-transparent inline-block [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                            Relocation Documents
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Manage all your relocation documents in one secure place. Upload, track, and organize your important files.
                        </p>
                    </motion.div>

                    {/* Stats Overview */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
                    >
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm">
                            <div className="text-2xl font-bold text-indigo-600">{statusCounts.total}</div>
                            <div className="text-sm text-gray-500">Total Documents</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm">
                            <div className="text-2xl font-bold text-green-600">{statusCounts.approved}</div>
                            <div className="text-sm text-gray-500">Approved</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm">
                            <div className="text-2xl font-bold text-amber-600">{statusCounts.submitted + statusCounts['awaiting review']}</div>
                            <div className="text-sm text-gray-500">Pending Review</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm">
                            <div className="text-2xl font-bold text-red-600">{statusCounts.rejected}</div>
                            <div className="text-sm text-gray-500">Rejected</div>
                        </div>
                    </motion.div>

                    {/* Search and Filter Bar */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm mb-8"
                    >
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="flex-1 w-full md:max-w-md">
                                <div className="relative">
                                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Search documents..."
                                        value={searchTerm}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        className="w-full pl-10 pr-12 text-black py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                    />
                                    {(documentSearchLoading || documentStatusLoading) && (
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { key: 'all', label: 'All Documents', count: statusCounts.total },
                                    { key: 'pending', label: 'Pending', count: statusCounts.submitted + statusCounts['awaiting review'] },
                                    { key: 'approved', label: 'Approved', count: statusCounts.approved },
                                    { key: 'rejected', label: 'Rejected', count: statusCounts.rejected }
                                ].map((filterOption) => (
                                    <motion.button
                                        key={filterOption.key}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleFilterChange(filterOption.key)}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                                            filter === filterOption.key
                                                ? 'bg-indigo-600 text-white shadow-lg'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {filterOption.label} ({filterOption.count})
                                    </motion.button>
                                ))}
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowUploadModal(true)}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
                            >
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <span>Upload Document</span>
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Documents List */}
                    {displayDocuments.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 border border-gray-200/60 shadow-sm text-center"
                        >
                            <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                                {searchTerm ? 'No Documents Found' : 'No Documents Yet'}
                            </h3>
                            <p className="text-gray-600 max-w-md mx-auto mb-6">
                                {searchTerm 
                                    ? 'Try adjusting your search terms or clear the search to see all documents.'
                                    : 'Upload your relocation documents for consultant review and approval.'
                                }
                            </p>
                            {!searchTerm && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowUploadModal(true)}
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center space-x-2"
                                >
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <span>Upload Your First Document</span>
                                </motion.button>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-4"
                        >
                            {/* Show loading skeleton when searching/filtering */}
                            {(documentSearchLoading || documentStatusLoading) ? (
                                <SearchLoadingSkeleton />
                            ) : (
                                <AnimatePresence>
                                    {displayDocuments.map((document) => (
                                        <motion.div
                                            key={document.id}
                                            variants={itemVariants}
                                            layout
                                            whileHover={{ scale: 1.02 }}
                                            className="group bg-white/80 rounded-xl p-6 border border-gray-200/60 hover:border-indigo-300/50 shadow-sm hover:shadow-md transition-all duration-300"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4 flex-1 min-w-0">
                                                    {getStatusIcon(document.status)}
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                                {document.document_type}
                                                            </h3>
                                                            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(document.status)}`}>
                                                                {document.status}
                                                            </span>
                                                        </div>
                                                        
                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-600 gap-2">
                                                            <span className="flex items-center space-x-1">
                                                                <span className="text-lg">{getFileIcon(document.document_file)}</span>
                                                                <span>{document.document_name || 'Document'}</span>
                                                            </span>
                                                            <span className="hidden sm:inline">•</span>
                                                            <span>Uploaded {new Date(document.created_at).toLocaleDateString()}</span>
                                                            {document.reviewed_by_name && (
                                                                <>
                                                                    <span className="hidden sm:inline">•</span>
                                                                    <span className="text-indigo-600">Reviewed by {document.reviewed_by_name}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center space-x-2 ml-4">
                                                    <motion.a
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        href={document.document_file}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-10 h-10 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors duration-200 flex-shrink-0"
                                                        title="View Document"
                                                    >
                                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </motion.a>
                                                    <motion.a
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        href={document.document_file}
                                                        download
                                                        className="w-10 h-10 bg-green-50 hover:bg-green-100 rounded-lg flex items-center justify-center transition-colors duration-200 flex-shrink-0"
                                                        title="Download Document"
                                                    >
                                                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                    </motion.a>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {showUploadModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md md:max-w-lg shadow-2xl mx-4"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold tracking-tight text-center mb-6 bg-gradient-to-r from-gray-800 to-indigo-600 bg-clip-text text-transparent inline-block [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                                    Upload Document
                                </h3>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => {
                                        setShowUploadModal(false);
                                        setUploadForm({
                                            document_type: '',
                                            document_file: null,
                                            description: ''
                                        });
                                    }}
                                    className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors duration-200"
                                >
                                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </motion.button>
                            </div>
                            
                            <form onSubmit={handleFileUpload} className="space-y-4 md:space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Document Type *
                                    </label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={uploadForm.document_type}
                                            onChange={(e) => handleInputChange('document_type', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 appearance-none bg-white pr-10 cursor-pointer"
                                        >
                                            <option value="">Select Document Type</option>
                                            {documentTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Document File *
                                    </label>
                                    <motion.div
                                        className={`border-2 border-dashed rounded-xl p-4 md:p-6 text-center transition-all duration-200 cursor-pointer ${
                                            dragActive 
                                                ? 'border-indigo-400 bg-indigo-50' 
                                                : 'border-gray-300 hover:border-indigo-300'
                                        }`}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        onClick={() => document.getElementById('file-input').click()}
                                    >
                                        <input
                                            id="file-input"
                                            type="file"
                                            required
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                                        />
                                        <div className="space-y-2 md:space-y-3">
                                            <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto">
                                                <svg className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {uploadForm.document_file ? uploadForm.document_file.name : 'Click to upload or drag and drop'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    PDF, Word, Images, Text files (Max 10MB)
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        value={uploadForm.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        rows="3"
                                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                        placeholder="Add any notes or description about this document..."
                                    />
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
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
                                        className="px-4 py-2 md:px-6 md:py-3 text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="submit"
                                        disabled={uploading || !uploadForm.document_file || !uploadForm.document_type}
                                        className="px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl disabled:hover:shadow-lg"
                                    >
                                        {uploading ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Uploading...</span>
                                            </div>
                                        ) : (
                                            'Upload Document'
                                        )}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Layout>
    )
}

export default Documents