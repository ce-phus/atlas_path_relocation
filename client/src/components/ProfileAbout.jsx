import React from 'react'
import { motion } from 'framer-motion'

const ProfileAbout = ({ profile }) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

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
  }

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    hover: {
      y: -5,
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  }

  const statVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    },
    hover: {
      scale: 1.1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-white to-gray-50/80 shadow-xl rounded-2xl p-8 border border-gray-100/60 backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-4xl font-light tracking-tight text-center mb-6 bg-gradient-to-r from-gray-800 to-indigo-600 bg-clip-text text-transparent inline-block [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
            Profile Overview
          </h2>
          <p className="text-sm text-gray-500 mt-1">Complete personal and relocation information</p>
        </div>
        
        {/* Status Badge */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-medium shadow-lg"
        >
          Active Profile
        </motion.div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Personal Information Card */}
        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className="bg-white/80 rounded-2xl p-6 border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
          </div>
          
          <motion.dl variants={containerVariants} className="space-y-4">
            {[
              {
                icon: (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ),
                label: 'Full Name',
                value: profile?.full_name || 'Not set',
                color: 'blue'
              },
              {
                icon: (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
                label: 'Email',
                value: profile?.email,
                color: 'purple'
              },
              {
                icon: (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                ),
                label: 'Phone',
                value: profile?.phone_number || 'Not set',
                color: 'green'
              },
              {
                icon: (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                label: 'Country',
                value: profile?.country || 'Not set',
                color: 'orange'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50/50 transition-colors duration-200"
              >
                <div className={`w-8 h-8 bg-${item.color}-50 rounded-lg flex items-center justify-center flex-shrink-0`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <dt className="text-sm font-medium text-gray-500">{item.label}</dt>
                  <dd className="text-base font-semibold text-gray-900 truncate">{item.value}</dd>
                </div>
              </motion.div>
            ))}
          </motion.dl>
        </motion.div>

        {/* Relocation Details Card */}
        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className="bg-white/80 rounded-2xl p-6 border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Relocation Details</h3>
          </div>
          
          <motion.dl variants={containerVariants} className="space-y-4">
            {[
              {
                icon: (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                label: 'Relocation Type',
                value: profile?.relocation_type ? profile.relocation_type.replace('_', ' ') : 'Not set',
                color: 'indigo'
              },
              {
                icon: (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                label: 'Current Location',
                value: profile?.current_city && profile?.current_country 
                  ? `${profile.current_city}, ${profile.current_country}`
                  : 'Not set',
                color: 'teal'
              },
              {
                icon: (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                label: 'Destination',
                value: profile?.destination_city && profile?.destination_country 
                  ? `${profile.destination_city}, ${profile.destination_country}`
                  : 'Not set',
                color: 'purple'
              },
              {
                icon: (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
                label: 'Expected Move Date',
                value: profile?.expected_move_date 
                  ? new Date(profile.expected_move_date).toLocaleDateString()
                  : 'Not set',
                color: 'pink'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50/50 transition-colors duration-200"
              >
                <div className={`w-8 h-8 bg-${item.color}-50 rounded-lg flex items-center justify-center flex-shrink-0`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <dt className="text-sm font-medium text-gray-500">{item.label}</dt>
                  <dd className="text-base font-semibold text-gray-900 truncate">{item.value}</dd>
                </div>
              </motion.div>
            ))}
          </motion.dl>
        </motion.div>
      </motion.div>

      {/* Family Information Section */}
      {profile?.family_members && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 pt-8 border-t border-gray-200/60"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Family Information</h3>
          </div>
          
          <div className="flex flex-wrap gap-6">
            <motion.div
              variants={statVariants}
              whileHover="hover"
              className="bg-white/80 rounded-2xl p-6 border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300 text-center min-w-[140px]"
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {profile.family_members}
              </div>
              <div className="text-sm text-gray-500 mt-2">Family Members</div>
            </motion.div>

            {profile.has_children && (
              <motion.div
                variants={statVariants}
                whileHover="hover"
                className="bg-white/80 rounded-2xl p-6 border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300 text-center min-w-[140px]"
              >
                <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {profile.children_ages?.length || 'Yes'}
                </div>
                <div className="text-sm text-gray-500 mt-2">Children</div>
                {profile.children_ages && profile.children_ages.length > 0 && (
                  <div className="text-xs text-gray-400 mt-1">
                    Ages: {profile.children_ages.join(', ')}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Additional Information */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 pt-6 border-t border-gray-200/60"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="text-sm">
            <div className="font-semibold text-gray-900">Profile Created</div>
            <div className="text-gray-500">
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
            </div>
          </div>
          <div className="text-sm">
            <div className="font-semibold text-gray-900">Last Updated</div>
            <div className="text-gray-500">
              {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'N/A'}
            </div>
          </div>
          <div className="text-sm">
            <div className="font-semibold text-gray-900">Profile Status</div>
            <div className="text-green-600 font-medium">✓ Complete</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ProfileAbout