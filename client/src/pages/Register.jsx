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
    const [re_password, setConfirmPassword] = useState('');
    const [message, setMessage] = useState("");
    const [usererror, setError] = useState("");
    const [infoMessage, setInfoMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    
    const { loading, error, userInfo } = useSelector((state) => state.userRegisterReducer);

    const dismissError = () => {
      setError(null);
    };
  
    const dismissMessage = () => {
      setMessage(null);
    };
  
    const dismissInfoMessage = () => {
      setInfoMessage(null);
    };
  
    useEffect(() => {
      if (userInfo) {
        setInfoMessage("An activation link has been sent to your email");
      }
    }, [userInfo]);

    useEffect(() => {
      if (error) {
        setError(error);
      }
    }, [error]);

    const handleSubmit = (e) => {
      e.preventDefault();
      if (password !== re_password) {
        setError("Passwords do not match");
      } else {
        dispatch(register(firstName, lastName, username, email, password, re_password));
      }
    }

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    }

    const toggleConfirmPasswordVisibility = () => {
      setShowConfirmPassword(!showConfirmPassword);
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

      const eyeButtonVariants = {
        hover: {
          scale: 1.1,
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          transition: { duration: 0.2 }
        },
        tap: {
          scale: 0.9
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
          
          {usererror && 
            <motion.div initial='hidden' animate='show' variants={variants} className="bg-red-50 border border-red-200  rounded-lg p-4 text-red-600 text-sm flex mb-2">
              <svg className="shrink-0 w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
              </svg>
              <p className='font-medium'>{usererror}</p>
              <button onClick={dismissError} type="button" className="ms-auto -mx-1.5 -my-1.5 bg-yellow-50 text-red-900 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-700 inline-flex items-center justify-center h-8 w-8 dark:bg-yellow-900 dark:text-red-500 dark:hover:bg-yellow-700" data-dismiss-target="#alert-1" aria-label="Close">
                <span className="sr-only">Close</span>
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                </svg>
              </button>
            </motion.div>}
          {message && 
            <motion.div initial='hidden' animate='show' variants={variants} className="bg-red-50 border border-red-200  rounded-lg p-4 text-red-600 text-sm flex mb-2">
              <svg className="shrink-0 w-4 mt-1 h-4 mt-1 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
              </svg>
              <p className='font-medium'>{message}</p>
              <button type="button" onClick={dismissMessage} className="ms-auto -mx-1.5 -my-1.5 bg-yellow-50 text-red-900 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-700 inline-flex items-center justify-center h-8 w-8 dark:bg-yellow-900 dark:text-red-500 dark:hover:bg-yellow-700" data-dismiss-target="#alert-1" aria-label="Close">
                <span className="sr-only">Close</span>
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                </svg>
              </button>
            </motion.div>}
          {infoMessage && 
            <motion.div initial='hidden' animate='show' variants={variants} className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg flex mb-2">
              <svg className="shrink-0 w-4 mt-1 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
              </svg>
              <p className='font-medium'>{infoMessage}</p>
              <button onClick={dismissInfoMessage} type="button" className="ms-auto -mx-1.5 -my-1.5 bg-green-50 text-green-500 rounded-lg focus:ring-2 focus:ring-blue-400 p-1.5 hover:bg-green-200 inline-flex items-center justify-center h-8 w-8 dark:bg-green-900 dark:text-green-500 dark:hover:bg-green-700" data-dismiss-target="#alert-1" aria-label="Close">
                <span className="sr-only">Close</span>
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                </svg>
              </button>
            </motion.div>}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                whileFocus="focus"
                placeholder='Enter your email'
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <label htmlFor='username' className='block text-sm font-medium text-black/80 mb-2'>
               Username
              </label>
              <motion.input
                type='text'
                id='username'
                className='w-full px-4 py-3 rounded-lg bg-white/10 border border-black/20 text-gray-800 placeholder-white/40 focus:outline-none backdrop-blur-sm'
                variants={inputVariants}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
              <div className="relative">
                <motion.input
                  type={showPassword ? 'text' : 'password'}
                  id='password'
                  className='w-full px-4 py-3 rounded-lg bg-white/10 border border-black/20 text-gray-800 placeholder-white/40 focus:outline-none backdrop-blur-sm pr-12'
                  variants={inputVariants}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  whileFocus="focus"
                  placeholder='Create a password'
                />
                <motion.button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 cursor-pointer hover:text-gray-800 focus:outline-none p-1 rounded-full"
                  onClick={togglePasswordVisibility}
                  variants={eyeButtonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.02 9.02l3.411 3.411M9.88 9.88l3.413-3.412" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
                <label htmlFor='confirmPassword' className='block text-sm font-medium text-black/80 mb-2'>
                Confirm Password
                </label>
                <div className="relative">
                  <motion.input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id='confirmPassword'
                    className='w-full px-4 py-3 rounded-lg bg-white/10 border border-black/20 text-gray-800 placeholder-white/40 focus:outline-none backdrop-blur-sm pr-12'
                    variants={inputVariants}
                    value={re_password}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    whileFocus="focus"
                    placeholder='Confirm password'
                  />
                  <motion.button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none p-1 cursor-pointer rounded-full"
                    onClick={toggleConfirmPasswordVisibility}
                    variants={eyeButtonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.02 9.02l3.411 3.411M9.88 9.88l3.413-3.412" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </motion.button>
                </div>
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