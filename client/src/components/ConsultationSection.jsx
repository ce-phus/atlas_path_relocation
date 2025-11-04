import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { assignConsultant } from '../actions/profileActions';

const ConsultationSection = ({profile, expanded = false}) => {
  const dispatch = useDispatch();
  console.log("profile: "), profile


  const { loading } = useSelector((state)=> state.profileReducer)
  const [showAssignModal, setShowAssignModal] = useState(false);

  const handleAssignConsultant = (consultantId) => {
    dispatch(assignConsultant(consultantId));
    setShowAssignModal(false);
  }
  return (
    <div className='bg-white shadow rounded-lg p-6'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl  text-black font-light'>Consultation</h2>
        {!profile?.relocation_consultant && (
          <button
            onClick={() => setShowAssignModal(true)}
            className='bg-indigo-600 text- px-4 py-2 rounded hover:bg-indigo-700 transition-colors'
          >
            Assign Consultant
          </button>
        )}
      </div>

      {profile?.relocation_consultant ? (
        <div className='space-y-4'>
          <div className='flex items-center space-x-4'>
            <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center'>
              <span className='text-xl font-semibold text-blue-600'>
                {profile.consultant_name.charAt(0) || "C"}
              </span>
            </div>

            <div>
              <h3 className='text-lg font-medium text-black'>
                {profile.consultant_name}
              </h3>
              <p className='text-gray-600'>{profile.consultant_employee_id}</p>
              <p className='text-gray-600'>{profile.consultant_details?.specialization}</p>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div className=''>
              <span className='text-gray-500'>Experience</span>
              <p className='font-light text-black mt-1'>{profile.consultant_details?.years_experience} years</p>
            </div>

            <div className=''>
              <span className='text-gray-500'>Status</span>
              <p className='font-light text-black bg-green-100 mt-2 text-center border border-green-500 rounded-lg p-1.5 text-green-600'>{profile?.consultant_details?.availability_status}</p>
            </div>

            <div>
              <span className="text-gray-500">Phone:</span>
              <p className="font-light text-black">{profile.consultant_details?.work_phone}</p>
            </div>
            <div>
                <span className="text-gray-500">Email:</span>
                <p className="font-light text-black">{profile.consultant_details?.work_email || "N/A"}</p>
            </div>
          </div>
          {profile.consultant_details?.bio && (
              <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">About</h4>
                  <p className="text-sm text-gray-600">{profile.consultant_details.bio}</p>
              </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
                <svg className="mx-auto h-12 w-12 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            </div>
            <p className="text-gray-500 font-light">No consultant assigned yet</p>
            <p className="text-sm font-light text-gray-700 mt-1">A consultant will help guide you through your relocation process</p>
        </div>
      )}
    </div>
  )
}

export default ConsultationSection