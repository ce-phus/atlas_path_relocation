import React, { useState, useEffect } from 'react'
import { CLayout } from '../components'
import { updateProfile } from '../../actions/profileActions';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';

const EditCprofile = () => {
    const dispatch = useDispatch();
    const { profile, loading, error, success } = useSelector((state) => state.getProfileReducer);
    console.log("error", error);
    console.log("Profile", profile)
    
    const [formData, setFormData] = useState({
        specialization: '',
        country: '',
        years_experience: '',
        bio: '',
        expertise: '',
        is_active: true,
        max_clients: '',
        availability_status: '',
        work_email: '',
        work_phone: ''
    });

    const [expertiseInput, setExpertiseInput] = useState('');
    const [expertiseList, setExpertiseList] = useState([]);

    // Initialize form data when profile loads
    useEffect(() => {
        if (profile) {
            setFormData({
                specialization: profile.specialization || '',
                country: profile.country || 'KE',
                years_experience: profile.years_experience || '',
                bio: profile.bio || '',
                expertise: profile.expertise || '',
                is_active: profile.is_active !== undefined ? profile.is_active : true,
                max_clients: profile.max_clients || '',
                availability_status: profile.availability_status || 'available',
                work_email: profile.work_email || '',
                work_phone: profile.work_phone || ''
            });

            // Initialize expertise list
            if (profile.expertise && Array.isArray(profile.expertise)) {
                setExpertiseList(profile.expertise);
            }
        }
    }, [profile]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddExpertise = () => {
        if (expertiseInput.trim() && !expertiseList.includes(expertiseInput.trim())) {
            const newExpertiseList = [...expertiseList, expertiseInput.trim()];
            setExpertiseList(newExpertiseList);
            setFormData(prev => ({
                ...prev,
                expertise: newExpertiseList
            }));
            setExpertiseInput('');
        }
    };

    const handleRemoveExpertise = (index) => {
        const newExpertiseList = expertiseList.filter((_, i) => i !== index);
        setExpertiseList(newExpertiseList);
        setFormData(prev => ({
            ...prev,
            expertise: newExpertiseList
        }));
    };

    const handleExpertiseKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddExpertise();
        }
    };

    const getChangedFields = (original, updated) => {
        const changes = {};
        Object.keys(updated).forEach(key => {
            if (JSON.stringify(original[key]) !== JSON.stringify(updated[key])) {
                changes[key] = updated[key];
            }
        });
        return changes;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!profile) {
            alert('Profile data not loaded yet.');
            return;
        }

        const changes = getChangedFields(profile, formData);
        if (Object.keys(changes).length === 0) {
            alert('No changes made to the profile.');
            return;
        }
        
        dispatch(updateProfile(changes, profile.id));
    };

    const specializationOptions = [
        { value: 'corporate_law', label: 'Corporate Relocation' },
        { value: 'international', label: 'International Relocation' },
        { value: 'domestic', label: 'Domestic Relocation' },
        { value: 'family', label: 'Family Relocation' }
    ];

    const availabilityOptions = [
        { value: 'available', label: 'Available' },
        { value: 'busy', label: 'Busy' },
        { value: 'unavailable', label: 'Unavailable' }
    ];

    const countryOptions = [
        { value: 'KE', label: 'Kenya' },
        { value: 'UG', label: 'Uganda' },
        { value: 'TZ', label: 'Tanzania' },
        { value: 'RW', label: 'Rwanda' },
        { value: 'ZA', label: 'South Africa' },
        { value: 'NG', label: 'Nigeria' },
        { value: 'GH', label: 'Ghana' }
    ];

    if (loading && !profile) {
        return (
            <CLayout>
                <div className="min-h-screen bg-gray-50 py-8 pt-20">
                    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="animate-pulse space-y-8">
                            <div className="h-8 bg-gray-200 rounded w-64 mx-auto"></div>
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="bg-white rounded-2xl p-6 h-20"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </CLayout>
        );
    }

    return (
        <CLayout>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8"
                    >
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Edit Consultant Profile
                        </h1>
                        <p className="text-gray-600">
                            Update your professional information and preferences
                        </p>
                    </motion.div>

                    {/* Success Message */}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-2xl mb-6"
                        >
                            Profile updated successfully!
                        </motion.div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl mb-6"
                        >
                            Error: {error}
                        </motion.div>
                    )}

                    {/* Edit Form */}
                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Specialization */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Specialization *
                                    </label>
                                    <select
                                        name="specialization"
                                        value={formData.specialization}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-black focus:border-indigo-500"
                                    >
                                        <option value="">Select Specialization</option>
                                        {specializationOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Country */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Country *
                                    </label>
                                    <select
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 text-black py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        {countryOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Years of Experience */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Years of Experience
                                    </label>
                                    <input
                                        type="number"
                                        name="years_experience"
                                        value={formData.years_experience}
                                        onChange={handleChange}
                                        min="0"
                                        max="50"
                                        className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Enter years of experience"
                                    />
                                </div>

                                {/* Max Clients */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Maximum Clients
                                    </label>
                                    <input
                                        type="number"
                                        name="max_clients"
                                        value={formData.max_clients}
                                        onChange={handleChange}
                                        min="1"
                                        max="50"
                                        className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Maximum number of clients"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Work Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Work Email
                                    </label>
                                    <input
                                        type="email"
                                        name="work_email"
                                        value={formData.work_email}
                                        onChange={handleChange}
                                        className="w-full px-3 text-black placeholder-gray-500 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="work@company.com"
                                    />
                                </div>

                                {/* Work Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Work Phone
                                    </label>
                                    <input
                                        type="tel"
                                        name="work_phone"
                                        value={formData.work_phone}
                                        onChange={handleChange}
                                        className="w-full placeholder-gray-500 text-black  px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="+254700000000"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Professional Details */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h3>
                            
                            {/* Bio */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Professional Bio
                                </label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full px-3 placeholder-gray-500 text-black py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Describe your professional background, expertise, and approach to relocation consulting..."
                                />
                            </div>

                            {/* Expertise */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Areas of Expertise
                                </label>
                                <div className="flex space-x-2 mb-3">
                                    <input
                                        type="text"
                                        value={expertiseInput}
                                        onChange={(e) => setExpertiseInput(e.target.value)}
                                        onKeyPress={handleExpertiseKeyPress}
                                        className="flex-1 px-3 placeholder-gray-500 text-black py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Add an area of expertise"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddExpertise}
                                        className="px-4 py-2 bg-gray-600 text-white rounded-lg cursor-pointer hover:bg-gray-700 transition-colors duration-200"
                                    >
                                        Add
                                    </button>
                                </div>
                                
                                {/* Expertise Tags */}
                                <div className="flex flex-wrap gap-2">
                                    {expertiseList.map((expertise, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                                        >
                                            {expertise}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveExpertise(index)}
                                                className="ml-2 text-indigo-600 hover:text-indigo-800"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                    {expertiseList.length === 0 && (
                                        <p className="text-gray-500 text-sm">No expertise areas added yet</p>
                                    )}
                                </div>
                            </div>

                            {/* Status Settings */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Availability Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Availability Status
                                    </label>
                                    <select
                                        name="availability_status"
                                        value={formData.availability_status}
                                        onChange={handleChange}
                                        className="w-full placeholder-gray-500 text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        {availabilityOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Active Status */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <label className="ml-2 text-sm font-medium text-gray-700">
                                        Active Consultant
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                {loading ? 'Updating...' : 'Update Profile'}
                            </button>
                            <button
                                type="button"
                                onClick={() => window.history.back()}
                                className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.form>
                </div>
            </div>
        </CLayout>
    )
}

export default EditCprofile