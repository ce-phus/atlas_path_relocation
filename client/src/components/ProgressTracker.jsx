import React from 'react'

const ProgressTracker = ({ profile }) => {
  const stages = [
    { name: 'Initial Consultation', progress: 100 },
    { name: 'Document Collection', progress: 80 },
    { name: 'Visa Processing', progress: 60 },
    { name: 'Housing Search', progress: 40 },
    { name: 'School Enrollment', progress: 20 },
    { name: 'Final Relocation', progress: 10 }
];

  return (
    <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Relocation Progress</h2>
            
            {/* Overall Progress */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                    <span className="text-sm font-bold text-blue-600">{profile?.overall_progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${profile?.overall_progress || 0}%` }}
                    ></div>
                </div>
            </div>

            {/* Stage Progress */}
            <div className="space-y-4">
                {stages.map((stage, index) => (
                    <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex-1">{stage.name}</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2 mx-4">
                            <div 
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${stage.progress}%` }}
                            ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 w-8 text-right">
                            {stage.progress}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
  )
}

export default ProgressTracker