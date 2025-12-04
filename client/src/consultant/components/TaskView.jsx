import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { FaTasks, FaPlus, FaCheck, FaEdit, FaTrash, FaCalendarAlt, FaFileAlt, FaTimes } from 'react-icons/fa'
import { 
  loadTasks, 
  createTask, 
  markTaskComplete, 
//   deleteTask 
} from '../../actions/profileActions'

const TaskView = ({ profileId, clientName, onClose }) => {
  const dispatch = useDispatch()
  const { tasks, taskloading, taskerror } = useSelector((state) => state.profileReducer)
  const { loading: createLoading, success: createSuccess } = useSelector((state) => state.createTaskReducer)
  
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [filter, setFilter] = useState('all') 
  const [stageFilter, setStageFilter] = useState('all')
  
  // Form state
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    stage: 'initial_consultation',
    due_date: '',
    profile: profileId
  })

  const RELOCATION_STAGES = [
    { value: 'initial_consultation', label: 'Initial Consultation' },
    { value: 'document_collection', label: 'Document Collection' },
    { value: 'visa_processing', label: 'Visa Processing' },
    { value: 'housing_search', label: 'Housing Search' },
    { value: 'school_enrollment', label: 'School Enrollment' },
    { value: 'final_relocation', label: 'Final Relocation' }
  ]

  useEffect(() => {
    if (profileId) {
      dispatch(loadTasks(profileId))
    }
  }, [dispatch, profileId])

  useEffect(() => {
    if (createSuccess) {
      setShowCreateForm(false)
      setTaskData({
        title: '',
        description: '',
        stage: 'initial_consultation',
        due_date: '',
        profile: profileId
      })
      setEditingTask(null)
    }
  }, [createSuccess, profileId])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setTaskData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingTask) {
      console.log('Update task:', editingTask.id, taskData)
    } else {
      // Create new task
      dispatch(createTask(taskData))
    }
  }

  const handleMarkComplete = (taskId) => {
    if (window.confirm('Mark this task as complete?')) {
      dispatch(markTaskComplete(taskId))
    }
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setTaskData({
      title: task.title,
      description: task.description,
      stage: task.stage,
      due_date: task.due_date ? format(new Date(task.due_date), 'yyyy-MM-dd') : '',
      profile: profileId
    })
    setShowCreateForm(true)
  }

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
    //   dispatch(deleteTask(taskId))
    }
  }

  const resetForm = () => {
    setTaskData({
      title: '',
      description: '',
      stage: 'initial_consultation',
      due_date: '',
      profile: profileId
    })
    setEditingTask(null)
    setShowCreateForm(false)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date'
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch {
      return dateString
    }
  }

  const getStageColor = (stage) => {
    const colors = {
      initial_consultation: 'bg-blue-100 text-blue-800',
      document_collection: 'bg-purple-100 text-purple-800',
      visa_processing: 'bg-yellow-100 text-yellow-800',
      housing_search: 'bg-green-100 text-green-800',
      school_enrollment: 'bg-indigo-100 text-indigo-800',
      final_relocation: 'bg-pink-100 text-pink-800'
    }
    return colors[stage] || 'bg-gray-100 text-gray-800'
  }

  const getStageIcon = (stage) => {
    const icons = {
      initial_consultation: '👥',
      document_collection: '📄',
      visa_processing: '🛂',
      housing_search: '🏠',
      school_enrollment: '🎓',
      final_relocation: '✈️'
    }
    return icons[stage] || '📋'
  }

  const getStageLabel = (stageValue) => {
    const stage = RELOCATION_STAGES.find(s => s.value === stageValue)
    return stage ? stage.label : stageValue
  }

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.is_completed
    if (filter === 'completed') return task.is_completed
    if (stageFilter !== 'all') return task.stage === stageFilter
    return true
  })

  // Group tasks by stage
  const tasksByStage = RELOCATION_STAGES.reduce((acc, stage) => {
    acc[stage.value] = {
      label: stage.label,
      tasks: filteredTasks.filter(task => task.stage === stage.value),
      completed: filteredTasks.filter(task => task.stage === stage.value && task.is_completed).length,
      total: filteredTasks.filter(task => task.stage === stage.value).length
    }
    return acc
  }, {})

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaTasks className="text-blue-600" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Tasks Management</h2>
                  <p className="text-sm text-gray-600">Client: {clientName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <FaPlus size={14} />
                  <span>New Task</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 bg-white border-b border-gray-200">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Status:</span>
                <div className="flex space-x-1">
                  {['all', 'pending', 'completed'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilter(status)}
                      className={`px-3 py-1 text-sm rounded-full capitalize ${filter === status 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Stage:</span>
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Stages</option>
                  {RELOCATION_STAGES.map((stage) => (
                    <option key={stage.value} value={stage.value}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ml-auto">
                <span className="text-sm text-gray-600">
                  {filteredTasks.length} of {tasks.length} tasks
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex h-[calc(90vh-180px)]">
            {/* Main Tasks List */}
            <div className="flex-1 overflow-y-auto p-6">
              {taskloading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : taskerror ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700">Error loading tasks: {taskerror}</p>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FaTasks className="text-gray-400" size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tasks Found</h3>
                  <p className="text-gray-500 mb-6">
                    {filter !== 'all' || stageFilter !== 'all' 
                      ? 'No tasks match your current filters. Try changing your filter settings.'
                      : 'No tasks have been created yet. Click "New Task" to create one.'}
                  </p>
                  {filter !== 'all' || stageFilter !== 'all' ? (
                    <button
                      onClick={() => { setFilter('all'); setStageFilter('all') }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Clear Filters
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                    >
                      <FaPlus size={14} />
                      <span>Create First Task</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Task Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
                      <div className="text-2xl font-bold text-blue-700">
                        {tasks.filter(t => !t.is_completed).length}
                      </div>
                      <div className="text-sm text-blue-800 font-medium">Pending</div>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
                      <div className="text-2xl font-bold text-green-700">
                        {tasks.filter(t => t.is_completed).length}
                      </div>
                      <div className="text-sm text-green-800 font-medium">Completed</div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
                      <div className="text-2xl font-bold text-purple-700">
                        {tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && !t.is_completed).length}
                      </div>
                      <div className="text-sm text-purple-800 font-medium">Overdue</div>
                    </div>
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4">
                      <div className="text-2xl font-bold text-gray-700">
                        {tasks.length}
                      </div>
                      <div className="text-sm text-gray-800 font-medium">Total Tasks</div>
                    </div>
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-3">
                    {filteredTasks.map((task, index) => (
                      <motion.div
                        key={task.id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`border rounded-xl p-4 hover:shadow-md transition-all ${task.is_completed 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-white border-gray-200'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="flex-shrink-0 mt-1">
                              {task.is_completed ? (
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                  <FaCheck size={12} className="text-white" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h3 className={`font-semibold ${task.is_completed ? 'text-green-700 line-through' : 'text-gray-800'}`}>
                                  {task.title}
                                </h3>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStageColor(task.stage)}`}>
                                  <span className="mr-1">{getStageIcon(task.stage)}</span>
                                  {getStageLabel(task.stage)}
                                </span>
                              </div>
                              
                              {task.description && (
                                <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                              )}
                              
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                {task.due_date && (
                                  <div className="flex items-center space-x-1">
                                    <FaCalendarAlt size={12} />
                                    <span className={task.due_date && new Date(task.due_date) < new Date() && !task.is_completed ? 'text-red-600 font-medium' : ''}>
                                      Due: {formatDate(task.due_date)}
                                      {task.due_date && new Date(task.due_date) < new Date() && !task.is_completed && ' (Overdue)'}
                                    </span>
                                  </div>
                                )}
                                <span>Created: {formatDate(task.created_at)}</span>
                                {task.updated_at !== task.created_at && (
                                  <span>Updated: {formatDate(task.updated_at)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            {!task.is_completed && (
                              <button
                                onClick={() => handleMarkComplete(task.id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Mark as complete"
                              >
                                <FaCheck size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => handleEditTask(task)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit task"
                            >
                              <FaEdit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete task"
                            >
                              <FaTrash size={16} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Stage Overview Sidebar */}
            <div className="w-64 border-l border-gray-200 overflow-y-auto p-4 bg-gray-50">
              <h3 className="font-semibold text-gray-700 mb-4">Relocation Stages</h3>
              <div className="space-y-3">
                {RELOCATION_STAGES.map((stage) => {
                  const stageData = tasksByStage[stage.value]
                  return (
                    <div
                      key={stage.value}
                      className={`p-3 rounded-lg cursor-pointer hover:bg-white transition-colors ${stageFilter === stage.value ? 'bg-white border border-blue-200' : 'bg-gray-100'}`}
                      onClick={() => setStageFilter(stageFilter === stage.value ? 'all' : stage.value)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getStageIcon(stage.value)}</span>
                          <span className="font-medium text-sm text-gray-800">{stage.label}</span>
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {stageData.completed}/{stageData.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ 
                            width: stageData.total > 0 
                              ? `${(stageData.completed / stageData.total) * 100}%` 
                              : '0%' 
                          }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Create/Edit Task Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={resetForm}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {editingTask ? 'Edit Task' : 'Create New Task'}
                  </h3>
                  <button
                    onClick={resetForm}
                    className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={taskData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter task title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={taskData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter task description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stage *
                      </label>
                      <select
                        name="stage"
                        value={taskData.stage}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {RELOCATION_STAGES.map((stage) => (
                          <option key={stage.value} value={stage.value}>
                            {stage.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        name="due_date"
                        value={taskData.due_date}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 cursor-pointer font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {createLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>{editingTask ? 'Updating...' : 'Creating...'}</span>
                      </>
                    ) : (
                      <span>{editingTask ? 'Update Task' : 'Create Task'}</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  )
}

export default TaskView