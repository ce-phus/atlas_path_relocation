import { motion } from 'framer-motion'
import { logo } from '../assets'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from "react-redux"
import { register } from '../actions/userActions'

const Register = () => {
    const dispatch = useDispatch()
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = () => {
        dispatch(register(username, firstName, lastName, email, password, confirmPassword))
    }

    const { loading, error } = useSelector((state) => state.userRegisterReducer);
    

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
      className='bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative overflow-hidden'
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

        <div className='relative z-10'>
          <motion.div
            className='text-center mb-6'
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <img 
            src={logo}
            className='w-20 h-20 flex justify-center mx-auto mb-4'
            />
            <h1 className='text-3xl font-light text-black mb-2'>Create Your Account</h1>
            <p className='text-black/70 font-medium'>Let's get started with Atlas Path</p>

          </motion.div>

          <form className='space-y-6' onSubmit={handleSubmit}>
            <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            >
                <div className='flex flex-col md:flex-row justify-between gap-6'>
                    <div className='flex-1'>
                        <label htmlFor='firstName' className='block text-sm font-medium text-black/80 mb-2'>
                            First Name
                        </label>
                        <motion.input 
                            type='text' 
                            id='firstName' 
                            className='w-full px-4 py-3 rounded-lg bg-white/10 border border-black/20 text-gray-800 placeholder-white/40 focus:outline-none backdrop-blur-sm'
                            variants={inputVariants}
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            whileFocus="focus"
                            placeholder='First Name'
                        />
                    </div>
                    <div className='flex-1'>
                        <label htmlFor='lastName' className='block text-sm font-medium text-black/80 mb-2'>
                            Last Name
                        </label>
                        <motion.input 
                            type='text' 
                            id='lastName' 
                            className='w-full px-4 py-3 rounded-lg bg-white/10 border border-black/20 text-black placeholder-white/40 focus:outline-none backdrop-blur-sm'
                            variants={inputVariants}
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            whileFocus="focus"
                            placeholder='Last Name'
                        />
                    </div>
                </div>   
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <label htmlFor='email' className='block text-sm font-medium text-black/80 mb-2'>
                Email Address
              </label>
              <motion.input
                type='email'
                id='email'
                className='w-full px-4 py-3 rounded-lg bg-white/10 border border-black/20 text-gray-800 placeholder-white/40 focus:outline-none backdrop-blur-sm'
                variants={inputVariants}
                whileFocus="focus"
                placeholder='Enter your email'
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <label htmlFor='email' className='block text-sm font-medium text-black/80 mb-2'>
               Username
              </label>
              <motion.input
                type='username'
                id='username'
                className='w-full px-4 py-3 rounded-lg bg-white/10 border border-black/20 text-gray-800 placeholder-white/40 focus:outline-none backdrop-blur-sm'
                variants={inputVariants}
                whileFocus="focus"
                placeholder='Enter username'
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <label htmlFor='password' className='block text-sm font-medium text-black/80 mb-2'>
                Password
              </label>
              <motion.input
                type='password'
                id='password'
                className='w-full px-4 py-3 rounded-lg bg-white/10 border border-black/20 text-gray-800 placeholder-white/40 focus:outline-none backdrop-blur-sm'
                variants={inputVariants}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                whileFocus="focus"
                placeholder='Create a password'
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
                <label htmlFor='password' className='block text-sm font-medium text-black/80 mb-2'>
                Confirm Password
                </label>
                <motion.input
                type='password'
                id='password'
                className='w-full px-4 py-3 rounded-lg bg-white/10 border border-black/20 text-gray-800 placeholder-white/40 focus:outline-none backdrop-blur-sm'
                variants={inputVariants}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                whileFocus="focus"
                placeholder='Confirm password'
                />
                </motion.div>
                <motion.button
                type='submit'
                className='w-full bg-[#1F1C7A] text-white py-3 px-4 rounded-xl cursor-pointer font-semibold transition-all duration-200 backdrop-blur-sm border border-[#1F1C7A]/30 mt-6 flex items-center justify-center min-h-[48px]'
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
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
                    'Sign Up'
                )}
                </motion.button>
            </form>

            <motion.div 
              className='text-center mt-2'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
            >
              <p className='text-black/70 text-sm font-light'>
                Already have an account?{' '}
                <motion.a 
                  href='/sign-in' 
                  className='text-black font-medium hover:text-black/80 transition-colors duration-200'
                  whileHover={{ scale: 1.05, color: "#1F1C7A" }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign in
                </motion.a>
              </p>
            </motion.div>
        </div>
      </motion.div>

    </motion.div>
  )
}

export default Register