import { useState } from 'react';
import { X, Save, DollarSign, FileText, TrendingUp, TrendingDown } from 'lucide-react';

function CreateTransactionModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    type: 'expense',
    description: '',
    amount: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare data for API
      const transactionData = {
        type: formData.type,
        description: formData.description,
        amount: parseFloat(formData.amount)
      };

      await onSubmit(transactionData);
      
      // Reset form on success
      setFormData({
        type: 'expense',
        description: '',
        amount: ''
      });
      setErrors({});
      onClose();
    } catch (error) {
      // Handle error
      setErrors({
        submit: error.message || 'Failed to create transaction. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      type: 'expense',
      description: '',
      amount: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
              <DollarSign size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add Transaction</h2>
              <p className="text-sm text-gray-600">Record your income or expense</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Error Display */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-800 text-sm">{errors.submit}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Transaction Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: 'type', value: 'income' } })}
                  className={`p-4 border-2 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                    formData.type === 'income'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 text-gray-600 hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  <TrendingUp size={20} />
                  <span className="font-medium">Income</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: 'type', value: 'expense' } })}
                  className={`p-4 border-2 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                    formData.type === 'expense'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 text-gray-600 hover:border-red-300 hover:bg-red-50'
                  }`}
                >
                  <TrendingDown size={20} />
                  <span className="font-medium">Expense</span>
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <FileText size={16} />
                <span>Description</span>
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={`Enter ${formData.type} description...`}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            {/* Amount */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <DollarSign size={16} />
                <span>Amount</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.amount ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
            </div>


          </form>
        </div>

        {/* Footer - Always visible */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="text-sm text-gray-500">
            {formData.amount && (
              <span className={formData.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                {formData.type === 'income' ? '+' : '-'}${parseFloat(formData.amount || 0).toLocaleString()}
              </span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 flex items-center space-x-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save size={16} />
              )}
              <span>{isSubmitting ? 'Saving...' : 'Save Transaction'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateTransactionModal;