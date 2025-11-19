import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    MenuItem,
    Grid,
    Alert,
    CircularProgress
} from '@mui/material';

const modalVariants = {
  hidden: { 
      opacity: 0,
      scale: 0.8
  },
  visible: { 
      opacity: 1,
      scale: 1,
      transition: {
          type: "spring",
          damping: 25,
          stiffness: 300
      }
  },
  exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
          duration: 0.2
      }
  }
};


const ExpenseForm = ({ open, onClose, onSubmit, caseId, loading = false }) => {

  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState({
      title: '',
      description: '',
      amount: '',
      category: '',
      expense_date: new Date().toISOString().split('T')[0],
      document_file: null
  });

  const [errors, setErrors] = useState({});

  // Common document types for expense categories
  const expenseCategories = [
      'Moving Services',
      'Legal Fees',
      'Housing Deposit',
      'Travel Costs',
      'Visa Fees',
      'Temporary Accommodation',
      'Shipping Costs',
      'Insurance',
      'Utilities Setup',
      'Home Setup',
      'Transportation',
      'Medical Expenses',
      'School Fees',
      'Other'
  ];
  const handleSubmit = async (event)=> {
    event.preventDefault();

    const newErrors = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) newErrors.amount = 'Valid amount is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.expense_date) newErrors.expense_date = 'Expense date is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onSubmit(formData);

    setFormData({
      title: '',
      description: '',
      amount: '',
      category: '',
      expense_date: new Date().toISOString().split('T')[0],
      document_file: null
  });
  setErrors({});
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({
        ...prev,
        [field]: value
    }));
    
    // Clear error when field is updated
    if (errors[field]) {
        setErrors(prev => ({
            ...prev,
            [field]: ''
        }));
    }
};

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            setErrors(prev => ({
                ...prev,
                document_file: 'File size must be less than 10MB'
            }));
            return;
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 
                            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            setErrors(prev => ({
                ...prev,
                document_file: 'Please upload PDF, Word, or image files only'
            }));
            return;
        }

        handleChange('document_file', file);
        
        // Auto-fill title if empty
        if (!formData.title.trim()) {
            const fileName = file.name.split('.')[0];
            handleChange('title', fileName.replace(/[_-]/g, ' '));
        }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
    } else if (e.type === "dragleave") {
        setDragActive(false);
    }
};

const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        const inputEvent = {
            target: {
                files: [file]
            }
        };
        handleFileChange(inputEvent);
    }
};

  const handleClose = () => {
    setFormData({
        title: '',
        description: '',
        amount: '',
        category: '',
        expense_date: new Date().toISOString().split('T')[0],
        document_file: null
    });
    setErrors({});
    onClose();
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return '📎';
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext)) return '📄';
    if (['doc', 'docx'].includes(ext)) return '📝';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return '🖼️';
    return '📎';
  };
  return (
    <Dialog
    open={open}
    onClose={handleClose}
    maxWidth="md"
    fullWidth
    PaperProps={{
      sx: {
        borderRadius: "16px",
        background: "linear-gradient(to bottom right, #ffffff, #f8fafc)",
      }
    }}
    >
      <motion.div
      variants={modalVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      >
        <DialogTitle>
          <div className='flex items-center justify-between'>
          <h2 className="text-2xl sm:text-4xl font-medium tracking-tight text-center mb-6 bg-gradient-to-r from-gray-800 to-indigo-600 bg-clip-text text-transparent inline-block [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
              Add New Expense
          </h2>
          <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
          </motion.button>
          </div>
        </DialogTitle>

        <DialogContent>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <Grid
            container spacing={3}
            >
              <Grid item xs={12}>
                <TextField
                    label="Expense Title *"
                    name="title"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    fullWidth
                    error={!!errors.title}
                    helperText={errors.title}
                    placeholder="e.g., Moving Company Fee, Visa Application"
                />
              </Grid>

              {/* Amount and Category */}
              <Grid item xs={12} md={6}>
                  <TextField
                      label="Amount *"
                      name="amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => handleChange('amount', e.target.value)}
                      fullWidth
                      error={!!errors.amount}
                      helperText={errors.amount}
                      inputProps={{ 
                          min: 0, 
                          step: 0.01,
                          placeholder: "0.00"
                      }}
                      InputProps={{
                          startAdornment: <span className="mr-2 text-gray-500">$</span>
                      }}
                  />
              </Grid>

              <Grid item xs={12} md={6}>
                  <TextField
                      label="Category *"
                      name="category"
                      value={formData.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                      select
                      fullWidth
                      error={!!errors.category}
                      helperText={errors.category}
                  >
                      <MenuItem value="">Select Category</MenuItem>
                      {expenseCategories.map(category => (
                          <MenuItem key={category} value={category}>
                              {category}
                          </MenuItem>
                      ))}
                  </TextField>
              </Grid>

               {/* Expense Date */}
               <Grid item xs={12} md={6}>
                  <TextField
                      label="Expense Date *"
                      name="expense_date"
                      type="date"
                      value={formData.expense_date}
                      onChange={(e) => handleChange('expense_date', e.target.value)}
                      fullWidth
                      error={!!errors.expense_date}
                      helperText={errors.expense_date}
                      InputLabelProps={{
                          shrink: true,
                      }}
                  />
              </Grid>

              {/* File Upload */}
              <Grid item xs={12}>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Receipt or Document (Optional)
                    </label>
                    <motion.div
                        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer ${
                            dragActive 
                                ? 'border-indigo-400 bg-indigo-50' 
                                : formData.document_file
                                ? 'border-green-400 bg-green-50'
                                : 'border-gray-300 hover:border-indigo-300'
                        } ${errors.document_file ? 'border-red-400 bg-red-50' : ''}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('file-input').click()}
                    >
                        <input
                            id="file-input"
                            type="file"
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                        />
                        <div className="space-y-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto ${
                                formData.document_file ? 'bg-green-100' : 'bg-indigo-100'
                            }`}>
                                <span className="text-2xl">
                                    {formData.document_file ? getFileIcon(formData.document_file.name) : '📎'}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {formData.document_file 
                                        ? formData.document_file.name 
                                        : 'Click to upload or drag and drop'
                                    }
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    PDF, Word, Images (Max 10MB)
                                </p>
                            </div>
                            {formData.document_file && (
                                <motion.button
                                    type="button"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleChange('document_file', null);
                                    }}
                                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                                >
                                    Remove File
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                    {errors.document_file && (
                        <p className="text-red-600 text-sm mt-1">{errors.document_file}</p>
                    )}
                </div>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
                <TextField
                    label="Description (Optional)"
                    name="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="Add any additional details about this expense..."
                />
            </Grid>
            </Grid>
          </form>
        </DialogContent>

        <DialogActions className="p-6 border-t border-gray-200">
          <div className="flex justify-end space-x-3 w-full">
              <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-6 py-2.5 text-gray-700 hover:text-gray-900 font-medium transition-colors cursor-pointer duration-200 disabled:opacity-50"
              >
                  Cancel
              </motion.button>
              <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading || !formData.title || !formData.amount || !formData.category || !formData.expense_date}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl disabled:hover:shadow-lg flex items-center space-x-2"
              >
                  {loading ? (
                      <>
                          <CircularProgress size={16} className="text-white" />
                          <span>Adding Expense...</span>
                      </>
                  ) : (
                      'Add Expense'
                  )}
              </motion.button>
          </div>
        </DialogActions>
      </motion.div>
    </Dialog>
  )
}

export default ExpenseForm