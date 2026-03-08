import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

export const submitEstimation = (data) => API.post('/estimations', data);
export const getEstimations = (page = 1) => API.get(`/estimations?page=${page}`);
export const getEstimationStats = () => API.get('/estimations/stats');
export const submitContact = (data) => API.post('/contacts', data);
export const trackPageView = (data) => API.post('/analytics/pageview', data);
export const getAnalytics = () => API.get('/analytics');

export default API;
