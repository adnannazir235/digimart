import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

// Enable withCredentials for HTTP-only cookies (likely used by /auth/refresh-token)
api.defaults.withCredentials = true;

// Request Interceptor
api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken && accessToken !== null && accessToken !== "null") {
            try {
                const parsedToken = JSON.parse(accessToken);
                if (parsedToken) {
                    config.headers.Authorization = `Bearer ${parsedToken}`;
                }
            } catch (e) {
                console.error('Failed to parse accessToken:', e);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/reset-password')) {
            return Promise.reject(error);
        }

        // Skip if not 401 or already retried
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        // Skip for refresh endpoint to avoid infinite loop
        if (originalRequest.url.includes('/auth/refresh-token')) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            // Queue concurrent requests
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                })
                .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const res = await api.post('/auth/refresh-token');
            const newAccessToken = res.data.accessToken;

            // Update localStorage
            localStorage.setItem('accessToken', JSON.stringify(newAccessToken));

            // Dispatch storage event to notify other components
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'accessToken',
                newValue: JSON.stringify(newAccessToken),
            }));

            // Update headers
            api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            processQueue(null, newAccessToken);

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            localStorage.removeItem('accessToken');

            // Dispatch manual storage event to trigger handlers in same tab
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'accessToken',
                newValue: null,
            }));
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    resendVerificationEmail: (data) => api.post('/auth/resend-verify-email', data),
    login: (data) => api.post('/auth/login', data),
    getProfile: () => api.get('/users/me'),
    logout: () => api.post('/auth/logout'),
    refreshToken: () => api.post('/auth/refresh-token'),
    changePassword: (data) => api.post('/auth/change-password', data),
    initiateForgotPassword: (data) => api.post('/auth/forgot-password', data),
    resetPassword: (data, token) => api.post('/auth/reset-password', data, { headers: { Authorization: `Bearer ${token}` } }),
    googleAuth: () => { window.location.href = '/auth/google?redirectTo=settings' },
    setPassword: (data) => api.post('/auth/set-password', data),
    deleteAccount: (data) => api.delete('/auth/delete-account', data),
    disconnectGoogle: (data) => api.post('/auth/disconnect-google', data),
};