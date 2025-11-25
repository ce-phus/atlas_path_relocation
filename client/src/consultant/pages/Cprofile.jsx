import React from 'react'
import { CLayout } from '../components'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'

const Cprofile = () => {
  const { profile, loading, error } = useSelector((state) => state.getProfileReducer);
  console.log("cProfile: ", profile)
  
  // Extract consultant data from profile
  const consultant = profile || {};
  const user = profile || {};

  if (loading) {
    return (
      <CLayout>
        <div className="min-h-screen bg-gray-50 py-8 pt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-8">
              {/* Header Skeleton */}
              <div className="text-center space-y-4">
                <div className="h-10 bg-gray-200 rounded w-64 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
              </div>
              
              {/* Profile Card Skeleton */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
                  <div className="w-32 h-32 bg-gray-200 rounded-2xl"></div>
                  <div className="flex-1 space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="flex space-x-2">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-6 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CLayout>
    );
  }

  if (error) {
    return (
      <CLayout>
        <div className="min-h-screen bg-gray-50 py-8 pt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl text-center">
              <strong>Error loading profile:</strong> {error}
            </div>
          </div>
        </div>
      </CLayout>
    );
  }

  if (!consultant || Object.keys(consultant).length === 0) {
    return (
      <CLayout>
        <div className="min-h-screen bg-gray-50 py-8 pt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-2xl text-center">
              <p>Consultant profile not found or not configured.</p>
            </div>
          </div>
        </div>
      </CLayout>
    );
  }

  const getSpecializationColor = (specialization) => {
    const colors = {
      'corporate_law': 'bg-purple-100 text-purple-800',
      'international': 'bg-blue-100 text-blue-800',
      'domestic': 'bg-green-100 text-green-800',
      'family': 'bg-amber-100 text-amber-800',
    };
    return colors[specialization] || 'bg-gray-100 text-gray-800';
  };

  const getAvailabilityColor = (status) => {
    const colors = {
      'available': 'bg-green-100 text-green-800',
      'unavailable': 'bg-red-100 text-red-800',
      'busy': 'bg-amber-100 text-amber-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getAvailabilityIcon = (status) => {
    const icons = {
      'available': (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      'unavailable': (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
      'busy': (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      ),
    };
    return icons[status] || icons['unavailable'];
  };

  return (
    <CLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Consultant Profile
            </h1>
            <p className="text-gray-600">
              Manage your consultant profile and professional information
            </p>
          </motion.div>

          {/* Main Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8"
          >
            <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* Profile Photo/Avatar */}
              <div className="flex-shrink-0">
                {user.profile_photo ? (
                  <img
                    src={user.profile_photo}
                    alt={user.full_name}
                    className="w-32 h-32 rounded-2xl object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-2xl">
                      {user.full_name?.charAt(0) || 'C'}
                    </span>
                  </div>
                )}
              </div>

              {/* Profile Information */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {user.full_name || 'Consultant Name'}
                    </h2>
                    <p className="text-gray-600 mb-2">{user.email}</p>
                  </div>
                  <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getAvailabilityColor(consultant.availability_status)}`}>
                      {getAvailabilityIcon(consultant.availability_status)}
                      <span className="capitalize">{consultant.availability_status}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <span className="text-sm text-gray-500">Employee ID</span>
                    <p className="font-semibold text-gray-900">{consultant.employee_id}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Specialization</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSpecializationColor(consultant.specialization)}`}>
                      {consultant.specialization?.replace('_', ' ') || 'Not specified'}
                    </span>
                  </div>
                </div>

                {consultant.bio && (
                  <div className="mb-6">
                    <span className="text-sm text-gray-500 block mb-2">Bio</span>
                    <p className="text-gray-700 leading-relaxed">{consultant.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {/* Experience */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {consultant.years_experience || 0}
                  </div>
                  <div className="text-sm text-gray-500">Years Experience</div>
                </div>
              </div>
            </div>

            {/* Client Capacity */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {consultant.current_client_count || 0}/{consultant.max_clients || 10}
                  </div>
                  <div className="text-sm text-gray-500">Client Capacity</div>
                </div>
              </div>
            </div>

            {/* Country */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {consultant.country || 'KE'}
                  </div>
                  <div className="text-sm text-gray-500">Country</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Information & Expertise */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Contact Information */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Contact Information
              </h3>
              <div className="space-y-3">
                {consultant.work_phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Work Phone</span>
                    <span className="font-medium text-gray-900">{consultant.work_phone}</span>
                  </div>
                )}
                {consultant.work_email && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Work Email</span>
                    <span className="font-medium text-gray-900">{consultant.work_email}</span>
                  </div>
                )}
                {user.phone_number && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Personal Phone</span>
                    <span className="font-medium text-gray-900">{user.phone_number}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Areas of Expertise */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Areas of Expertise
              </h3>
              <div className="flex flex-wrap gap-2">
                {consultant.expertise && consultant.expertise.length > 0 ? (
                  consultant.expertise.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No expertise areas specified</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4"
          >
            <button className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors duration-200">
              Edit Profile
            </button>
            <button className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200">
              Update Availability
            </button>
          </motion.div>
        </div>
      </div>
    </CLayout>
  )
}

export default Cprofile