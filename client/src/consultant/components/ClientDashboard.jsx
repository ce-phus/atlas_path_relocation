import React, { useState } from 'react'
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ClientDashboard = ({ stats_data }) => {
    const { clients_data } = useSelector((state) => state.fetchConsultantClientReducer);
    const clients = clients_data?.clients || [];
    const summary = clients_data?.summary || {};
    const navigate = useNavigate();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [progressFilter, setProgressFilter] = useState('');

    console.log("Stats data: ", stats_data);
    console.log("Clients data: ", clients_data);

    // Filter clients based on search and progress
    const filteredClients = clients.filter(client => {
        const matchesSearch = searchTerm === '' || 
            client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.current_city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.destination_city?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesProgress = progressFilter === '' || 
            (progressFilter === 'high' && client.overall_progress >= 75) ||
            (progressFilter === 'medium' && client.overall_progress >= 25 && client.overall_progress < 75) ||
            (progressFilter === 'low' && client.overall_progress < 25);
        
        return matchesSearch && matchesProgress;
    });

    const getProgressColor = (progress) => {
        if (progress >= 75) return 'text-green-600 bg-green-100';
        if (progress >= 50) return 'text-blue-600 bg-blue-100';
        if (progress >= 25) return 'text-amber-600 bg-amber-100';
        return 'text-red-600 bg-red-100';
    };

    const getRelocationTypeColor = (type) => {
        const colors = {
            'corporate_law': 'bg-purple-100 text-purple-800',
            'international': 'bg-blue-100 text-blue-800',
            'domestic': 'bg-green-100 text-green-800',
            'family': 'bg-amber-100 text-amber-800',
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    const getProgressDistribution = () => {
        if (!stats_data?.progress_distribution) return [];
        return [
            { label: '0-25%', value: stats_data.progress_distribution['0-25%'] || 0, color: 'bg-red-500' },
            { label: '26-50%', value: stats_data.progress_distribution['26-50%'] || 0, color: 'bg-amber-500' },
            { label: '51-75%', value: stats_data.progress_distribution['51-75%'] || 0, color: 'bg-blue-500' },
            { label: '76-100%', value: stats_data.progress_distribution['76-100%'] || 0, color: 'bg-green-500' }
        ];
    };

    const progressDistribution = getProgressDistribution();

    const handleClientDetailsRoute = (client) => {
        navigate(`/client/${client.id}`);
    }

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >   
                    <div className='flex justify-center flex-col items-center pt-10'>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            My Clients
                        </h1>
                        <p className="text-gray-600 text-center max-w-2xl">
                            Manage and track all your assigned relocation clients with real-time progress updates and comprehensive analytics
                        </p>
                    </div>
                </motion.div>

                {/* Stats Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
                >
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-indigo-600">
                                    {summary.total_clients || 0}
                                </div>
                                <div className="text-sm text-gray-500">Total Clients</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">
                                    {summary.average_progress || 0}%
                                </div>
                                <div className="text-sm text-gray-500">Average Progress</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {summary.high_progress_clients || 0}
                                </div>
                                <div className="text-sm text-gray-500">High Progress</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-purple-600">
                                    {summary.consultant_capacity || '0/10'}
                                </div>
                                <div className="text-sm text-gray-500">Capacity Used</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Analytics Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
                >
                    {/* Progress Distribution */}
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Distribution</h3>
                        <div className="space-y-4">
                            {progressDistribution.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div 
                                                className={`h-2 rounded-full ${item.color}`}
                                                style={{ 
                                                    width: `${summary.total_clients ? (item.value / summary.total_clients) * 100 : 0}%` 
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium text-gray-900 w-8">
                                            {item.value}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Task Completion Rate</span>
                                <span className="text-lg font-semibold text-green-600">
                                    {stats_data?.task_completion_rate || 0}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Total Tasks</span>
                                <span className="text-lg font-semibold text-blue-600">
                                    {stats_data?.total_tasks || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Completed Tasks</span>
                                <span className="text-lg font-semibold text-purple-600">
                                    {stats_data?.completed_tasks || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Search and Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
                >
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search clients by name, email, or location..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full text-black pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                        <select
                            value={progressFilter}
                            onChange={(e) => setProgressFilter(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-black focus:border-indigo-500"
                        >
                            <option value="">All Progress Levels</option>
                            <option value="high">High Progress (75%+)</option>
                            <option value="medium">Medium Progress (25-74%)</option>
                            <option value="low">Low Progress (0-24%)</option>
                        </select>
                    </div>
                </motion.div>

                {/* Clients List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-6"
                >
                    {filteredClients.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center">
                            <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {searchTerm || progressFilter ? 'No Clients Found' : 'No Clients Assigned'}
                            </h3>
                            <p className="text-gray-600 max-w-md mx-auto">
                                {searchTerm || progressFilter 
                                    ? 'Try adjusting your search criteria to find matching clients.' 
                                    : 'You currently have no clients assigned. New client assignments will appear here automatically.'
                                }
                            </p>
                        </div>
                    ) : (
                        filteredClients.map((client, index) => (
                            <motion.div
                                key={client.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                    {/* Client Info */}
                                    <div className="flex-1">
                                        <div className="flex items-start space-x-4 mb-4">
                                            {client.profile_photo ? (
                                                <img
                                                    src={client.profile_photo}
                                                    alt={client.full_name}
                                                    className="w-16 h-16 rounded-2xl object-cover"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white font-semibold text-lg">
                                                        {client.full_name?.charAt(0) || 'C'}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 gap-2 mb-2">
                                                    <h3 className="text-xl font-semibold text-gray-900 truncate">
                                                        {client.full_name}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getProgressColor(client.overall_progress)}`}>
                                                            {client.overall_progress}% Complete
                                                        </span>
                                                        {client.relocation_type && (
                                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRelocationTypeColor(client.relocation_type)}`}>
                                                                {client.relocation_type.replace('_', ' ')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 mb-2">{client.email}</p>
                                                <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                                                    {client.phone_number && (
                                                        <span className="flex items-center">
                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                            </svg>
                                                            {client.phone_number}
                                                        </span>
                                                    )}
                                                    {(client.current_city || client.destination_city) && (
                                                        <span className="flex items-center">
                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            {client.current_city || 'Unknown'} → {client.destination_city || 'Unknown'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress and Stats */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <div className="text-sm text-gray-500">Progress</div>
                                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getProgressColor(client.overall_progress)}`}>
                                                    {client.overall_progress}%
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500">Tasks</div>
                                                <div className="text-lg font-semibold text-gray-900">
                                                    {client.tasks?.filter(t => t.is_completed).length || 0}/{client.tasks?.length || 0}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500">Documents</div>
                                                <div className="text-lg font-semibold text-gray-900">
                                                    {client.documents?.length || 0}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500">Stage</div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {client.current_stage || 'Not started'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col space-y-3 lg:items-end">
                                        <button 
                                        onClick={() => handleClientDetailsRoute(client)}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium cursor-pointer">
                                            View Details
                                        </button>
                                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium">
                                            Send Message
                                        </button>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-4">
                                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                                        <span>Relocation Progress</span>
                                        <span>{client.overall_progress}% Complete</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-500 ${
                                                client.overall_progress >= 75 ? 'bg-green-500' :
                                                client.overall_progress >= 50 ? 'bg-blue-500' :
                                                client.overall_progress >= 25 ? 'bg-amber-500' : 'bg-red-500'
                                            }`}
                                            style={{ width: `${client.overall_progress}%` }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </motion.div>
            </div>
        </div>
    )
}

export default ClientDashboard