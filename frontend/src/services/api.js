import axios from 'axios';

// Base URLs for your microservices
const GATEWAY_URL = 'http://localhost:9000'; // Your API Gateway URL
const BLOG_SERVICE_URL = 'http://localhost:9000'; // Blog Service
const IDENTITY_SERVICE_URL = 'http://localhost:9000'; // Identity Service
const TRANSACTION_SERVICE_URL = 'http://localhost:9000'; // Transaction Service

// Create axios instances for each service
const blogAPI = axios.create({
  baseURL: `${BLOG_SERVICE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

const identityAPI = axios.create({
  baseURL: `${IDENTITY_SERVICE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

const transactionAPI = axios.create({
  baseURL: `${TRANSACTION_SERVICE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
const addAuthToken = (config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Add response interceptor to handle auth errors
const handleAuthError = (error) => {
  if (error.response && error.response.status === 401) {
    // Token is invalid or expired, clear storage and redirect to login
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('expires_in');
    
    // You might want to redirect to login page here
    // window.location.href = '/login';
  }
  return Promise.reject(error);
};

blogAPI.interceptors.request.use(addAuthToken);
identityAPI.interceptors.request.use(addAuthToken);
transactionAPI.interceptors.request.use(addAuthToken);

// Add response interceptors for error handling
blogAPI.interceptors.response.use(response => response, handleAuthError);
identityAPI.interceptors.response.use(response => response, handleAuthError);
transactionAPI.interceptors.response.use(response => response, handleAuthError);

// Blog Service API
export const blogService = {
  // Get all blogs
  getBlogs: () => blogAPI.get('/blogs'),
  
  // Get blog by ID
  getBlog: (id) => blogAPI.get(`/blogs/${id}`),
  
  // Create new blog
  createBlog: (data) => blogAPI.post('/blogs', data),
  
  // Update blog
  updateBlog: (id, data) => blogAPI.put(`/blogs/${id}`, data),
  
  // Delete blog
  deleteBlog: (id) => blogAPI.delete(`/blogs/${id}`),
  
  // Get blogs by username
  getBlogsByUser: (username) => blogAPI.get(`/blogs/user/${username}`),
  
  // Get blogs by category
  getBlogsByCategory: (category) => blogAPI.get(`/blogs/category/${category}`),
  
  // Search blogs
  searchBlogs: (query) => blogAPI.get(`/blogs/search?q=${query}`),
};

// Identity Service API
export const identityService = {
  // Register user
  register: (data) => identityAPI.post('/auth/register', data),
  
  // Login user
  login: (data) => identityAPI.post('/auth/login', data),
  
  // Get user profile
  getProfile: () => identityAPI.get('/auth/profile'),
  
  // Update user profile
  updateProfile: (data) => identityAPI.put('/auth/profile', data),
  
  // Logout
  logout: () => identityAPI.post('/auth/logout'),
};

// Transaction Service API (Updated to match your backend)
export const transactionService = {
  // Get all transactions with optional username filter
  getTransactions: (username = null) => {
    const url = username ? `/transactions?username=${username}` : '/transactions';
    return transactionAPI.get(url);
  },
  
  // Get transaction by ID
  getTransaction: (id) => transactionAPI.get(`/transactions/${id}`),
  
  // Create new transaction
  createTransaction: (data) => transactionAPI.post('/transactions', data),
  
  // Update transaction
  updateTransaction: (id, data) => transactionAPI.put(`/transactions/${id}`, data),
  
  // Delete transaction
  deleteTransaction: (id) => transactionAPI.delete(`/transactions/${id}`),
  
  // Get transactions by type (income/expense/transfer)
  getTransactionsByType: (type, username = null) => {
    const url = username ? `/transactions/type/${type}?username=${username}` : `/transactions/type/${type}`;
    return transactionAPI.get(url);
  },
  
  // Get financial summary
  getFinancialSummary: (username) => transactionAPI.get(`/transactions/summary?username=${username}`),
};

export default {
  blogService,
  identityService,
  transactionService,
};

