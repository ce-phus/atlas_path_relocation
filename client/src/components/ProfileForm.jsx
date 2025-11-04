import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../actions/profileActions';
import EditLoader from './Skeletons/EditLoader';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateProfile(formData));
  };

  React.useEffect(() => {
    if (success) {
        const timer = setTimeout(() => {
            dispatch(resetProfileUpdate());
        }, 3000);
        return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  return (
    <div className='bg-white shadow rounded-lg'>
      <div className='px-6 py-4 border-b border-gray-200'>
        <h2 className='text-lg font-light text-gray-900'>
          Edit Profile Information
        </h2>
      </div>

      <form
      onSubmit={handleSubmit}
      className='p-6 space-y-6'
      >
        {success && (
          <div className='bg-green-100 text-green-800 p-3 rounded'>
            Profile updated successfully!
          </div>
        )}
        {error && (
          <div className='bg-red-100 text-red-800 p-3 rounded'>
            {error}
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-4'>
            <h3 className='text-black/80 fomt-medium'>Personal Information</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                  Phone Number
              </label>
              <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="mt-1 block w-full text-black border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                    Date of Birth
                </label>
                <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                  Country
              </label>
              <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                  <option value="KE">Kenya</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  {/* Add more countries as needed */}
              </select>
            </div> 
          </div>
          <div className='space-y-4'>
            <h3 className='text-black/80 fomt-medium'>Relocation Details</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                  Relocation Type
              </label>
              <select
                  name="relocation_type"
                  value={formData.relocation_type}
                  onChange={handleChange}
                  className="mt-1 block w-full text-black border border-gray-300 rounded-md shadow-sm p-2"
              >
                  <option value="">Select Type</option>
                  <option value="corporate_law">Corporate Relocation</option>
                  <option value="international">International Relocation</option>
                  <option value="domestic">Domestic Relocation</option>
                  <option value="family">Family Relocation</option>
              </select>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                    Current Country
                </label>
                <input
                    type="text"
                    name="current_country"
                    value={formData.current_country}
                    onChange={handleChange}
                    className="mt-1 block w-full text-black border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                    Current City
                </label>
                <input
                    type="text"
                    name="current_city"
                    value={formData.current_city}
                    onChange={handleChange}
                    className="mt-1 block w-full border text-black border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700">
                      Destination Country
                  </label>
                  <input
                      type="text"
                      name="destination_country"
                      value={formData.destination_country}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700">
                      Destination City
                  </label>
                  <input
                      type="text"
                      name="destination_city"
                      value={formData.destination_city}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                  Expected Relocation Date
              </label>
              <input
                  type="date"
                  name="expected_relocation_date"
                  value={formData.expected_relocation_date}
                  onChange={handleChange}
                  className="mt-1 block w-full text-black border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols2 gap-6'>
          <div className='space-y-4'>
            <h3 className='text-md text-gray-900 font-medium'>Family Information</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                  Number of Family Members
              </label>
              <input
                  type="number"
                  name="family_members"
                  value={formData.family_members}
                  onChange={handleChange}
                  min="1"
                  className="mt-1 block text-black w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div className="flex items-center">
              <input
                  type="checkbox"
                  name="has_children"
                  checked={formData.has_children}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 bg-white focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                  Has Children
              </label>
            </div>
          </div>

          <div className='space-y-4'>
            <h3 className='text-md text-gray-900 font-medium'>Housing Budget</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700">
                      Minimum Budget
                  </label>
                  <input
                      type="number"
                      name="housing_budget_min"
                      value={formData.housing_budget_min}
                      onChange={handleChange}
                      className="mt-1 block w-full text-black border border-gray-300 rounded-md shadow-sm p-2"
                  />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700">
                      Maximum Budget
                  </label>
                  <input
                      type="number"
                      name="housing_budget_max"
                      value={formData.housing_budget_max}
                      onChange={handleChange}
                      className="mt-1 block w-full text-black border border-gray-300 rounded-md shadow-sm p-2"
                  />
              </div>
            </div>
            <div className=''>
              <label className="block text-sm font-medium text-gray-700">
                  Preferred Contact Method
              </label>
              <select
                name="preferred_contact_method"
                value={formData.preferred_contact_method}
                onChange={handleChange}
                className="mt-1 block text-black w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
              Cancel
          </button>
          <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
              {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProfileForm