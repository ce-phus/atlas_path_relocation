import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProgress } from "../actions/profileActions";

const ProgressTracker = ({ profile }) => {
  const dispatch = useDispatch();
  const { progress, loading, error } = useSelector((state) => state.progressReducer);

  useEffect(() => {
    if (profile?.id) {
      dispatch(fetchProgress(profile.id));
    }
  }, [dispatch, profile]);

  if (loading) return <div>Loading progress...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!progress?.stages) return <div>No progress data available</div>;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Relocation Progress</h2>

      {/* Overall Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-bold text-blue-600">
            {progress.overall_progress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress.overall_progress || 0}%` }}
          ></div>
        </div>
      </div>

      {/* Stage Progress */}
      <div className="space-y-5">
        {progress.stages.map((stage, index) => (
          <div key={index} className="border-t border-gray-100 pt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-800">{stage.name}</span>
              <span className="text-sm text-gray-600">
                {stage.completed_tasks} / {stage.total_tasks}{" "}
                <span className="text-gray-400">({stage.progress}%)</span>
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`${
                  stage.progress === 100 ? "bg-green-500" : "bg-green-400"
                } h-2 rounded-full transition-all duration-500`}
                style={{ width: `${stage.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressTracker;
