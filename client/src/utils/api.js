import axios from 'axios';
const API = axios.create({ baseURL: '/api' });
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('ry_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
// Auth
export const register = (d) => API.post('/auth/register', d);
export const login = (d) => API.post('/auth/login', d);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (d) => API.put('/auth/profile', d);
export const changePassword = (d) => API.put('/auth/change-password', d);
// Estimations
export const submitEstimation = (d) => API.post('/estimations', d);
export const getEstimations = (params='') => API.get(`/estimations${params}`);
export const getEstimationStats = () => API.get('/estimations/stats');
export const verifyEstimation = (id) => API.patch(`/estimations/${id}/verify`);
// Public
export const getPublicSchemes = () => API.get('/public/schemes');
export const getPublicAlerts = () => API.get('/public/alerts');
export const getPublicMarketPrices = () => API.get('/public/market-prices');
// Admin
export const getAdminStats = () => API.get('/admin/stats');
export const getAdminUsers = (q='') => API.get(`/admin/users${q}`);
export const updateUserRole = (id, role) => API.patch(`/admin/users/${id}/role`, { role });
export const toggleUserActive = (id) => API.patch(`/admin/users/${id}/toggle`);
export const verifyKyc = (id, status) => API.patch(`/admin/users/${id}/kyc`, { status });
export const getAdminAlerts = () => API.get('/admin/alerts');
export const createAlert = (d) => API.post('/admin/alerts', d);
export const deleteAlert = (id) => API.delete(`/admin/alerts/${id}`);
export const getAdminSchemes = () => API.get('/admin/schemes');
export const createScheme = (d) => API.post('/admin/schemes', d);
export const getMarketPrices = () => API.get('/admin/market-prices');
export const updateMarketPrice = (d) => API.post('/admin/market-prices', d);
export const getReports = () => API.get('/admin/reports');
export const generateReport = (d) => API.post('/admin/reports/generate', d);
export const getAnalytics = () => API.get('/analytics');
export const getPublicStats = () => API.get('/public/stats');
export const getPublicCropCalendar = (season) => API.get(`/public/crop-calendar?season=${season}`);
export const exportEstimationsCSV = () => API.get('/estimations/export', { responseType: 'blob' });
export const submitContact = (d) => API.post('/contacts', d);
