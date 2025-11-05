import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { markTaskComplete } from '../actions/profileActions';

const TasksSection = ({ profile, expanded = false }) => {
  const dispatch = useDispatch();
  const { tasks, tasksloading, taskerror } = useSelector((state) => state.profileReducer);
  console.log('Tasks in TasksSection:', tasks);

  const handleMarkComplete = (taskId) => {
    dispatch(markTaskComplete(taskId));
  };

  if (tasksloading) return <div>Loading tasks...</div>;
  if (taskerror) return <div>Error loading tasks: {taskerror}</div>;

  // Make it flexible whether tasks is an array or paginated object
  const allTasks = Array.isArray(tasks) ? tasks : tasks?.results || [];
  const displayTasks = expanded ? allTasks : allTasks.slice(0, 3);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>

        {!expanded && allTasks.length > 5 && (
          <span className="text-sm text-gray-500">
            {allTasks.length - 5} more tasks
          </span>
        )}
      </div>

      {allTasks.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-gray-400 mb-3">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-gray-500">No tasks assigned yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-start space-x-3 p-4 rounded-xl border transition ${
                task.is_completed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              {/* Completion button */}
              <button
                onClick={() => !task.is_completed && handleMarkComplete(task.id)}
                className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${
                  task.is_completed
                    ? 'bg-green-500 border-green-500 cursor-default'
                    : 'bg-white border-gray-400 hover:border-indigo-500 cursor-pointer'
                }`}
              >
                {task.is_completed && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>

              {/* Task details */}
              <div className="flex-1 min-w-0">
                <h3
                  className={`text-sm font-medium ${
                    task.is_completed
                      ? 'text-gray-500 line-through'
                      : 'text-gray-900'
                  }`}
                >
                  {task.title}
                </h3>

                {/* ✅ Stage Display */}
                {task.stage && (
                  <span
                    className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                      task.is_completed
                        ? 'bg-green-100 text-green-700'
                        : 'bg-indigo-50 text-indigo-600'
                    }`}
                  >
                    Stage: {task.stage}
                  </span>
                )}

                {task.description && (
                  <p
                    className={`text-sm mt-2 ${
                      task.is_completed
                        ? 'text-gray-400 line-through'
                        : 'text-gray-600'
                    }`}
                  >
                    {task.description}
                  </p>
                )}

                {task.due_date && (
                  <p
                    className={`text-xs mt-2 ${
                      new Date(task.due_date) < new Date() && !task.is_completed
                        ? 'text-red-500 font-medium'
                        : 'text-gray-400'
                    }`}
                  >
                    Due: {new Date(task.due_date).toLocaleDateString()}
                    {new Date(task.due_date) < new Date() &&
                      !task.is_completed &&
                      ' (Overdue)'}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Progress bar for Overview view */}
      {!expanded && allTasks.length > 0 && (
        <div className="mt-5 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">
              {allTasks.filter((t) => t.is_completed).length} of{' '}
              {allTasks.length} completed
            </span>
            <div className="w-28 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    (allTasks.filter((t) => t.is_completed).length /
                      allTasks.length) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksSection;
