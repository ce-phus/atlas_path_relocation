import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { logo } from '../assets'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../actions/userActions'

const Login = () => {
  const dispatch = useDispatch();
  const { loading, error, userInfo } = useSelector((state) => state.userLoginReducer);
  const [email, setUserEmail] = useState('');
  const [password, setUserPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission
    
    // Basic validation
    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }
    
    setLocalError(''); // Clear previous errors
    dispatch(login(email, password));
  }

  // Clear error when component unmounts or when user starts typing
  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  const dismissError = () => {
    setLocalError('');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  const formVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: 0.2
      }
    }
  }

  const inputVariants = {
    focus: {
      scale: 1.02,
      boxShadow: "0 0 0 2px rgba(31, 28, 122, 0.3)",
      transition: { duration: 0.2 }
    }
  }

  const buttonVariants = {
    initial: {
      scale: 1,
      boxShadow: "0 4px 6px rgba(31, 28, 122, 0.2)"
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 8px 15px rgba(31, 28, 122, 0.4)",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    tap: {
      scale: 0.98,
      boxShadow: "0 2px 4px rgba(31, 28, 122, 0.3)"
    }
  }

  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }

  const slideIn = (direction, type, delay, duration) => ({
    hidden: {
      x: direction === "left" ? "-100%" : direction === "right" ? "100%" : 0,
      opacity: 0,
    },
    show: {
      x: 0,
      opacity: 1,
      transition: {
        type,
        delay,
        duration,
      },
    },
  });

  const variants = slideIn("left", "tween", 0.6, 0.5);

  return (
    <motion.div 
      className='min-h-screen backdrop-blur-xl bg-slate-900/20 flex items-center justify-center p-4'
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="absolute w-72 h-72 rounded-full bg-[#1F1C7A]/20 blur-xl"
        style={{ top: '20%', left: '10%' }}
        animate={floatingAnimation}
      />
      <motion.div 
        className="absolute w-96 h-96 rounded-full bg-[#1F1C7A]/15 blur-xl"
        style={{ bottom: '15%', right: '10%' }}
        animate={{
          ...floatingAnimation,
          y: [10, -10, 10],
          transition: { ...floatingAnimation.transition, duration: 8 }
        }}
      />

      <motion.div 
        className='bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8 w-full max-w-md relative overflow-hidden'
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="absolute -inset-1 bg-gradient-to-r from-[#1F1C7A]/30 to-[#1F1C7A]/10 rounded-2xl blur-sm"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <div className="relative z-10">
          <motion.div 
            className='text-center mb-8'
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <img 
            src={logo}
            className='w-20 h-20 flex justify-center mx-auto mb-4'
            />
            <h1 className='text-3xl font-bold text-black/80 mb-2'>Welcome Back</h1>
            <p className='text-black/70 font-light'>Sign in to your account</p>
          </motion.div>

          {/* Error Display */}
          {localError && 
            <motion.div 
              initial='hidden' 
              animate='show' 
              variants={variants} 
              className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm flex mb-4"
            >
              <svg className="shrink-0 w-4 h-4 me-2 mt-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
              </svg>
              <p className='font-medium flex-1'>{localError}</p>
              <button 
                onClick={dismissError} 
                type="button" 
                className="ms-auto -mx-1.5 -my-1.5 bg-red-50 text-red-900 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-200 inline-flex items-center justify-center h-8 w-8"
                aria-label="Close"
              >
                <span className="sr-only">Close</span>
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                </svg>
              </button>
            </motion.div>
          }

          <form className='space-y-6' onSubmit={handleSubmit}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <label htmlFor='email' className='block text-sm font-medium text-black/80 mb-2'>
                Email Address
              </label>
              <motion.input
                type='email'
                id='email'
                className='w-full px-4 py-3 bg-white/10 border border-black/20 rounded-lg text-black placeholder-black/40 focus:outline-none transition-all duration-200 backdrop-blur-sm'
                placeholder='Enter your email'
                variants={inputVariants}
                value={email}
                onChange={(e) => {
                  setUserEmail(e.target.value);
                  if (localError) setLocalError(''); // Clear error when user starts typing
                }}
                whileFocus="focus"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <label htmlFor='password' className='block text-sm font-medium text-black/80 mb-2'>
                Password
              </label>
              <motion.input
                type='password'
                id='password'
                className='w-full px-4 py-3 bg-white/10 border border-black/20 rounded-lg text-black placeholder-black/40 focus:outline-none transition-all duration-200 backdrop-blur-sm'
                placeholder='Enter your password'
                value={password}
                onChange={(e) => {
                  setUserPassword(e.target.value);
                  if (localError) setLocalError(''); // Clear error when user starts typing
                }}
                variants={inputVariants}
                whileFocus="focus"
                required
              />
            </motion.div>

            <motion.div 
              className='flex items-center justify-between'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <div className='flex items-center'>
                <motion.input
                  type='checkbox'
                  id='remember'
                  className='w-4 h-4 bg-white/5 border border-white/20 rounded focus:ring-[#1F1C7A]/30'
                  whileFocus={{ scale: 1.1 }}
                />
                <label htmlFor='remember' className='ml-2 text-sm text-black/70'>
                  Remember me
                </label>
              </div>
              <motion.a 
                href='#' 
                className='text-sm text-black/70 hover:text-black transition-colors duration-200'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Forgot password?
              </motion.a>
            </motion.div>

            <motion.button
              type='submit'
              className='w-full bg-[#1F1C7A] text-white py-3 px-4 rounded-xl cursor-pointer font-semibold transition-all duration-200 backdrop-blur-sm border border-[#1F1C7A]/30 mt-6 flex items-center justify-center min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed'
              variants={buttonVariants}
              initial="initial"
              whileHover={!loading ? "hover" : {}}
              whileTap={!loading ? "tap" : {}}
              disabled={loading}
            >
              {loading ? (
                  <svg 
                  className="animate-spin h-5 w-5 mx-auto" 
                  viewBox="0 0 24 24"
                  >
                  <circle 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      fill="none" 
                      strokeLinecap="round"
                      strokeDasharray="40 100"
                      className="text-white opacity-60"
                  />
                  </svg>
              ) : (
                  'Sign In'
              )}
            </motion.button>

            <motion.div 
              className='text-center'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
            >
              <p className='text-black/70 text-sm font-light'>
                Don't have an account?{' '}
                <motion.a 
                  href='/sign-up' 
                  className='text-black font-medium hover:text-black/80 transition-colors duration-200'
                  whileHover={{ scale: 1.05, color: "#1F1C7A" }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign up
                </motion.a>
              </p>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Login