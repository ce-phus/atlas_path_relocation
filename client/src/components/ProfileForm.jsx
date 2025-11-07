import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../actions/profileActions';
import { motion, AnimatePresence } from 'framer-motion';

const ProfileForm = () => {
  const dispatch = useDispatch();
  const { profile, loading, error, success } = useSelector((state) => state.profileReducer);

  const [formData, setFormData] = useState({
    phone_number: profile?.phone_number || '',
    date_of_birth: profile?.date_of_birth || '',
    country: profile?.country || 'KE',
    relocation_type: profile?.relocation_type || '',
    current_country: profile?.current_country || '',
    current_city: profile?.current_city || '',
    destination_country: profile?.destination_country || '',
    destination_city: profile?.destination_city || '',
    expected_relocation_date: profile?.expected_relocation_date || '',
    family_members: profile?.family_members || '',
    has_children: profile?.has_children || false,
    housing_budget_min: profile?.housing_budget_min || '',
    housing_budget_max: profile?.housing_budget_max || '',
    preferred_contact_method: profile?.preferred_contact_method || 'email'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getChangedFields = (original, updated) => {
    const changed = {};
    for (const key in updated) {
      if (updated[key] !== original[key]) {
        changed[key] = updated[key];
      }
    }
    return changed;
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    const changes = getChangedFields(profile, formData);
    if (Object.keys(changes).length === 0) {
      alert('No changes made to the profile.');
      return;
    }
    dispatch(updateProfile(changes, profile.id));
  };

  React.useEffect(() => {
    if (success) {
        const timer = setTimeout(() => {
        }, 3000);
        return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

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
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-white to-gray-50/80 shadow-xl rounded-2xl border border-gray-100/60 backdrop-blur-sm overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-indigo-50/30 px-8 py-6 border-b border-gray-200/60">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h2 className="ttext-2xl sm:text-4xl font-light tracking-tight text-center bg-gradient-to-r from-gray-800 to-indigo-600 bg-clip-text text-transparent inline-block [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
              Edit Profile
            </h2>
            <p className="text-sm text-gray-500 mt-1">Update your personal and relocation information</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* Status Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-2xl shadow-lg flex items-center space-x-3"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Profile updated successfully!</span>
            </motion.div>
          )}
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-4 rounded-2xl shadow-lg flex items-center space-x-3"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 xl:grid-cols-2 gap-8"
        >
          {/* Personal Information Card */}
          <motion.div
            variants={cardVariants}
            className="bg-white/80 rounded-2xl p-6 border border-gray-200/60 shadow-sm"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            </div>

            <motion.div variants={containerVariants} className="space-y-4">
              {[
                {
                  label: 'Phone Number',
                  name: 'phone_number',
                  type: 'tel',
                  icon: '📱',
                  placeholder: '+254 700 000 000'
                },
                {
                  label: 'Date of Birth',
                  name: 'date_of_birth',
                  type: 'date',
                  icon: '📅'
                },
                {
                  label: 'Country',
                  name: 'country',
                  type: 'select',
                  icon: '🌍',
                  options: [
                    { value: 'KE', label: 'Kenya' },
                    { value: 'US', label: 'United States' },
                    { value: 'UK', label: 'United Kingdom' },
                    { value: 'CA', label: 'Canada' },
                    { value: 'AU', label: 'Australia' }
                  ]
                }
              ].map((field, index) => (
                <motion.div key={index} variants={itemVariants} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center space-x-2">
                    <span>{field.icon}</span>
                    <span>{field.label}</span>
                  </label>
                  {field.type === 'select' ? (
                    <div className="relative">
                      <select
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 appearance-none bg-white pr-10"
                      >
                        {field.options.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-black"
                    />
                  )}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Relocation Details Card */}
          <motion.div
            variants={cardVariants}
            className="bg-white/80 rounded-2xl p-6 border border-gray-200/60 shadow-sm"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Relocation Details</h3>
            </div>

            <motion.div variants={containerVariants} className="space-y-4">
              {/* Relocation Type */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">🏠 Relocation Type</label>
                <select
                  name="relocation_type"
                  value={formData.relocation_type}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black transition-all duration-200"
                >
                  <option value="">Select Type</option>
                  <option value="corporate_law">Corporate Relocation</option>
                  <option value="international">International Relocation</option>
                  <option value="domestic">Domestic Relocation</option>
                  <option value="family">Family Relocation</option>
                </select>
              </motion.div>

              {/* Current Location */}
              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">📍 Current Country</label>
                  <input
                    type="text"
                    name="current_country"
                    value={formData.current_country}
                    onChange={handleChange}
                    placeholder="Country"
                    className="w-full p-3 border border-gray-300 text-black rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">🏙️ Current City</label>
                  <input
                    type="text"
                    name="current_city"
                    value={formData.current_city}
                    onChange={handleChange}
                    placeholder="City"
                    className="w-full p-3 border border-gray-300 text-black rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  />
                </div>
              </motion.div>

              {/* Destination */}
              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">🎯 Destination Country</label>
                  <input
                    type="text"
                    name="destination_country"
                    value={formData.destination_country}
                    onChange={handleChange}
                    placeholder="Country"
                    className="w-full p-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">🏙️ Destination City</label>
                  <input
                    type="text"
                    name="destination_city"
                    value={formData.destination_city}
                    onChange={handleChange}
                    placeholder="City"
                    className="w-full p-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  />
                </div>
              </motion.div>

              {/* Relocation Date */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">📅 Expected Relocation Date</label>
                <input
                  type="date"
                  name="expected_relocation_date"
                  value={formData.expected_relocation_date}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Family Information Card */}
          <motion.div
            variants={cardVariants}
            className="bg-white/80 rounded-2xl p-6 border border-gray-200/60 shadow-sm"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Family Information</h3>
            </div>

            <motion.div variants={containerVariants} className="space-y-4">
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">👨‍👩‍👧‍👦 Number of Family Members</label>
                <input
                  type="number"
                  name="family_members"
                  value={formData.family_members}
                  onChange={handleChange}
                  min="1"
                  placeholder="Including yourself"
                  className="w-full p-3 border border-gray-300 text-black rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  name="has_children"
                  checked={formData.has_children}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 bg-white border-gray-300 rounded focus:ring-indigo-500 cursor-pointer transition-all duration-200"
                />
                <label className="text-sm font-medium text-gray-700">
                  👶 Has Children
                </label>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Housing & Contact Card */}
          <motion.div
            variants={cardVariants}
            className="bg-white/80 rounded-2xl p-6 border border-gray-200/60 shadow-sm"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Housing & Contact</h3>
            </div>

            <motion.div variants={containerVariants} className="space-y-4">
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700 mb-2">💰 Housing Budget (USD)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500">Minimum</label>
                    <input
                      type="number"
                      name="housing_budget_min"
                      value={formData.housing_budget_min}
                      onChange={handleChange}
                      placeholder="Min"
                      className="w-full p-3 border border-gray-300 text-black rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500">Maximum</label>
                    <input
                      type="number"
                      name="housing_budget_max"
                      value={formData.housing_budget_max}
                      onChange={handleChange}
                      placeholder="Max"
                      className="w-full p-3 border border-gray-300 text-black rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">📞 Preferred Contact Method</label>
                <select
                  name="preferred_contact_method"
                  value={formData.preferred_contact_method}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                >
                  <option value="email">📧 Email</option>
                  <option value="phone">📱 Phone</option>
                  <option value="whatsapp">💬 WhatsApp</option>
                </select>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-end space-x-4 pt-6 border-t border-gray-200/60"
        >
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={!loading ? { scale: 1.05 } : {}}
            whileTap={!loading ? { scale: 0.95 } : {}}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center cursor-pointer space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Updating...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Update Profile</span>
              </>
            )}
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  )
}

export default ProfileForm