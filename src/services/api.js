import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use(
    (config) => {
        // You can get the token from localStorage or your context here
        const accessToken = localStorage.getItem('accessToken');

        if (accessToken) {
            config.headers.Authorization = `Bearer ${JSON.parse(accessToken)}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    resendVerificationEmail: (data) => api.post('/auth/resend-verify-email', data),
    login: (data) => api.post('/auth/login', data),
    getProfile: (data) => api.get('/users/me', data),
    logout: (data) => api.post('/auth/logout', data),
};