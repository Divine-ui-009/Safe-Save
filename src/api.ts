import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || ''}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  connectWallet: (payload: { walletAddress: string; stakeAddress?: string | null }) =>
    api.post('/auth/connect-wallet', payload),

  getMe: () => api.get('/auth/me'),
};

export const savingsAPI = {
  getUserSavings: (walletAddress: string) => api.get(`/savings/${walletAddress}`),
  getGroupTotal: () => api.get('/savings/group/total'),
  prepareDeposit: (amount: number) => api.post('/savings/deposit/prepare', { amount }),
};

export default api;