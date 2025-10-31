import React from 'react'
import { motion } from 'framer-motion'
import { logo } from '../assets'

const Login = () => {
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

  return (
    <motion.div 
      className='min-h-screen backdrop-blur-xl bg-slate-900/20 flex items-center justify-center p-4'
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Floating Background Elements */}
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

      {/* Glassmorphism Login Form */}
      <motion.div 
        className='bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8 w-full max-w-md relative overflow-hidden'
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Animated Background Glow */}
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
          {/* Form Header */}
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

          {/* Login Form */}
          <form className='space-y-6'>
            {/* Email Input */}
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
                className='w-full px-4 py-3 bg-black/10 border border-black/20 rounded-lg text-black placeholder-black/40 focus:outline-none transition-all duration-200 backdrop-blur-sm'
                placeholder='Enter your email'
                variants={inputVariants}
                whileFocus="focus"
              />
            </motion.div>

            {/* Password Input */}
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
                className='w-full px-4 py-3 bg-black/5 border border-black/20 rounded-lg text-black placeholder-black/40 focus:outline-none transition-all duration-200 backdrop-blur-sm'
                placeholder='Enter your password'
                variants={inputVariants}
                whileFocus="focus"
              />
            </motion.div>

            {/* Remember Me & Forgot Password */}
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
                className='text-sm text-black/70 hover:text-white transition-colors duration-200'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Forgot password?
              </motion.a>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type='submit'
              className='w-full bg-[#1F1C7A] text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 backdrop-blur-sm border border-[#1F1C7A]/30'
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
            >
              Sign In
            </motion.button>

            {/* Sign Up Link */}
            <motion.div 
              className='text-center'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
            >
              <p className='text-black/70 text-sm font-light'>
                Don't have an account?{' '}
                <motion.a 
                  href='#' 
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