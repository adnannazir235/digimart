import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    resendVerificationEmail: (data) => api.post('/auth/resend-verify-email', data),
    login: (data) => api.post('/auth/login', data),
};