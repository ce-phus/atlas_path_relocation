import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { markTaskComplete } from '../actions/profileActions'

const TasksSection = ({ profile, expanded = false }) => {
  const dispatch = useDispatch();
  const { tasks, tasksloading, taskerror } = useSelector((state) => state.profileReducer);
  console.log("tasks: ", tasks);

  const handleMarkComplete= (taskId) => {
    dispatch(markTaskComplete(taskId));
  }

  if (tasksloading) {
    return <div>Loading tasks...</div>;
  }
  if (taskerror) {
    return <div>Error loading tasks: {taskerror}</div>;
  }

  const displayTasks = expanded ? tasks : tasks.results?.slice(0, 3);
  console.log("displayTasks: ", displayTasks);
  return (
    <div className='bg-white rounded-lg p-6'>
      <div className='flex justify-between items-center mb-4'>
      <h2 className="text-lg font-medium text-gray-900">Tasks</h2>

      {!expanded && tasks?.length > 5 && (
          <span className="text-sm text-gray-500">
              {tasks.length - 5} more tasks
          </span>
      )}
      </div>

      {!tasks || tasks.results?.length === 0 ? (
        <div className="text-center py-8">
         <div className="text-gray-400 mb-2">
             <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
             </svg>
         </div>
         <p className="text-gray-500">No tasks assigned yet</p>
        </div>
      ) : (
        <div className='space-y-3'>
        {displayTasks?.map((task) => (
          <div className={`flex items-start space-x-3 p-3 rounded-lg border ${task.is_completed
          ? "bg-green-50 border-green-200"
        : "bg-whie border-gray-200 hover:bg-gray-50"}`}>
            <button
            onClick={()=> !task.is_completed && handleMarkComplete(task.id)}
            className={`flex shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 cursor-pointer ${
              task.is_completed
              ? "bg-green-500 border-green-500 cursor-default"
              : "bg-white border-gray-400 hover:border-indigo-500 cursor-pointer"
            }`}>
              {task.is_completed && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>

            <div className='flex-1 min-w-0'>
                <h3 className={`text-sm font-medium ${
                  task.is_completed ? "text-gray-500 line-through" : "text-gray-900"
                }`}>{task?.title}</h3>

                {task?.description && (
                  <p className={`text-sm mt-1 ${
                    task.is_completed ? "text-gray-400 line-through" : "text-gray-600"
                  }`}>{task?.description}</p>
                )}

                {task.due_date && (
                  <p className={`text-xs mt-1 ${
                      new Date(task.due_date) < new Date() && !task.is_completed
                          ? 'text-red-500 font-medium'
                          : 'text-gray-400'
                  }`}>
                      Due: {new Date(task.due_date).toLocaleDateString()}
                      {new Date(task.due_date) < new Date() && !task.is_completed && ' (Overdue)'}
                  </p>
                )}
                {!expanded && tasks?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">
                          {tasks.filter(t => t.is_completed).length} of {tasks.length} completed
                      </span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ 
                                  width: `${(tasks.filter(t => t.is_completed).length / tasks.length) * 100}%` 
                              }}
                          ></div>
                      </div>
                  </div>
              </div>
                )}
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  )
}

export default TasksSection