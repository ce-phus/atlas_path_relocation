import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from "framer-motion"
import { fetchBudgetData } from '../actions/budgetActions'

export const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

export const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 12
        }
    }
};

const BudgetSection = ({ profile, expanded=false }) => {
    const dispatch = useDispatch();
    const { loading, error, budgetSummary } = useSelector((state)=> state.budgetReducer)

    useEffect(()=> {
        dispatch(fetchBudgetData())
    }, [dispatch,])

    if (loading) {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-white to-gray-50/80 shadow-xl rounded-2xl p-6 border border-gray-100/60 backdrop-blur-sm"
            >
                <div className="animate-pulse space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="h-6 bg-gray-200 rounded w-32"></div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-16 bg-gray-200 rounded-xl"></div>
                        <div className="h-16 bg-gray-200 rounded-xl"></div>
                    </div>
                </div>
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-white to-red-50/80 shadow-xl rounded-2xl p-6 border border-red-100/60 backdrop-blur-sm"
            >
                <div className="text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Budget Data Unavailable</h3>
                    <p className="text-gray-600 text-sm">Unable to load budget information</p>
                    <p className="text-gray-600 text-sm">{error}</p>
                </div>
            </motion.div>
        );
    }

    const utilizationPercentage = budgetSummary?.total_budget ? (budgetSummary?.total_spent / budgetSummary?.total_budget) * 100 : 0;
  return (
    <div
    className="bg-gradient-to-br from-white to-gray-50/80 shadow-xl rounded-2xl p-6 border border-gray-100/60 backdrop-blur-sm"
    >
        <div className='flex justify-between items-center mb-6'>
            <div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center mb-6 bg-gradient-to-r from-gray-800 to-indigo-600 bg-clip-text text-transparent inline-block [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                    Budget Overview
                </h2> 
                <p className="text-sm text-gray-500 mt-1">Your relocation budget status</p>
            </div>
            <motion.div
                whileHover={{ scale: 1.05 }}
                className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full"
            >
                {utilizationPercentage.toFixed(1)}% Used
            </motion.div>
        </div>
        <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
        >
            <motion.div
            variants={itemVariants} className="space-y-2"
            >
                <div className='flex justify-between text-sm text-gray-600'>
                    <span>Budget Utilization</span>
                    <span>${budgetSummary?.total_spent?.toLocaleString()} / ${budgetSummary?.total_budget?.toLocaleString()}</span>
                </div>
                <div
                className='w-full bg-gray-200 rounded-full h-3'>
                    <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-3 rounded-full ${
                        utilizationPercentage > 90 ? 'bg-red-500':
                        utilizationPercentage > 70 ? 'bg-amber-500' :
                        'bg-green-500'
                    }`}
                    />
                </div>
            </motion.div>

            <motion.div
            variants={containerVariants}
            className="grid grid-cols-2 gap-4"
            >
                <motion.div
                    variants={itemVariants}
                    className="bg-white/80 rounded-xl p-4 border border-gray-100 shadow-sm"
                >
                    <div className="text-2xl font-bold text-green-600">
                        ${budgetSummary?.remaining_budget?.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">Remaining</div>
                </motion.div>
                <motion.div
                    variants={itemVariants}
                    className="bg-white/80 rounded-xl p-4 border border-gray-100 shadow-sm"
                >
                    <div className="text-2xl font-bold text-indigo-600">
                        ${budgetSummary?.total_allocated?.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Allocated</div>
                </motion.div>
            </motion.div>

            {budgetSummary?.categories.slice(0,3).map((category, index)=> (
                <motion.div
                key={category.category}
                variants={itemVariants}
                className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-gray-100"
                >
                    <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                            index === 0 ? 'bg-blue-500' :
                            index === 1 ? 'bg-green-500' : 'bg-purple-500'
                        }`} />
                        <span className="text-sm font-medium text-gray-700">{category.category}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                        ${category.spent?.toLocaleString()} / ${category.allocated?.toLocaleString()}
                    </div>
                </motion.div>
            ))}

            {expanded && budgetSummary?.categories.length > 3 && (
                <motion.div variants={itemVariants} className="text-center">
                    <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                        + {budgetSummary.categories.length - 3} more categories
                    </button>
                </motion.div>
            )}
             {!expanded && (
                <motion.div 
                    variants={itemVariants}
                    className="mt-6 pt-4 border-t border-gray-200/60"
                >
                    <motion.a
                        href="/budget"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-3 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                        View Full Budget Details
                    </motion.a>
                </motion.div>
            )}
        </motion.div>
    </div>
  )
}

export default BudgetSection