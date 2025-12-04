import React,{ useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CLayout, ViewDocs } from '../components'
import { loadProfile } from '../../actions/profileActions'
import { 
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, 
  FaCalendarAlt, FaHome, FaBaby, FaFileAlt,
  FaGlobe, FaCity, FaTasks, FaMoneyBill,
  FaUsers, FaUserTie, FaBuilding
} from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'

const ClientProfile = () => {
  const { profile, loading, error } = useSelector((state) => state.profileReducer);
  const [ docModal, setDocModal ] = useState(false);
  const dispatch = useDispatch();

  const toggleDocModal = () => {
    setDocModal(!docModal);
  }
  
  React.useEffect(() => {
    dispatch(loadProfile());
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return dateString;
    }
  };

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return 'Not specified';
    try {
      const birthDate = new Date(dob);
      const ageDiff = Date.now() - birthDate.getTime();
      const ageDate = new Date(ageDiff);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <CLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </CLayout>
    );
  }

  if (error) {
    return (
      <CLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">Error loading profile: {error}</p>
          </div>
        </div>
      </CLayout>
    );
  }

  if (!profile) {
    return (
      <CLayout>
        <div className="p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-700">No profile data available</p>
          </div>
        </div>
      </CLayout>
    );
  }

  const { 
    user,
    full_name,
    email,
    phone_number,
    country,
    current_city,
    current_country,
    destination_city,
    destination_country,
    date_of_birth,
    has_children,
    children_ages,
    family_members,
    relocation_type,
    expected_relocation_date,
    expected_move_date,
    housing_budget_min,
    housing_budget_max,
    preferred_neighborhoods,
    preferred_contact_method,
    documents,
    tasks,
    overall_progress,
    relocation_consultant,
    consultant_details,
    consultant_name,
    created_at,
    updated_at
  } = profile;

  const profileSections = [
    {
      title: "Personal Information",
      icon: FaUser,
      items: [
        { label: "Full Name", value: full_name || `${user?.first_name} ${user?.last_name}`, icon: FaUser },
        { label: "Email", value: email || user?.email, icon: FaEnvelope },
        { label: "Phone", value: phone_number, icon: FaPhone },
        { label: "Country", value: country, icon: FaGlobe },
        { label: "Date of Birth", value: date_of_birth ? `${formatDate(date_of_birth)} (${calculateAge(date_of_birth)} years)` : 'Not specified', icon: FaCalendarAlt },
      ]
    },
    {
      title: "Current Location",
      icon: FaMapMarkerAlt,
      items: [
        { label: "Current City", value: current_city || 'Not specified', icon: FaCity },
        { label: "Current Country", value: current_country || 'Not specified', icon: FaGlobe },
      ]
    },
    {
      title: "Destination Information",
      icon: FaMapMarkerAlt,
      items: [
        { label: "Destination City", value: destination_city || 'Not specified', icon: FaCity },
        { label: "Destination Country", value: destination_country || 'Not specified', icon: FaGlobe },
        { label: "Preferred Neighborhoods", value: preferred_neighborhoods?.length > 0 ? preferred_neighborhoods.join(', ') : 'Not specified' },
      ]
    },
    {
      title: "Family Information",
      icon: FaUsers,
      items: [
        { label: "Has Children", value: has_children ? 'Yes' : 'No', icon: FaBaby },
        { label: "Children Ages", value: children_ages?.length > 0 ? children_ages.join(', ') : 'Not applicable' },
        { label: "Family Members", value: family_members || 'Not specified' },
      ]
    },
    {
      title: "Relocation Details",
      icon: FaHome,
      items: [
        { label: "Relocation Type", value: relocation_type || 'Not specified' },
        { label: "Expected Relocation Date", value: formatDate(expected_relocation_date), icon: FaCalendarAlt },
        { label: "Expected Move Date", value: formatDate(expected_move_date), icon: FaCalendarAlt },
        { label: "Housing Budget", value: housing_budget_min && housing_budget_max ? `${housing_budget_min} - ${housing_budget_max}` : 'Not specified', icon: FaMoneyBill },
      ]
    },
    {
      title: "Consultant Information",
      icon: FaUserTie,
      items: [
        { label: "Consultant", value: consultant_name || consultant_details?.full_name, icon: FaUserTie },
        { label: "Consultant Employee ID", value: consultant_details?.employee_id },
        { label: "Consultant Email", value: consultant_details?.email },
      ]
    }
  ];

  return (
    <CLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-6"
      >
        {/* Header Section */}
        <div className="mb-8 pt-20 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <FaUser size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{full_name || `${user?.first_name} ${user?.last_name}`}</h1>
                <p className="text-gray-600">Relocation Client</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${overall_progress > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm text-gray-600">Active</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600">Profile created: {formatDate(created_at)}</span>
                </div>
              </div>
            </div>
            
            {/* Progress Indicator */}
            <div className="mt-4 md:mt-0">
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                  <span className="text-lg font-bold text-blue-600">{overall_progress}%</span>
                </div>
                <div className="w-64 bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${overall_progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                  ></motion.div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {tasks?.length || 0} tasks pending
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Preferences */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4  max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaEnvelope className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Preferred Contact Method</h3>
              <p className="text-gray-600 capitalize">{preferred_contact_method || 'Email'}</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* Profile Information Sections */}
          {profileSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <section.icon className="text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-800">{section.title}</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start">
                      <div className="flex-shrink-0 w-8">
                        {item.icon && (
                          <item.icon className="text-gray-400 mt-1" size={16} />
                        )}
                      </div>
                      <div className="ml-2">
                        <p className="text-sm text-gray-500">{item.label}</p>
                        <p className="text-gray-800 font-medium">{item.value || 'Not specified'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Documents & Tasks Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 max-w-7xl mx-auto">
          {/* Documents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FaFileAlt className="text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-800">Documents</h2>
                </div>
                <span className="bg-blue-100 text-blue-600 text-sm font-medium px-3 py-1 rounded-full">
                  {documents?.length || 0} files
                </span>
              </div>
            </div>
            <div className="p-6">
              {documents?.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white border border-gray-200 rounded-lg">
                          <FaFileAlt className="text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{doc.name || 'Document'}</p>
                          <p className="text-sm text-gray-500">Uploaded: {formatDate(doc.uploaded_at)}</p>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaFileAlt className="mx-auto text-gray-300" size={48} />
                  <p className="text-gray-500 mt-2">No documents uploaded yet</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FaTasks className="text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-800">Tasks</h2>
                </div>
                <span className="bg-blue-100 text-blue-600 text-sm font-medium px-3 py-1 rounded-full">
                  {tasks?.length || 0} pending
                </span>
              </div>
            </div>
            <div className="p-6">
              {tasks?.length > 0 ? (
                <div className="space-y-3">
                  {tasks.map((task, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${task.completed ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        <div>
                          <p className="font-medium text-gray-800">{task.title}</p>
                          <p className="text-sm text-gray-500">Due: {formatDate(task.due_date)}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${task.priority === 'high' ? 'bg-red-100 text-red-800' : task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaTasks className="mx-auto text-gray-300" size={48} />
                  <p className="text-gray-500 mt-2">No tasks assigned yet</p>
                </div>
              )}
              <div className="mt-6">
                <button className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors">
                  View All Tasks
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer Information */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between text-sm text-gray-500">
            <div>
              <p>Client ID: {profile.id}</p>
              <p>Last updated: {formatDate(updated_at)}</p>
            </div>
            <div className="mt-2 md:mt-0">
              <button
              onClick={toggleDocModal}
              className="px-4 cursor-pointer py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors mr-3">
                View Documents
              </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                    View Tasks
                </button>
            </div>
          </div>
        </div>
      </motion.div>

      {docModal && 
      <AnimatePresence>
        <ViewDocs loading={loading} documents={documents} onClose={toggleDocModal} />
      </AnimatePresence>
      }
    </CLayout>
  )
}

export default ClientProfile