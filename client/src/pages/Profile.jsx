import React, { useEffect, useState } from 'react'
import { Layout, Skeleton, ProfileForm, DocumentSection, ConsultationSection, ProgressTracker, ProfileHeader, TasksSection, Overview, ProfileAbout } from '../components'
import { useDispatch, useSelector } from 'react-redux'
import { loadProfile, getProfile, loadTasks, loadAvailableConsultants, loadDocuments } from "../actions/profileActions"
import { motion } from 'framer-motion'

const Profile = () => {
    const dispatch = useDispatch();
    const { profile, error, loading } = useSelector((state) => state.getProfileReducer);
    const { tasks } = useSelector((state)=> state.profileReducer)
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(()=> {
        if (!profile) {
            dispatch(getProfile());
            dispatch(loadProfile());
            dispatch(loadTasks());
            dispatch(loadDocuments());

            if (profile?.relocation_consultant) {
                dispatch(loadAvailableConsultants());
            }
        }
    }, [dispatch, profile, profile?.relocation_consultant]);
  return (
    <Layout>
        <div className='min-h-screen'>
            {loading ? (
                <Skeleton />
            ): error ? (
                <div>{error}</div>
            ): (
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <ProfileHeader profile={profile} />

                    <div className='mt-6 border-b border-gray-300'>
                        <nav className='-mb-px flex space-x-8'>
                            {[
                                { name: 'Overview', id: 'overview' },
                                { name: 'About', id: 'about' },
                                { name: 'Edit Profile', id: 'edit' },
                                { name: 'Documents', id: 'documents' },
                                { name: 'Consultant', id: 'consultant' },
                                { name: 'Task', id: 'task' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm  cursor-pointer ${
                                        activeTab === tab.id
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {tab.name}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className='mt-6'>
                        {activeTab === 'overview' && (
                            <Overview profile={profile} tasks={tasks}/>
                        )}
                        {activeTab === 'about' && (
                            <ProfileAbout profile={profile} />
                        )}
                        {activeTab === 'edit' && (
                            <ProfileForm profile={profile} />
                        )}
                        {activeTab === 'documents' && (
                            <DocumentSection profile={profile} expanded={true}/>
                        )}
                        {activeTab === 'consultant' && (
                            <ConsultationSection profile={profile} expanded={true}/>
                        )}
                        {activeTab === 'task' && (
                            <div>
                                <TasksSection profile={profile} expanded={true}/>
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    </Layout>
  )
}

export default Profile