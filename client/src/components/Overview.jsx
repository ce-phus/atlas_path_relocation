import React from 'react'
import ProgressTracker from './ProgressTracker'
import TasksSection from './TasksSection'
import ConsultationSection from './ConsultationSection'
import DocumentSection from './DocumentSection'
import OverdueTasks from './OverdueTasks'

const Overview = ({ profile, tasks }) => {
    const tasksArray = Array.isArray(tasks) ? tasks : (tasks?.results || tasks?.data || []);
  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2 space-y-6'>
            <OverdueTasks tasks={tasksArray} />
            <ProgressTracker profile={profile} />
            <TasksSection profile={profile} tasks={tasks} expanded={false}/>
        </div>
        <div className='lg:col-span-1 space-y-6'>
            <ConsultationSection profile={profile} expanded={false} />
            <DocumentSection profile={profile} expanded={false} />
        </div>
    </div>
  )
}

export default Overview