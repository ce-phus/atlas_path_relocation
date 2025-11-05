import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProgress } from "../actions/profileActions";
import { motion, AnimatePresence } from "framer-motion";

const ProgressTracker = ({ profile }) => {
  const dispatch = useDispatch();
  const { progress, loading, error } = useSelector((state) => state.progressReducer);

  useEffect(() => {
    if (profile?.id) {
      dispatch(fetchProgress(profile.id));
    }
  }, [dispatch, profile]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
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

  const progressBarVariants = {
    hidden: { width: 0 },
    visible: (progress) => ({
      width: `${progress}%`,
      transition: {
        duration: 1.5,
        ease: "easeOut",
        delay: 0.3
      }
    })
  };

  const pulseVariants = {
    initial: { scale: 1 },
    pulse: {
      scale: [1, 1.02, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-br from-white to-gray-50/80 shadow-xl rounded-2xl p-8 border border-gray-100/60 backdrop-blur-sm"
      >
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-3 bg-gray-200 rounded-full"></div>
          </div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-2 bg-gray-200 rounded-full"></div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (error) return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-white to-red-50/80 shadow-xl rounded-2xl p-6 border border-red-100/60 backdrop-blur-sm"
    >
      <div className="flex items-center space-x-3 text-red-600">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="font-medium">Error loading progress: {error}</p>
      </div>
    </motion.div>
  );

  if (!progress?.stages) return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-br from-white to-gray-50/80 shadow-xl rounded-2xl p-8 border border-gray-100/60 backdrop-blur-sm text-center"
    >
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Progress Data</h3>
      <p className="text-gray-500 text-sm">Progress tracking will appear once you start your relocation journey</p>
    </motion.div>
  );

  const overallProgress = progress.overall_progress || 0;

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
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center mb-6 bg-gradient-to-r from-gray-800 to-indigo-600 bg-clip-text text-transparent inline-block [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
            Relocation Progress
          </h2>
          <p className="text-sm text-gray-500 mt-1">Track your relocation journey</p>
        </div>
        
        {/* Progress Circle */}
        <motion.div 
          variants={pulseVariants}
          initial="initial"
          animate="pulse"
          className="relative w-16 h-16"
        >
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="3"
            />
            <motion.path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: overallProgress / 100 }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-800">{overallProgress}%</span>
          </div>
        </motion.div>
      </div>

      {/* Overall Progress Card */}
      <motion.div 
        variants={itemVariants}
        className="bg-white/80 rounded-2xl p-6 border border-gray-200/60 shadow-sm mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Overall Progress</h3>
              <p className="text-sm text-gray-500">Complete relocation journey</p>
            </div>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-indigo-600 bg-clip-text text-transparent inline-block [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
            {overallProgress}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            custom={overallProgress}
            variants={progressBarVariants}
            initial="hidden"
            animate="visible"
            className="h-3 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-sm"
          />
        </div>
      </motion.div>

      {/* Stage Progress */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Stage Progress</h3>
        
        <AnimatePresence>
          {progress.stages.map((stage, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              layout
              whileHover={{ scale: 1.02 }}
              className="group bg-white/80 rounded-2xl p-5 border border-gray-200/60 hover:border-indigo-300/50 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    stage.progress === 100 
                      ? 'bg-green-500' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                  }`}>
                    {stage.progress === 100 ? (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{stage.name}</h4>
                    <p className="text-xs text-gray-500">
                      {stage.completed_tasks} of {stage.total_tasks} tasks completed
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className={`text-lg font-bold ${
                    stage.progress === 100 
                      ? 'text-green-600' 
                      : 'text-indigo-600'
                  }`}>
                    {stage.progress}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  custom={stage.progress}
                  variants={progressBarVariants}
                  initial="hidden"
                  animate="visible"
                  className={`h-2 rounded-full ${
                    stage.progress === 100 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                      : 'bg-gradient-to-r from-blue-400 to-indigo-500'
                  } shadow-sm`}
                />
              </div>

              {/* Task Completion Status */}
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>
                  {stage.completed_tasks === stage.total_tasks ? (
                    <span className="text-green-600 font-medium">✓ All tasks completed</span>
                  ) : (
                    `${stage.total_tasks - stage.completed_tasks} tasks remaining`
                  )}
                </span>
                <span className="font-medium">
                  {stage.completed_tasks}/{stage.total_tasks}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Completion Celebration */}
      {overallProgress === 100 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mt-6 p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-white text-center"
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">Congratulations! Relocation Complete! 🎉</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProgressTracker;