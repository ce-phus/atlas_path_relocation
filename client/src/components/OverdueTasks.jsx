// components/OverdueTasks.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { markTaskComplete, loadOverdueTasks } from '../actions/profileActions';

const OverdueTasks = ({ tasks = [] }) => {
  const dispatch = useDispatch();

  const { overdueTasks } = useSelector((state)=>state.profileReducer)
  console.log("Overdue Tasks:", overdueTasks);

  useEffect(()=> {
    dispatch(loadOverdueTasks());
  }, [dispatch]);

  const handleMarkComplete = (taskId) => {
    dispatch(markTaskComplete(taskId));
  };

  if (overdueTasks.length === 0) {
    return null;
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="ml-2 text-lg font-medium text-red-900">Overdue Tasks</h2>
        <span className="ml-auto bg-red-600 text-white text-sm font-medium px-2 py-1 rounded-full">
          {overdueTasks.length}
        </span>
      </div>

      <div className="space-y-3">
        {overdueTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between p-3 bg-white border border-red-200 rounded-lg hover:bg-red-50"
          >
            <div className="flex items-center space-x-3 flex-1">
              <button
                onClick={() => handleMarkComplete(task.id)}
                className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-red-300 hover:border-red-500 flex items-center justify-center"
              >
                <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-red-900 truncate">
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-sm text-red-700 mt-1 truncate">{task.description}</p>
                )}
                <p className="text-xs text-red-500 mt-1">
                  Due: {new Date(task.due_date).toLocaleDateString()} • {task.stage_display}
                </p>
              </div>
            </div>
            
            <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded">
              Overdue
            </span>
          </div>
        ))}
      </div>

      <p className="text-sm text-red-700 mt-3">
        ⚠️ These tasks are past their due date. Please complete them as soon as possible.
      </p>
    </div>
  );
};

export default OverdueTasks;