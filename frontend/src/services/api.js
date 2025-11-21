import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000, // 30 seconds for file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          toast.error('Unauthorized access');
          // Redirect to login if needed
          break;
        case 403:
          toast.error('Access forbidden');
          break;
        case 404:
          toast.error('Resource not found');
          break;
        case 500:
          toast.error('Server error occurred');
          break;
        default:
          toast.error(data?.error || 'An error occurred');
      }
    } else if (error.request) {
      toast.error('Network error - please check your connection');
    } else {
      toast.error('Request failed');
    }
    
    return Promise.reject(error);
  }
);

// API service methods
export const inventoryAPI = {
  // Get all items
  getItems: (params = {}) => api.get('/inventory', { params }),
  
  // Get single item
  getItem: (id) => api.get(`/inventory/${id}`),
  
  // Add new item
  addItem: (data) => api.post('/inventory', data),
  
  // Update item
  updateItem: (id, data) => api.put(`/inventory/${id}`, data),
  
  // Delete item
  deleteItem: (id) => api.delete(`/inventory/${id}`),
  
  // Process bill with AI
  processBill: (formData) => api.post('/inventory/process-bill', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Get categories
  getCategories: () => api.get('/inventory/meta/categories'),
  
  // Get low stock items
  getLowStockItems: () => api.get('/inventory/alerts/low-stock'),
};

export const salesAPI = {
  // Get all sales
  getSales: (params = {}) => api.get('/sales', { params }),
  
  // Get single sale
  getSale: (id) => api.get(`/sales/${id}`),
  
  // Create new sale
  createSale: (data) => api.post('/sales', data),
  
  // Delete sale
  deleteSale: (id) => api.delete(`/sales/${id}`),
  
  // Get sales statistics
  getSalesStats: (params = {}) => api.get('/sales/stats/summary', { params }),
};

export const billsAPI = {
  // Get purchase bills
  getPurchaseBills: (params = {}) => api.get('/bills/purchase', { params }),
  
  // Get single purchase bill
  getPurchaseBill: (id) => api.get(`/bills/purchase/${id}`),
  
  // Get sales bills
  getSalesBills: (params = {}) => api.get('/bills/sales', { params }),
};

export const dashboardAPI = {
  // Get dashboard overview
  getOverview: () => api.get('/dashboard/overview'),
  
  // Get sales chart data
  getSalesChart: (params = {}) => api.get('/dashboard/charts/sales', { params }),
  
  // Get top items chart
  getTopItemsChart: (params = {}) => api.get('/dashboard/charts/top-items', { params }),
  
  // Generate inventory report
  generateInventoryReport: (params = {}) => api.get('/dashboard/reports/inventory', { params }),
  
  // Generate sales report
  generateSalesReport: (params = {}) => api.get('/dashboard/reports/sales', { params }),
};

// Utility functions
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const formatDateOnly = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

export default api;