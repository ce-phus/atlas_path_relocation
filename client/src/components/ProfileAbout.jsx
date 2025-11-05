import React from 'react'

const ProfileAbout = ({ profile }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Personal Information</h3>
                    <dl className="space-y-2">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                            <dd className="text-sm text-gray-900">{profile?.full_name || 'Not set'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                            <dd className="text-sm text-gray-900">{profile?.email}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Phone</dt>
                            <dd className="text-sm text-gray-900">{profile?.phone_number || 'Not set'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Country</dt>
                            <dd className="text-sm text-gray-900">{profile?.country || 'Not set'}</dd>
                        </div>
                    </dl>
                </div>

                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Relocation Details</h3>
                    <dl className="space-y-2">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Relocation Type</dt>
                            <dd className="text-sm text-gray-900 capitalize">
                                {profile?.relocation_type?.replace('_', ' ') || 'Not set'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Current Location</dt>
                            <dd className="text-sm text-gray-900">
                                {profile?.current_city && profile?.current_country 
                                    ? `${profile.current_city}, ${profile.current_country}`
                                    : 'Not set'
                                }
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Destination</dt>
                            <dd className="text-sm text-gray-900">
                                {profile?.destination_city && profile?.destination_country 
                                    ? `${profile.destination_city}, ${profile.destination_country}`
                                    : 'Not set'
                                }
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Expected Move Date</dt>
                            <dd className="text-sm text-gray-900">
                                {profile?.expected_move_date 
                                    ? new Date(profile.expected_move_date).toLocaleDateString()
                                    : 'Not set'
                                }
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            {profile?.family_members && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Family Information</h3>
                    <div className="flex items-center space-x-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-indigo-600">{profile.family_members}</div>
                            <div className="text-sm text-gray-500">Family Members</div>
                        </div>
                        {profile.has_children && (
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {profile.children_ages?.length || 'Yes'}
                                </div>
                                <div className="text-sm text-gray-500">Children</div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
  )
}

export default ProfileAbout