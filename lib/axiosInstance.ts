import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'; // Fallback pour dev

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('Token expired or unauthorized:', error.response.data); // Log plus détaillé pour debug
            localStorage.removeItem('token');
            // Redirection vers la page de login frontend (pas une API route)
            if (typeof window !== 'undefined') {
                window.location.href = '/login/';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;