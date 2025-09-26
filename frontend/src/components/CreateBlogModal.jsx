import { useState } from 'react';
import { X, Save, Eye, Hash, Type, FileText } from 'lucide-react';
import axios from 'axios';

function CreateBlogModal({ isOpen, onClose, onSubmit, user }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: ''
  });
  const [isPreview, setIsPreview] = useState(false);
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
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 50) {
      newErrors.content = 'Content must be at least 50 characters';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const username = user?.username || user?.name || 'Anonymous';
      const token = localStorage.getItem('access_token');
      console.log('User object:', user);
      console.log('Username to send:', username);
      console.log('Auth token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        setErrors({ submit: 'Authentication required. Please log in again.' });
        return;
      }
      
      const response = await axios.post('http://localhost:9000/api/blogs/create', {
        username: username,
        title: formData.title,
        content: formData.content,
        category: formData.category
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Blog created successfully:', response.data);
      
      // Call onSubmit to refresh the blog list
      if (onSubmit) {
        onSubmit(response.data);
      }
      
      handleClose();
    } catch (error) {
      console.error('Error creating blog:', error);
      // Set error message
      if (error.response?.status === 401) {
        setErrors({ submit: 'Session expired. Please log in again.' });
      } else if (error.response && error.response.data && error.response.data.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: 'Failed to create blog. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ title: '', content: '', category: '' });
    setErrors({});
    setIsPreview(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create New Blog Post</h2>
              <p className="text-sm text-gray-600">Share your financial insights with the community</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPreview(!isPreview)}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 bg-gray-100 rounded-lg"
            >
              <Eye size={16} />
              <span className="text-sm">{isPreview ? 'Edit' : 'Preview'}</span>
            </button>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {!isPreview ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Type size={16} />
                  <span>Blog Title</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter an engaging title for your blog post..."
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Hash size={16} />
                  <span>Category</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.category ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a category</option>
                  <option value="General">General</option>
                  <option value="Budgeting">Budgeting</option>
                  <option value="Investment">Investment</option>
                  <option value="Savings">Savings</option>
                  <option value="Debt Management">Debt Management</option>
                  <option value="Financial Planning">Financial Planning</option>
                  <option value="Business">Business</option>
                  <option value="Education">Education</option>
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
              </div>

              {/* Content */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <FileText size={16} />
                  <span>Content</span>
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={12}
                  placeholder="Write your blog content here... Share your financial tips, experiences, or insights that could help others in their financial journey."
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                    errors.content ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.content.length} characters • {Math.ceil(formData.content.length / 200)} min read
                </p>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}
            </form>
          ) : (
            /* Preview Mode */
            <div className="prose max-w-none">
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview</h3>
                <p className="text-sm text-gray-600">This is how your blog post will appear to other users.</p>
              </div>
              
              <article className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {(user?.username || user?.name)?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'A'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user?.username || user?.name || 'Anonymous'}</p>
                    <p className="text-sm text-gray-500">Just now • {Math.ceil(formData.content.length / 200)} min read</p>
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-3">{formData.title || 'Your Blog Title'}</h1>
                
                {formData.category && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {formData.category}
                    </span>
                  </div>
                )}

                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {formData.content || 'Your blog content will appear here...'}
                  </div>
                </div>
              </article>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            {!isPreview && (
              <span>
                {formData.title ? `${formData.title.length}/100` : '0/100'} title characters
              </span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 bg-gray-50 rounded-lg font-medium order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              onClick={isPreview ? () => setIsPreview(false) : handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center space-x-2 order-1 sm:order-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save size={16} />
              )}
              <span>
                {isSubmitting ? 'Publishing...' : isPreview ? 'Back to Edit' : 'Publish Blog'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateBlogModal;