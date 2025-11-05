import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { markTaskComplete, loadTasks } from '../actions/profileActions'
import { AnimatePresence, motion } from 'framer-motion'
import { Layout } from '../components'
const Tasks = () => {

const dispatch = useDispatch();
  const { tasks, tasksloading, taskerror } = useSelector((state) => state.profileReducer);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(loadTasks());
  }, [dispatch]);

  const handleMarkComplete = (taskId) => {
    if (taskId) {
      dispatch(markTaskComplete(taskId));
    }
  };

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
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  const checkmarkVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15
      }
    }
  };

  // Exact stage color mapping based on your backend stages
  const getStageColor = (stage, isCompleted) => {
    if (isCompleted) return 'bg-green-100 text-green-700 border-green-200';
    
    const stageColors = {
      'initial_consultation': 'bg-blue-50 text-blue-700 border-blue-200',
      'document_collection': 'bg-purple-50 text-purple-700 border-purple-200',
      'visa_processing': 'bg-amber-50 text-amber-700 border-amber-200',
      'housing_search': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'school_enrollment': 'bg-teal-50 text-teal-700 border-teal-200',
      'final_relocation': 'bg-orange-50 text-orange-700 border-orange-200'
    };
    
    return stageColors[stage] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  // Get stage display name for better readability
  const getStageDisplayName = (stage) => {
    const stageDisplayMap = {
      'initial_consultation': 'Initial Consultation',
      'document_collection': 'Document Collection',
      'visa_processing': 'Visa Processing',
      'housing_search': 'Housing Search',
      'school_enrollment': 'School Enrollment',
      'final_relocation': 'Final Relocation'
    };
    
    return stageDisplayMap[stage] || stage;
  };

  const isOverdue = (dueDate, isCompleted) => {
    if (isCompleted || !dueDate) return false;
    try {
      return new Date(dueDate) < new Date();
    } catch (error) {
      console.error('Error parsing due date:', error);
      return false;
    }
  };

  // Filter and search tasks
  const allTasks = Array.isArray(tasks) ? tasks : tasks?.results || [];
  
  const filteredTasks = allTasks.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'completed' ? task.is_completed :
      filter === 'pending' ? !task.is_completed :
      filter === 'overdue' ? isOverdue(task.due_date, task.is_completed) : true;
    
    return matchesSearch && matchesFilter;
  });

  const completedTasks = allTasks.filter(task => task.is_completed).length;
  const overdueTasks = allTasks.filter(task => isOverdue(task.due_date, task.is_completed)).length;
  const totalTasks = allTasks.length;

  if (tasksloading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            {/* Header Skeleton */}
            <div className="text-center space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
            </div>
            
            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>

            {/* Tasks Skeleton */}
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (taskerror) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-white to-red-50/80 shadow-xl rounded-2xl p-8 border border-red-100/60 backdrop-blur-sm text-center"
          >
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Tasks</h3>
            <p className="text-gray-600 mb-4">{taskerror}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => dispatch(loadTasks())}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Try Again
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
 <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-center mb-6 bg-gradient-to-r from-gray-800 to-indigo-600 bg-clip-text text-transparent inline-block [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
            Relocation Tasks
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track and manage all your relocation tasks in one place. Stay organized and on schedule.
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm">
            <div className="text-2xl font-bold text-indigo-600">{totalTasks}</div>
            <div className="text-sm text-gray-500">Total Tasks</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm">
            <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm">
            <div className="text-2xl font-bold text-amber-600">{totalTasks - completedTasks}</div>
            <div className="text-sm text-gray-500">Remaining</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm">
            <div className="text-2xl font-bold text-red-600">{overdueTasks}</div>
            <div className="text-sm text-gray-500">Overdue</div>
          </div>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-sm mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full md:max-w-md">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 text-black py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Tasks', count: totalTasks },
                { key: 'pending', label: 'Pending', count: totalTasks - completedTasks },
                { key: 'completed', label: 'Completed', count: completedTasks },
                { key: 'overdue', label: 'Overdue', count: overdueTasks }
              ].map((filterOption) => (
                <motion.button
                  key={filterOption.key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(filterOption.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                    filter === filterOption.key
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filterOption.label} ({filterOption.count})
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tasks List */}
        {allTasks.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 border border-gray-200/60 shadow-sm text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">No Tasks Yet</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Your consultant will assign tasks to guide you through each stage of your relocation journey.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => dispatch(loadTasks())}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center space-x-2"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh Tasks</span>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <AnimatePresence>
              {filteredTasks.map((task) => (
                <motion.div
                  key={task.id}
                  variants={itemVariants}
                  layout
                  whileHover={{ scale: 1.01 }}
                  className={`group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 transition-all duration-300 ${
                    task.is_completed
                      ? 'bg-green-50/80 border-green-200/60 shadow-sm'
                      : 'border-gray-200/60 hover:border-indigo-300/50 hover:shadow-md'
                  } ${isOverdue(task.due_date, task.is_completed) ? 'border-l-4 border-l-red-400' : ''}`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Completion Button */}
                    <motion.button
                      whileHover={!task.is_completed ? { scale: 1.1 } : {}}
                      whileTap={!task.is_completed ? { scale: 0.9 } : {}}
                      onClick={() => !task.is_completed && handleMarkComplete(task.id)}
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 transition-all duration-200 ${
                        task.is_completed
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500 cursor-default shadow-sm'
                          : 'bg-white border-gray-400 hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer'
                      }`}
                    >
                      <AnimatePresence>
                        {task.is_completed && (
                          <motion.svg
                            variants={checkmarkVariants}
                            initial="hidden"
                            animate="visible"
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </motion.svg>
                        )}
                      </AnimatePresence>
                    </motion.button>

                    {/* Task Details */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-lg font-semibold leading-relaxed ${
                            task.is_completed
                              ? 'text-gray-500 line-through'
                              : 'text-gray-900'
                          }`}>
                            {task.title}
                          </h3>
                          
                          {/* Stage Badge */}
                          {task.stage && (
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStageColor(task.stage, task.is_completed)} mt-2`}
                            >
                              {getStageDisplayName(task.stage)}
                            </span>
                          )}
                        </div>
                        
                        {/* Due Date */}
                        {task.due_date && (
                          <div className={`flex items-center space-x-2 text-sm ${
                            isOverdue(task.due_date, task.is_completed)
                              ? 'text-red-500'
                              : task.is_completed
                              ? 'text-gray-400'
                              : 'text-gray-600'
                          }`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="font-medium whitespace-nowrap">
                              {new Date(task.due_date).toLocaleDateString()}
                              {isOverdue(task.due_date, task.is_completed) && ' • Overdue'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {task.description && (
                        <p className={`text-gray-600 leading-relaxed ${
                          task.is_completed ? 'line-through text-gray-400' : ''
                        }`}>
                          {task.description}
                        </p>
                      )}

                      {/* Task Meta */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Created {new Date(task.created_at).toLocaleDateString()}</span>
                          </span>
                        </div>
                        
                        {task.is_completed && (
                          <div className="flex items-center space-x-1 text-green-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">Completed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Overdue Indicator */}
                  {isOverdue(task.due_date, task.is_completed) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* No Results Message */}
            {filteredTasks.length === 0 && allTasks.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
    </Layout>
  )
}

export default Tasks