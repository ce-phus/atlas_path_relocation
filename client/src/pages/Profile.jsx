import React, { useEffect, useState } from 'react'
import { Layout, Skeleton, ProfileForm, DocumentSection, ConsultationSection, ProgressTracker } from '../components'
import { useDispatch, useSelector } from 'react-redux'
import { loadProfile, getProfile } from "../actions/profileActions"
import { motion } from 'framer-motion'

const Profile = () => {
    const dispatch = useDispatch();
    const { profile, error, loading } = useSelector((state) => state.getProfileReducer);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(()=> {
        if (!profile) {
            dispatch(getProfile());
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