// components/ConsultationSection.jsx
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
            dispatch(assignConsultant(selectedConsultant));
            setShowAssignModal(false);
            setSelectedConsultant('');
        }
    };

    const loadConsultants = () => {
        dispatch(loadAvailableConsultants());
        setShowAssignModal(true);
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Your Consultant</h2>
                {!profile?.relocation_consultant && (
                    <button
                        onClick={loadConsultants}
                        className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700"
                    >
                        Assign Consultant
                    </button>
                )}
            </div>

            {profile?.relocation_consultant ? (
                <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-xl font-semibold text-indigo-600">
                                {profile.consultant_name?.charAt(0) || 'C'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {profile.consultant_name}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {profile.consultant_employee_id}
                            </p>
                            <p className="text-sm text-gray-600 capitalize">
                                {profile.consultant_details?.specialization?.replace('_', ' ')}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500">Experience:</span>
                            <p className="font-medium">{profile.consultant_details?.years_experience} years</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Status:</span>
                            <p className={`font-medium capitalize ${
                                profile.consultant_details?.availability_status === 'available' 
                                    ? 'text-green-600' 
                                    : 'text-yellow-600'
                            }`}>
                                {profile.consultant_details?.availability_status}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-500">Phone:</span>
                            <p className="font-medium">{profile.consultant_details?.work_phone}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Email:</span>
                            <p className="font-medium truncate">{profile.consultant_details?.work_email}</p>
                        </div>
                    </div>

                    {expanded && profile.consultant_details?.bio && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">About</h4>
                            <p className="text-sm text-gray-600">{profile.consultant_details.bio}</p>
                        </div>
                    )}

                    {expanded && (
                        <div className="pt-4 border-t border-gray-200">
                            <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                                Send Message
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <p className="text-gray-500">No consultant assigned yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                        A consultant will help guide you through your relocation process
                    </p>
                    <button
                        onClick={loadConsultants}
                        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700"
                    >
                        Find a Consultant
                    </button>
                </div>
            )}

            {showAssignModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Assign Consultant</h3>
                        
                        {loading ? (
                            <div className="animate-pulse space-y-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                                ))}
                            </div>
                        ) : consultants.length > 0 ? (
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                                {consultants.map(consultant => (
                                    <div
                                        key={consultant.id}
                                        className={`p-3 border rounded-lg cursor-pointer ${
                                            selectedConsultant === consultant.id
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-gray-200 hover:border-indigo-300'
                                        }`}
                                        onClick={() => setSelectedConsultant(consultant.id)}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-semibold text-indigo-600">
                                                    {consultant.full_name?.charAt(0) || 'C'}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                                    {consultant.full_name}
                                                </h4>
                                                <p className="text-xs text-gray-500 capitalize">
                                                    {consultant.specialization?.replace('_', ' ')} • {consultant.years_experience} years
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">No available consultants found</p>
                        )}

                        <div className="mt-4 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssignConsultant}
                                disabled={!selectedConsultant}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50"
                            >
                                Assign
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConsultationSection;