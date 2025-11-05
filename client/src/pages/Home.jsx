import React, { useEffect } from 'react'
import { Layout, Skeleton, Overview } from '../components'
import { useDispatch, useSelector } from 'react-redux'
import { loadProfile, loadTasks, loadAvailableConsultants, loadOverdueTasks } from '../actions/profileActions'

const Home = () => {
  const dispatch = useDispatch();
  const { profile, error, loading, } = useSelector((state) => state.getProfileReducer);
  const {  tasks } = useSelector((state) => state.profileReducer);

  useEffect(()=> {
    if (!profile) {
      dispatch(loadProfile());
    };

    if (!tasks) {
      dispatch(loadTasks());
    };
    if (profile?.relocation_consultant) {
      dispatch(loadAvailableConsultants());
    };
  }, [dispatch, profile, tasks, profile?.relocation_consultant]);

  if (loading) {
    return (
      <Layout>
        <Skeleton />
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong>Error loading dashboard:</strong> {error}
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  return (
    <Layout>
      <div className='min-h-screen bg-white py-8'>
        <div className='max-w-7xl mx-auto sm:px-6 lg:px-8'>
          <div className='mb-8 bg-gradient-to-r from-indigo-700 to-indigo-200 p-3 rounded-lg'>
            <h1 className='text-3xl font-light text-white'>Welcome Back, {profile?.full_name}!</h1>
            <p className='mt-1'>{profile?.email}</p>
            <div className='flex-1 min-w-0 mt-3'>
              <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800'>
                {profile?.relocation_type?.replace('_', ' ') || 'No relocation type set'}
              </span>
              <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 ml-2'>
               Your Relocation to Surrey is {profile?.overall_progress}% Complete
              </span>
            </div>
          </div>
        </div>

        <Overview profile={profile} tasks={tasks} />
      </div>
    </Layout>
  )
}

export default Home