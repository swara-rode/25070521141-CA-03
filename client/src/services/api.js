import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('expense_tracker_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors uniformly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // If 401 on protected endpoint, clear storage
      if (!originalRequest.url.includes('/auth/login') && !originalRequest.url.includes('/auth/register')) {
        localStorage.removeItem('expense_tracker_token');
        localStorage.removeItem('expense_tracker_user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me')
};

// Transaction endpoints
export const transactionService = {
  getAll: (params) => api.get('/transactions', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  getMeta: () => api.get('/transactions/meta')
};

// Budget endpoints
export const budgetService = {
  getAll: (params) => api.get('/budgets', { params }),
  create: (data) => api.post('/budgets', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`)
};

// Dashboard endpoints
export const dashboardService = {
  getSummary: (params) => api.get('/dashboard/summary', { params }),
  getTrends: () => api.get('/dashboard/trends'),
  getCategoryBreakdown: (params) => api.get('/dashboard/category-breakdown', { params })
};

// Reports endpoints
export const reportsService = {
  getSummary: (params) => api.get('/reports/summary', { params }),
  downloadCsv: async (params) => {
    const token = localStorage.getItem('expense_tracker_token');
    const response = await api.get('/reports/export-csv', {
      params,
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // Create a download link for the CSV blob
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `ExpenseTracker_Export_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};

// User Profile endpoints
export const userService = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data)
};

// Health endpoint
export const healthService = {
  check: () => api.get('/health')
};

export default api;
