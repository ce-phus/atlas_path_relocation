import React from 'react'

const ProfileHeader = ({ profile }) => {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4">
          <div className="flex md:flex-row flex-col items-center space-x-6">
              <div className="flex-shrink-0">
                  {profile?.profile_photo ? (
                      <img
                          className="h-20 w-20 rounded-full object-cover"
                          src={profile.profile_photo}
                          alt={`${profile.full_name}'s profile`}
                      />
                  ) : (
                      <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-2xl font-semibold text-blue-600">
                              {profile?.full_name?.charAt(0) || 'U'}
                          </span>
                      </div>
                  )}
              </div>
              <div className="flex-1 min-w-0 ">
                  <h1 className="text-2xl font-bold text-gray-900 truncate">
                      {profile?.full_name}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                      {profile?.email}
                  </p>
                  <div className="flex items-center mt-2 space-x-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {profile?.relocation_type?.replace('_', ' ') || 'No relocation type set'}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {profile?.overall_progress}% Complete
                      </span>
                  </div>
              </div>
              <div className="text-right">
                  <p className="text-sm text-gray-500">Current Stage</p>
                  <p className="text-lg font-semibold text-gray-900">
                      {profile?.current_stage || 'Not Started'}
                  </p>
              </div>
          </div>
      </div>
    </div>
  )
}

export default ProfileHeader