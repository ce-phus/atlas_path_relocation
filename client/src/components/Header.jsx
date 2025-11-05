import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from "react-router-dom";
import { IoNotifications } from "react-icons/io5";
import { logo } from '../assets';
import { AiOutlineMenuUnfold } from "react-icons/ai";
import { FaUser } from "react-icons/fa";
import { getProfile } from '../actions/profileActions';
import { GrClose } from "react-icons/gr";

const Header = ({ toggleSidebar, isSidebarOpen }) => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.userLoginReducer);

  const { profile, error, loading } = useSelector((state) => state.getProfileReducer);

    useEffect(()=> {
        if (!profile) {
            dispatch(getProfile());
        }
    }, [dispatch, profile]);

  return (
    <nav className='fixed w-full h-16 p-2 top-0 bg-white border-b border-gray-300 flex items-center justify-between z-50'>
      <div className='flex items-center'>
        <button
          className='flex items-center text-black p-3 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer'
          onClick={toggleSidebar}
        >
          <AiOutlineMenuUnfold size={25} />
        </button>

        <Link to="/" className="ml-2">
          <img src={logo} alt="Logo" className='h-8'/>
        </Link>
      </div>

      <div className='flex items-center space-x-4'>
        <div className="relative">
          <IoNotifications 
            size={25} 
            className='text-gray-600 hover:text-gray-900 cursor-pointer transition-colors' 
          />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            3
          </span>
        </div>
        
        <Link to={'/profile'} className="flex flex-col items-center space-x-2 cursor-pointer group">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <FaUser size={16} className="text-gray-600" />
          </div>
          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 hidden md:block">
            {profile?.user.first_name || 'User'}
          </span>
        </Link>
      </div>
    </nav>
  )
}

export default Header;