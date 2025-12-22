import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';


const OnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { profile } = useSelector(state => state.chatProfileReducer);
  console.log("Profile in OnlineStatus:", profile);

  useEffect(()=> {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  return (
    <div className ="flex items-center space-x-4">
      <div className='flex items-center'>
        <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span className="text-sm text-[#6B7280] ml-2 font-light">
            {isOnline ? 'Online' : 'Offline'}
          </span>
      </div>

      {profile?.custom_status && (
        <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-[#f3f4f6] rounded-full">
          <span className="text-xs text-[#6B7280] font-light">{profile.custom_status}</span>
        </div>
      )}
    </div>
  )
}

export default OnlineStatus