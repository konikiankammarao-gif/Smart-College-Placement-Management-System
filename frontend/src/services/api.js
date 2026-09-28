import axios from 'axios';

// Dynamically determine the backend API base URL
export const getBaseURL = () => {
  // If explicitly configured in environment (e.g. VITE_API_URL in .env or deployment vars)
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    const cleanUrl = envUrl.trim().replace(/\/+$/, '');
    return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  }

  // When running in production browser (not on localhost or 127.0.0.1)
  if (
    typeof window !== 'undefined' &&
    !window.location.hostname.includes('localhost') &&
    !window.location.hostname.includes('127.0.0.1')
  ) {
    // Live Render backend API for production deployments
    return 'https://smart-college-placement-management-system.onrender.com/api';
  }

  // Local development fallback - Vite proxy routes '/api' to 'http://localhost:5000'
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000,
});

// Attach JWT token to requests if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to format responses and catch errors
api.interceptors.response.use(
  (response) => {
    // Detect if SPA rewrite served HTML (index.html) instead of API JSON response
    if (typeof response.data === 'string' && response.data.trim().startsWith('<!DOCTYPE html>')) {
      return Promise.reject(new Error('Received HTML instead of API JSON response'));
    }
    return response.data;
  },
  (error) => {
    const url = error.config?.url || '';
    const isAuthReq = url.includes('/auth/login') || url.includes('/auth/register');

    if (error.response && error.response.status === 401 && !isAuthReq) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }

    const message =
      error.response?.data?.message ||
      (typeof error.response?.data === 'string' && !error.response.data.startsWith('<!DOCTYPE')
        ? error.response.data
        : null) ||
      error.message ||
      'Something went wrong';

    return Promise.reject(message);
  }
);

export default api;
