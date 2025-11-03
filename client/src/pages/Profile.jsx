import React, { useEffect, useState } from 'react'
import { Layout, Skeleton } from '../components'
import { useDispatch, useSelector } from 'react-redux'
import { loadProfile } from "../actions/profileActions"

const Profile = () => {
    const dispatch = useDispatch();
    const { profile, error, loading } = useSelector((state) => state.profileReducer);
    const [activeTab, setActiveTab] = useState('overview');
    console.log("Profile: ", profile);

    useEffect(()=> {
        if (!profile) {
            dispatch(loadProfile());
        }
    }, [dispatch, profile]);
  return (
    <Layout>
        <div className='min-h-screen bg-gray-50 py-8'>
            {loading ? (
                <Skeleton />
            ): error ? (
                <div>{error}</div>
            ): (
                <div className='max-w-7xl mx-auto px-4 '>
                </div>
            )}
        </div>
    </Layout>
  )
}

export default Profile