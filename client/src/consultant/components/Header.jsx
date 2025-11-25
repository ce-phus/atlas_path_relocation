import React from 'react'
import { AiOutlineMenuUnfold } from "react-icons/ai";
import { logo } from '../../assets';
import { Link } from 'react-router-dom';
import { IoNotifications } from "react-icons/io5";
import { FaUser, FaPlus } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '../../actions/userActions';

const Header = () => {
  const { profile, error, loading } = useSelector((state) => state.getProfileReducer);
  const [dropdown, isDropDown] = React.useState(false);
  const dispatch = useDispatch();

  const dropdownHandler = () => {
    isDropDown(!dropdown);
  }

  const handleLogout = () => {
    dispatch(logout());
    window.open("/", "_self");
  }

  // Dropdown animation variants
  const dropdownVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.1,
        ease: "easeOut"
      }
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  // Item animation variants for staggered children
  const itemVariants = {
    hidden: { 
      opacity: 0, 
      x: -10 
    },
    visible: { 
      opacity: 1, 
      x: 0 
    }
  };

  return (
    <nav
      className='fixed w-full h-16 p-2 top-0 bg-white border-b border-gray-300 flex items-center justify-between z-50'
    >
      <div className='flex items-center'>
        <button
          className='flex items-center text-black p-3 hover:bg-gray-100 rounded-lg transition-colors md:hidden cursor-pointer'
        >
          <AiOutlineMenuUnfold size={25} />
        </button>

        <Link to="/" className="ml-2">
          <img src={logo} alt="Logo" className='h-15'/>
        </Link>
      </div>

      <div className='flex items-center space-x-4 relative'>
        <div className="relative">
          <IoNotifications 
            size={25} 
            className='text-gray-600 hover:text-gray-900 cursor-pointer transition-colors' 
          />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            3
          </span>
        </div>

        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          <FaPlus size={16} className="text-gray-600" />
        </div>
        
        <button
          onClick={dropdownHandler}
          className="flex flex-col items-center space-x-2 cursor-pointer group"
        >
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <FaUser size={16} className="text-gray-600" />
          </div>
          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 hidden md:block">
            {profile?.user.first_name || 'User'}
          </span>
        </button>

        <AnimatePresence>
          {dropdown && (
            <motion.div
              key="dropdown"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={dropdownVariants}
              className="absolute right-0 top-16 bg-white border border-gray-300 rounded-lg shadow-lg w-48 py-2 overflow-hidden"
              style={{ originX: 0.9, originY: 0 }}
            >
              <motion.div
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.05
                    }
                  }
                }}
              className='text-center'>
                <motion.div variants={itemVariants}>
                  <Link 
                    to="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Profile
                  </Link>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Link 
                    to="/settings"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Settings
                  </Link>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <button 
                    onClick={handleLogout}
                    className="block px-4 cursor-pointer w-full py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Logout
                  </button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

export default Header