import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

axiosInstance.interceptors.request.use(config => {
  const t = localStorage.getItem('token');
  if (t) {
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.error('Token expired or unauthorized');
    //   window.location.href = '/auth'; // instead of router.push('/')
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;