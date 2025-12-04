import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CLayout, ViewDocs, TaskView } from '../components'
import { loadProfile, markTaskComplete } from '../../actions/profileActions'
import { 
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, 
  FaCalendarAlt, FaHome, FaBaby, FaFileAlt,
  FaGlobe, FaCity, FaTasks, FaMoneyBill, FaCheck,
  FaUsers, FaUserTie, FaBuilding, FaClock,
  FaExclamationTriangle, FaPlus, FaChevronRight
} from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { format, isPast, isToday, differenceInDays } from 'date-fns'

const ClientProfile = () => {
  const { profile, loading, error } = useSelector((state) => state.profileReducer);
  const [ docModal, setDocModal ] = useState(false);
  const [ taskModal, setTaskModal ] = useState(false);
  const [ expandedTask, setExpandedTask ] = useState(null);
  const dispatch = useDispatch();

  const toggleDocModal = () => {
    setDocModal(!docModal);
  }

  const toggleTaskModal = () => {
    setTaskModal(!taskModal);
  }

  const toggleTaskExpand = (taskId) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  }

  const handleMarkComplete = (taskId, e) => {
    e.stopPropagation();
    if (window.confirm('Mark this task as complete?')) {
      dispatch(markTaskComplete(taskId));
    }
  }
  
  React.useEffect(() => {
    dispatch(loadProfile());
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
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

  // Get task status
  const getTaskStatus = (task) => {
    if (task.is_completed) return 'completed';
    if (!task.due_date) return 'no-due-date';
    
    const dueDate = new Date(task.due_date);
    const today = new Date();
    
    if (isPast(dueDate) && !isToday(dueDate)) return 'overdue';
    if (isToday(due_date)) return 'due-today';
    if (differenceInDays(dueDate, today) <= 3) return 'due-soon';
    return 'upcoming';
  };

  // Get task status color
  const getTaskStatusColor = (status) => {
    const colors = {
      'completed': 'bg-green-100 text-green-800 border-green-200',
      'overdue': 'bg-red-100 text-red-800 border-red-200',
      'due-today': 'bg-orange-100 text-orange-800 border-orange-200',
      'due-soon': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'upcoming': 'bg-blue-100 text-blue-800 border-blue-200',
      'no-due-date': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || colors['no-due-date'];
  };

  // Get task status text
  const getTaskStatusText = (task) => {
    const status = getTaskStatus(task);
    const texts = {
      'completed': 'Completed',
      'overdue': 'Overdue',
      'due-today': 'Due Today',
      'due-soon': 'Due Soon',
      'upcoming': 'Upcoming',
      'no-due-date': 'No Due Date'
    };
    return texts[status];
  };

  // Get stage color
  const getStageColor = (stage) => {
    const colors = {
      'initial_consultation': 'bg-indigo-100 text-indigo-800',
      'document_collection': 'bg-purple-100 text-purple-800',
      'visa_processing': 'bg-blue-100 text-blue-800',
      'housing_search': 'bg-emerald-100 text-emerald-800',
      'school_enrollment': 'bg-amber-100 text-amber-800',
      'final_relocation': 'bg-rose-100 text-rose-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  // Get stage icon
  const getStageIcon = (stage) => {
    const icons = {
      'initial_consultation': '👥',
      'document_collection': '📄',
      'visa_processing': '🛂',
      'housing_search': '🏠',
      'school_enrollment': '🎓',
      'final_relocation': '✈️'
    };
    return icons[stage] || '📋';
  };

  // Get stage display name
  const getStageDisplay = (stage) => {
    const stages = {
      'initial_consultation': 'Initial Consultation',
      'document_collection': 'Document Collection',
      'visa_processing': 'Visa Processing',
      'housing_search': 'Housing Search',
      'school_enrollment': 'School Enrollment',
      'final_relocation': 'Final Relocation'
    };
    return stages[stage] || stage;
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
    tasks = [],
    overall_progress,
    relocation_consultant,
    consultant_details,
    consultant_name,
    created_at,
    updated_at
  } = profile;

  // Calculate task stats
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.is_completed).length,
    pending: tasks.filter(t => !t.is_completed).length,
    overdue: tasks.filter(t => {
      if (!t.due_date || t.is_completed) return false;
      const dueDate = new Date(t.due_date);
      return isPast(dueDate) && !isToday(dueDate);
    }).length,
    dueToday: tasks.filter(t => {
      if (!t.due_date || t.is_completed) return false;
      return isToday(new Date(t.due_date));
    }).length
  };

  // Define all stages first
  const ALL_STAGES = [
    { value: 'initial_consultation', label: 'Initial Consultation' },
    { value: 'document_collection', label: 'Document Collection' },
    { value: 'visa_processing', label: 'Visa Processing' },
    { value: 'housing_search', label: 'Housing Search' },
    { value: 'school_enrollment', label: 'School Enrollment' },
    { value: 'final_relocation', label: 'Final Relocation' }
  ];

  // Then update tasksByStage to include all stages
  const tasksByStage = ALL_STAGES.reduce((acc, stage) => {
    const stageTasks = tasks.filter(t => t.stage === stage.value);
    acc[stage.value] = {
      label: stage.label,
      tasks: stageTasks,
      completed: stageTasks.filter(t => t.is_completed).length,
      total: stageTasks.length
    };
    return acc;
  }, {});

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
        className="p-4 sm:p-6"
      >
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 pt-16 sm:pt-20 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <FaUser size={24} className="text-white sm:size-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{full_name || `${user?.first_name} ${user?.last_name}`}</h1>
                <p className="text-gray-600 mt-1">Relocation Client</p>
                <div className="flex items-center flex-wrap gap-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${overall_progress > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-xs sm:text-sm text-gray-600">Active</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs sm:text-sm text-gray-600">Created: {formatDate(created_at)}</span>
                </div>
              </div>
            </div>
            
            {/* Progress Indicator */}
            <div className="lg:mt-0">
              <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                  <span className="text-lg font-bold text-blue-600">{overall_progress}%</span>
                </div>
                <div className="w-full sm:w-64 bg-gray-200 rounded-full h-1.5 sm:h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${overall_progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-full rounded-full"
                  ></motion.div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {taskStats.pending} of {taskStats.total} tasks pending
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Preferences */}
        <div className="mb-6 sm:mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg sm:rounded-xl p-4 max-w-7xl mx-auto">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 max-w-7xl mx-auto">
          {profileSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="border-b border-gray-100 bg-gray-50 px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <section.icon className="text-blue-600" size={16} />
                  <h2 className="text-base sm:text-lg font-semibold text-gray-800">{section.title}</h2>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start">
                      <div className="flex-shrink-0 w-6 sm:w-8 pt-0.5">
                        {item.icon && (
                          <item.icon className="text-gray-400" size={14} />
                        )}
                      </div>
                      <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-gray-500">{item.label}</p>
                        <p className="text-gray-800 font-medium text-sm sm:text-base truncate">{item.value || 'Not specified'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Documents & Tasks Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6 max-w-7xl mx-auto">
          {/* Documents Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="border-b border-gray-100 bg-gray-50 px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <FaFileAlt className="text-blue-600" size={18} />
                  <h2 className="text-base sm:text-lg font-semibold text-gray-800">Documents</h2>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <span className="bg-blue-100 text-blue-600 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full">
                    {documents?.length || 0} files
                  </span>
                  <button
                    onClick={toggleDocModal}
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 cursor-pointer font-medium"
                  >
                    Manage
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              {documents?.length > 0 ? (
                <div className="space-y-4">
                  {/* Status Summary */}
                  <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4">
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {documents.filter(d => d.status === 'submitted').length}
                      </div>
                      <div className="text-xs text-blue-800">Submitted</div>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded-lg">
                      <div className="text-lg font-bold text-yellow-600">
                        {documents.filter(d => d.status === 'awaiting review').length}
                      </div>
                      <div className="text-xs text-yellow-800">Pending</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {documents.filter(d => d.status === 'approved').length}
                      </div>
                      <div className="text-xs text-green-800">Approved</div>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded-lg">
                      <div className="text-lg font-bold text-red-600">
                        {documents.filter(d => d.status === 'rejected').length}
                      </div>
                      <div className="text-xs text-red-800">Rejected</div>
                    </div>
                  </div>

                  {/* Recent Documents */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-700">Recent Documents</h3>
                    {documents.slice(0, 3).map((doc, index) => {
                      const getStatusColor = (status) => {
                        const statusMap = {
                          'submitted': 'bg-blue-100 text-blue-800 border-blue-200',
                          'awaiting review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
                          'approved': 'bg-green-100 text-green-800 border-green-200',
                          'rejected': 'bg-red-100 text-red-800 border-red-200'
                        };
                        return statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
                      };

                      return (
                        <div 
                          key={doc.id || index} 
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-sm sm:text-lg">📄</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <p className="font-medium text-gray-800 truncate text-sm sm:text-base">
                                  {doc.document_name || doc.document_type || `Document ${index + 1}`}
                                </p>
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(doc.status)}`}>
                                  {doc.status || 'Unknown'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-3 text-xs text-gray-500">
                                <span className="truncate max-w-[100px] sm:max-w-[120px]">{doc.document_type}</span>
                                <span>•</span>
                                <span>{doc.created_at ? formatDate(doc.created_at) : 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                          <FaChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </div>
                      );
                    })}

                    {/* View All Button */}
                    {documents.length > 3 && (
                      <button
                        onClick={toggleDocModal}
                        className="w-full mt-4 py-2.5 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2"
                      >
                        <span>View All Documents</span>
                        <FaChevronRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <FaFileAlt className="text-gray-400" size={24} />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Documents Yet</h3>
                  <p className="text-gray-500 mb-4 text-sm sm:text-base max-w-md mx-auto">
                    This client hasn't uploaded any documents yet.
                  </p>
                  <button
                    onClick={toggleDocModal}
                    className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center space-x-2 text-sm sm:text-base cursor-pointer"
                  >
                    <FaFileAlt className="text-white" size={14} />
                    <span>Manage Documents</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Enhanced Tasks Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <FaTasks className="text-blue-600" size={18} />
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-gray-800">Tasks Overview</h2>
                    <p className="text-xs text-gray-600">Client relocation progress</p>
                  </div>
                </div>
                <button
                  onClick={toggleTaskModal}
                  className="px-3 sm:px-4 cursor-pointer py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-1 sm:space-x-2 text-sm"
                >
                  <FaPlus size={12} />
                  <span className="hidden sm:inline">New Task</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {/* Task Statistics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-3 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-blue-700">{taskStats.total}</div>
                  <div className="text-xs text-blue-800 font-medium">Total</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-3 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-green-700">{taskStats.completed}</div>
                  <div className="text-xs text-green-800 font-medium">Completed</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-3 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-yellow-700">{taskStats.pending}</div>
                  <div className="text-xs text-yellow-800 font-medium">Pending</div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-3 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-red-700">{taskStats.overdue}</div>
                  <div className="text-xs text-red-800 font-medium">Overdue</div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Progress by Stage</h3>
                <div className="space-y-3">
                  {ALL_STAGES.map((stage) => {
                    const stageData = tasksByStage[stage.value] || { 
                      label: stage.label, 
                      completed: 0, 
                      total: 0 
                    };
                    const progress = stageData.total > 0 ? Math.round((stageData.completed / stageData.total) * 100) : 0;
                    
                    return (
                      <div key={stage.value} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">{getStageIcon(stage.value)}</span>
                            <span className="text-sm font-medium text-gray-700">{stageData.label}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-gray-600">
                              {stageData.completed}/{stageData.total}
                            </span>
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                              progress === 100 ? 'bg-green-100 text-green-800' : 
                              progress > 0 ? 'bg-blue-100 text-blue-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {progress}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className={`h-full rounded-full ${
                              progress === 100 ? 'bg-green-500' : 
                              progress > 0 ? 'bg-blue-500' : 
                              'bg-gray-300'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {tasks.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700">Recent Tasks</h3>
                    <button
                      onClick={toggleTaskModal}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                    >
                      View All
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {tasks.slice(0, 5).map((task, index) => {
                      const status = getTaskStatus(task);
                      const isExpanded = expandedTask === task.id;
                      
                      return (
                        <motion.div
                          key={task.id || index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                            status === 'overdue' ? 'border-red-200 bg-red-50' :
                            status === 'completed' ? 'border-green-200 bg-green-50' :
                            'border-gray-200 bg-gray-50 hover:bg-gray-100'
                          }`}
                          onClick={() => toggleTaskExpand(task.id)}
                        >
                          <div className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                                <button
                                  onClick={(e) => handleMarkComplete(task.id, e)}
                                  className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full border flex items-center justify-center transition-colors ${
                                    task.is_completed 
                                      ? 'bg-green-500 border-green-600' 
                                      : 'border-gray-300 hover:border-gray-400'
                                  }`}
                                >
                                  {task.is_completed && <FaCheck size={10} className="text-white" />}
                                </button>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                                    <p className={`font-medium truncate text-sm sm:text-base ${
                                      task.is_completed ? 'text-green-700 line-through' : 'text-gray-800'
                                    }`}>
                                      {task.title}
                                    </p>
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getTaskStatusColor(status)}`}>
                                      {getTaskStatusText(task)}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center flex-wrap gap-2 text-xs text-gray-500">
                                    {task.due_date && (
                                      <div className="flex items-center space-x-1">
                                        <FaCalendarAlt size={10} />
                                        <span>Due: {formatDate(task.due_date)}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center space-x-1">
                                      <span className={`w-2 h-2 rounded-full ${getStageColor(task.stage).split(' ')[0]}`}></span>
                                      <span>{getStageDisplay(task.stage)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <motion.div
                                animate={{ rotate: isExpanded ? 90 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="ml-2 text-gray-400"
                              >
                                <FaChevronRight size={14} />
                              </motion.div>
                            </div>
                            
                            <AnimatePresence>
                              {isExpanded && task.description && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="mt-3 pt-3 border-t border-gray-200"
                                >
                                  <p className="text-sm text-gray-600">{task.description}</p>
                                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                                    <span>Created: {formatDate(task.created_at)}</span>
                                    {!task.is_completed && task.due_date && (
                                      <div className="flex items-center space-x-1">
                                        <FaClock size={10} />
                                        <span>
                                          {status === 'overdue' && (
                                            <span className="text-red-600 font-medium flex items-center space-x-1">
                                              <FaExclamationTriangle size={10} />
                                              <span>Overdue!</span>
                                            </span>
                                          )}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <FaTasks className="text-gray-400" size={24} />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Tasks Yet</h3>
                  <p className="text-gray-500 mb-4 text-sm sm:text-base max-w-md mx-auto">
                    Start creating tasks to track this client's relocation progress.
                  </p>
                  <button
                    onClick={toggleTaskModal}
                    className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center space-x-2 text-sm sm:text-base"
                  >
                    <FaPlus size={14} />
                    <span>Create First Task</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Footer Information */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between text-sm text-gray-500">
            <div className="mb-3 md:mb-0">
              <p className="text-xs">Client ID: <span className="font-mono text-gray-700">{profile.id?.substring(0, 8)}...</span></p>
              <p className="text-xs">Last updated: {formatDate(updated_at)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={toggleDocModal}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
              >
                View Documents
              </button>
              <button
                onClick={toggleTaskModal}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-colors text-sm cursor-pointer"
              >
                Manage Tasks
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {docModal && 
      <AnimatePresence>
        <ViewDocs loading={loading} full_name={full_name} documents={documents} onClose={toggleDocModal} />
      </AnimatePresence>
      }

      {taskModal && (
        <TaskView 
          profileId={profile.id}
          clientName={full_name || `${user?.first_name} ${user?.last_name}`}
          onClose={toggleTaskModal}
        />
      )}
    </CLayout>
  )
}

export default ClientProfile