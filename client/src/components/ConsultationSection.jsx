import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { assignConsultant, loadAvailableConsultants } from '../actions/profileActions';

const ConsultationSection = ({ profile, expanded = false }) => {
    const dispatch = useDispatch();
    const { consultants, loading } = useSelector(state => state.profileReducer);
    console.log("Consultants: ", consultants)
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedConsultant, setSelectedConsultant] = useState('');

    const handleAssignConsultant = () => {
        if (selectedConsultant) {
            console.log("Assigning Consultant ID: ", selectedConsultant);
            dispatch(assignConsultant(selectedConsultant));
            setShowAssignModal(false);
            setSelectedConsultant('');
        }
    };

    const loadConsultants = () => {
        dispatch(loadAvailableConsultants());
        setShowAssignModal(true);
    };

    // Generate gradient based on consultant name for consistent colors
    const getConsultantGradient = (name) => {
        const colors = [
            'from-indigo-500 to-purple-600',
            'from-blue-500 to-cyan-600',
            'from-emerald-500 to-teal-600',
            'from-amber-500 to-orange-600',
            'from-rose-500 to-pink-600'
        ];
        const index = name?.length % colors.length || 0;
        return colors[index];
    };

    return (
        <div className="bg-gradient-to-br from-white to-gray-50/80 shadow-xl rounded-2xl p-8 border border-gray-100/60 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-8">
                
                {!profile?.relocation_consultant && (
                    <button
                        onClick={loadConsultants}
                        className="group relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-purple-700 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                        <span className="relative z-10">Assign Consultant</span>
                        <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                )}
            </div>

            {profile?.relocation_consultant ? (
                <div className="space-y-8">
                    {/* Consultant Header Card */}
                    <div className="bg-gradient-to-r from-slate-50 to-indigo-50/30 rounded-2xl p-6 border border-indigo-100/50 shadow-sm">
                        <div className="flex items-center space-x-6">
                            <div className={`relative w-20 h-20 bg-gradient-to-br ${getConsultantGradient(profile.consultant_name)} rounded-2xl flex items-center justify-center shadow-lg`}>
                                <span className="text-2xl font-bold text-white">
                                    {profile.consultant_name?.charAt(0) || 'C'}
                                </span>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3 mb-2">
                                    <h3 className="text-2xl font-bold text-gray-900 truncate">
                                        {profile.consultant_name}
                                    </h3>
                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full capitalize">
                                        {profile.consultant_details?.specialization?.replace('_', ' ')}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 font-medium">
                                    {profile.consultant_employee_id} • {profile.consultant_details?.years_experience} years experience
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Atlas Path Consultant
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
    <div className="bg-white/80 rounded-xl p-3 md:p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm text-gray-500 truncate">Experience</p>
                <p className="font-semibold text-gray-900 text-sm md:text-base truncate">{profile.consultant_details?.years_experience} years</p>
            </div>
        </div>
    </div>

    <div className="bg-white/80 rounded-xl p-3 md:p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm text-gray-500 truncate">Status</p>
                <p className={`font-semibold capitalize text-sm md:text-base truncate ${
                    profile.consultant_details?.availability_status === 'available' 
                        ? 'text-green-600' 
                        : 'text-amber-600'
                }`}>
                    {profile.consultant_details?.availability_status}
                </p>
            </div>
        </div>
    </div>

    <div className="bg-white/80 rounded-xl p-3 md:p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm text-gray-500 truncate">Phone</p>
                <p className="font-semibold text-gray-900 text-sm md:text-base truncate">{profile.consultant_details?.work_phone}</p>
            </div>
        </div>
    </div>

    <div className="bg-white/80 rounded-xl p-3 md:p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm text-gray-500 truncate">Email</p>
                <p className="font-semibold text-gray-900 text-sm md:text-base truncate">{profile.consultant_details?.work_email}</p>
            </div>
        </div>
    </div>
</div>

                    {expanded && profile.consultant_details?.bio && (
                        <div className="bg-white/80 rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                About Consultant
                            </h4>
                            <p className="text-gray-600 leading-relaxed">{profile.consultant_details.bio}</p>
                        </div>
                    )}

                    {expanded && (
                        <div className="pt-6 border-t border-gray-200/60 flex space-x-4">
                            <button className="group flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span>Send Message</span>
                            </button>
                            <button className="group flex-1 bg-white text-gray-700 px-6 py-3 rounded-xl font-medium border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-all duration-300 flex items-center justify-center space-x-2">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>Schedule Meeting</span>
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="relative inline-block mb-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center animate-pulse">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Consultant Assigned</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-2">
                        You don't have a relocation consultant yet. A dedicated consultant will help guide you through every step of your relocation process.
                    </p>
                    <p className="text-sm text-gray-400 mb-6">
                        Get personalized assistance with housing, legal matters, and settling in
                    </p>
                    <button
                        onClick={loadConsultants}
                        className="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 inline-flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span>Find Your Consultant</span>
                    </button>
                </div>
            )}

            {showAssignModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl transform transition-all duration-300 scale-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Choose Your Consultant</h3>
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors duration-200"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        {loading ? (
                            <div className="animate-pulse space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
                                ))}
                            </div>
                        ) : consultants.length > 0 ? (
                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                {consultants.map(consultant => (
                                    <button
                                        key={consultant.id}
                                        className={`p-4 border-2 rounded-xl cursor-pointer w-full transition-all duration-300 ${
                                            selectedConsultant === consultant.id
                                                ? 'border-indigo-500 bg-indigo-50/50 shadow-md scale-[1.02]'
                                                : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50/50 hover:shadow-sm'
                                        }`}
                                        onClick={() => setSelectedConsultant(consultant.id)}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-12 h-12 bg-gradient-to-br ${getConsultantGradient(consultant.full_name)} rounded-xl flex items-center justify-center shadow-md`}>
                                                <span className="text-lg font-semibold text-white">
                                                    {consultant.full_name?.charAt(0) || 'C'}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0 text-left">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <h4 className="text-base font-semibold text-gray-900 truncate">
                                                        {consultant.full_name}
                                                    </h4>
                                                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full capitalize">
                                                        {consultant.specialization?.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    {consultant.years_experience} years experience • {consultant.country}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1 truncate">
                                                    {consultant.work_email}
                                                </p>
                                            </div>
                                            {selectedConsultant === consultant.id && (
                                                <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 font-medium">No available consultants found</p>
                                <p className="text-sm text-gray-400 mt-1">Please try again later</p>
                            </div>
                        )}

                        <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className="px-6 py-2.5 text-sm text-gray-700 hover:text-gray-900 cursor-pointer transition-colors duration-200 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssignConsultant}
                                disabled={!selectedConsultant}
                                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl disabled:hover:shadow-lg"
                            >
                                Assign Consultant
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConsultationSection;