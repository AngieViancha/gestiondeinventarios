import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000', // URL de tu servidor backend
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
