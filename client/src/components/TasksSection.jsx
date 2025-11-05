import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { markTaskComplete } from '../actions/profileActions';
import { motion, AnimatePresence } from 'framer-motion';

const TasksSection = ({ profile, expanded = false }) => {
  const dispatch = useDispatch();
  const { tasks, tasksloading, taskerror } = useSelector((state) => state.profileReducer);

  const handleMarkComplete = (taskId) => {
    dispatch(markTaskComplete(taskId));
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
    if (isCompleted) return false;
    return dueDate && new Date(dueDate) < new Date();
  };

  if (tasksloading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-br from-white to-gray-50/80 shadow-xl rounded-2xl p-8 border border-gray-100/60 backdrop-blur-sm mt-6"
      >
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-indigo-600 bg-clip-text text-transparent mb-6">Tasks</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center space-x-4 p-4 bg-white/50 rounded-xl border border-gray-100">
              <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (taskerror) return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-white to-red-50/80 shadow-xl rounded-2xl p-6 border border-red-100/60 backdrop-blur-sm mt-6"
    >
      <div className="flex items-center space-x-3 text-red-600">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="font-medium">Error loading tasks: {taskerror}</p>
      </div>
    </motion.div>
  );

  // Make it flexible whether tasks is an array or paginated object
  const allTasks = Array.isArray(tasks) ? tasks : tasks?.results || [];
  const displayTasks = expanded ? allTasks : allTasks.slice(0, 3);
  const completedTasks = allTasks.filter(task => task.is_completed).length;
  const completionPercentage = allTasks.length > 0 ? (completedTasks / allTasks.length) * 100 : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-white to-gray-50/80 shadow-xl rounded-2xl p-6 md:p-8 border border-gray-100/60 backdrop-blur-sm mt-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center mb-6 bg-gradient-to-r from-gray-800 to-indigo-600 bg-clip-text text-transparent inline-block [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
  Relocation Tasks
</h2>

          <p className="text-sm text-gray-500 mt-1">Your relocation journey checklist</p>
        </div>

        {!expanded && allTasks.length > 3 && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-sm text-gray-500 bg-white/80 px-3 py-1 rounded-full border border-gray-200 shadow-sm"
          >
            +{allTasks.length - 3} more
          </motion.span>
        )}
      </div>

      {allTasks.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <div className="relative inline-block mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tasks Assigned</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Your consultant will assign tasks to guide you through each stage of your relocation
          </p>
        </motion.div>
      ) : (
        <>
          {/* Progress Overview */}
          {!expanded && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-white/60 rounded-xl border border-gray-200/60 shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Relocation Progress</span>
                <span className="text-sm font-semibold text-indigo-600">
                  {completedTasks}/{allTasks.length} completed
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full shadow-sm"
                />
              </div>
            </motion.div>
          )}

          {/* Tasks List */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            <AnimatePresence>
              {displayTasks.map((task) => (
                <motion.div
                  key={task.id}
                  variants={itemVariants}
                  layout
                  whileHover={{ scale: 1.02 }}
                  className={`group relative p-4 rounded-xl border-2 transition-all duration-300 ${
                    task.is_completed
                      ? 'bg-green-50/80 border-green-200/60 shadow-sm'
                      : 'bg-white/80 border-gray-200/60 hover:border-indigo-300/50 hover:shadow-md'
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
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <h3
                          className={`text-base font-semibold leading-relaxed ${
                            task.is_completed
                              ? 'text-gray-500 line-through'
                              : 'text-gray-900'
                          }`}
                        >
                          {task.title}
                        </h3>
                        
                        {/* Stage Badge */}
                        {task.stage && (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStageColor(task.stage, task.is_completed)} self-start sm:self-auto`}
                          >
                            {getStageDisplayName(task.stage)}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {task.description && (
                        <p
                          className={`text-sm leading-relaxed ${
                            task.is_completed
                              ? 'text-gray-400 line-through'
                              : 'text-gray-600'
                          }`}
                        >
                          {task.description}
                        </p>
                      )}

                      {/* Due Date & Status */}
                      <div className="flex items-center space-x-4 text-xs">
                        {task.due_date && (
                          <div className="flex items-center space-x-1">
                            <svg className={`w-4 h-4 ${isOverdue(task.due_date, task.is_completed) ? 'text-red-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className={`font-medium ${
                              isOverdue(task.due_date, task.is_completed)
                                ? 'text-red-500'
                                : task.is_completed
                                ? 'text-gray-400'
                                : 'text-gray-600'
                            }`}>
                              Due: {new Date(task.due_date).toLocaleDateString()}
                              {isOverdue(task.due_date, task.is_completed) && ' • Overdue'}
                            </span>
                          </div>
                        )}
                        
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
          </motion.div>
        </>
      )}

      {/* Expanded View Progress */}
      {expanded && allTasks.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 pt-6 border-t border-gray-200/60"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-white/60 rounded-xl p-4 border border-gray-200/60">
              <div className="text-2xl font-bold text-indigo-600">{allTasks.length}</div>
              <div className="text-sm text-gray-500">Total Tasks</div>
            </div>
            <div className="bg-white/60 rounded-xl p-4 border border-gray-200/60">
              <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
            <div className="bg-white/60 rounded-xl p-4 border border-gray-200/60">
              <div className="text-2xl font-bold text-amber-600">{allTasks.length - completedTasks}</div>
              <div className="text-sm text-gray-500">Remaining</div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TasksSection;