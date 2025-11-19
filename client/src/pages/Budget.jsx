import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Layout } from '../components'
import { motion } from 'framer-motion'
import { fetchBudgetData, fetchExpenses, createExpense, submitExpenseForApproval, approveExpense } from '../actions/budgetActions';
import { containerVariants, itemVariants } from '../components/BudgetSection';

const Budget = () => {
  const dispatch = useDispatch();
  const { profile } = useSelector((state)=> state.getProfileReducer)
  const { budgetSummary, expenses, loading, error } = useSelector((state)=> state.budgetReducer)
  console.log("Profile Id: ", profile?.id);
  
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(()=> {
    dispatch(fetchBudgetData());
    dispatch(fetchExpenses());
  }, [dispatch]);

  const handleCreateExpense = (expenseData) => {
    const expenseWithCase = { ...expenseData, case: profile?.id };
    dispatch(createExpense(expenseWithCase))
        .then(() => {
            setShowExpenseForm(false);
        });
};

const getStatusColor = (status) => {
  switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'awaiting review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'submitted': 
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
  }
};

if (loading && !budgetSummary) {
  return (
      <Layout>
          <div className="min-h-screen bg-white py-8">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="animate-pulse space-y-8">
                      {/* Header Skeleton */}
                      <div className="text-center space-y-4">
                          <div className="h-10 bg-gray-200 rounded w-64 mx-auto"></div>
                          <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
                      </div>
                      
                      {/* Stats Skeleton */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          {[1, 2, 3, 4].map(i => (
                              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      </Layout>
  );
}
  return (
    <Layout>
      <div className='min-h-screen bg-white py-8'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div
          className="text-center mb-12"
          >
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-center mb-6 bg-gradient-to-r from-gray-800 to-indigo-600 bg-clip-text text-transparent inline-block [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
              Budget & Expenses
            </h1>

            <p className="text-lg font-light text-black max-w-2xl mx-auto">
                Track your relocation budget, manage expenses, and monitor spending across categories
            </p>
        </div>
        {/* Tabs */}

        <div
        className='flex space-x-1 bg-gray-100 rounded-2xl mb-8 max-w-md mx-auto'
        >
          {["overview", "expenses", "categories"].map((tab=> (
            <button
            key={tab}
            onClick={()=> setActiveTab(tab)}
            className={`flex-1 py-3 px-4 rounded-2xl cursor-pointer font-medium transition-all duration-200 ${
              activeTab === tab
              ? 'bg-white shadow-lg text-indigo-600'
              : 'text-gray-600 hover:bg-white hover:shadow-md'
            }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          )))}
        </div>

        {activeTab === 'overview' && budgetSummary && (
          <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
          >
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Budget', value: budgetSummary.total_budget, color: 'indigo' },
                    { label: 'Total Spent', value: budgetSummary.total_spent, color: 'blue' },
                    { label: 'Remaining', value: budgetSummary.remaining_budget, color: 'green' },
                    { label: 'Allocated', value: budgetSummary.total_allocated, color: 'purple' },
                ].map((stat, index) => (
                    <div key={index} className="bg-white/80 rounded-2xl p-6 border border-gray-200/60 shadow-sm">
                        <div className={`text-2xl font-bold text-${stat.color}-600 mb-2`}>
                            ${stat.value?.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">{stat.label}</div>
                    </div>
                ))}
            </motion.div>

            {/* Categories progress */}
            <motion.div
            variants={itemVariants}
            className='bg-white/80 rounded-2xl p-6 border border-gray-200/60 shadow-sm'
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Budget by Category</h3>

              <div className='space-y-4'>
                {budgetSummary?.categories?.map((category, index)=> {
                  const percentage  = category?.allocated ? (category.spent / category.allocated) * 100 : 0;

                  return (
                    <div key={index} className='space-y-2'>
                      <div className='flex justify-between text-sm'>
                        <span className="font-medium text-gray-700">{category.category}</span>
                        <span className="text-gray-600">
                            ${category.spent?.toLocaleString()} / ${category.allocated?.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                              className={`h-2 rounded-full ${
                                  percentage > 90 ? 'bg-red-500' :
                                  percentage > 75 ? 'bg-amber-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            
          </motion.div>
        )}
        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-6"
                        >
                            {/* Add Expense Button */}
                            <motion.div variants={itemVariants} className="flex justify-between items-center">
                                <h3 className="text-xl font-semibold text-gray-900">Expense History</h3>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowExpenseForm(true)}
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Add New Expense
                                </motion.button>
                            </motion.div>

                            {/* Expenses List */}
                            <motion.div variants={containerVariants} className="space-y-4">
                                {expenses.length > 0 ? (
                                    expenses.map(expense => (
                                        <motion.div
                                            key={expense.id}
                                            variants={itemVariants}
                                            className="bg-white/80 rounded-xl p-6 border border-gray-200/60 shadow-sm"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4 flex-1">
                                                    <div className="flex-1">
                                                        <h4 className="text-lg font-semibold text-gray-900">
                                                            {expense.title}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {expense.category_name} • {new Date(expense.expense_date).toLocaleDateString()}
                                                        </p>
                                                        {expense.description && (
                                                            <p className="text-sm text-gray-500 mt-2">
                                                                {expense.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xl font-bold text-gray-900">
                                                            ${expense.amount}
                                                        </div>
                                                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(expense.status)}`}>
                                                            {expense.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <motion.div variants={itemVariants} className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Expenses Yet</h3>
                                        <p className="text-gray-600">Start by adding your first expense</p>
                                    </motion.div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </div>
            </div>
    </Layout>
  )
}

export default Budget