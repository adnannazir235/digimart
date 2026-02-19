import axios from "axios";
import { getAccessToken, setAccessToken, removeAccessToken } from "../utils/tokenUtils";

const api = axios.create({ baseURL: import.meta.env.VITE_API_BACKEND_URL });
api.defaults.withCredentials = true;

// Request Interceptor
api.interceptors.request.use(
    (config) => {
        if (config.url?.includes("/refresh-token")) return config;

        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token)));
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (!originalRequest || originalRequest.url.includes("/auth/login") || originalRequest.url.includes("/auth/reset-password")) {
            return Promise.reject(error);
        }

        // Skip if not 401 or already retried
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        // Skip for refresh endpoint to avoid infinite loop
        if (originalRequest.url.includes("/auth/refresh-token")) {
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
            const res = await api.post("/auth/refresh-token");
            const newAccessToken = res.data.accessToken;

            setAccessToken(newAccessToken);

            // Update headers
            api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
            processQueue(null, newAccessToken);

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            removeAccessToken();
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export const authAPI = {
    register: (data) => api.post("/auth/register", data),
    resendVerificationEmail: (data) => api.post("/auth/resend-verify-email", data),
    login: (data) => api.post("/auth/login", data),
    logout: () => api.post("/auth/logout"),
    refreshToken: () => api.post("/auth/refresh-token"),
    changePassword: (data) => api.post("/auth/change-password", data),
    initiateForgotPassword: (data) => api.post("/auth/forgot-password", data),
    resetPassword: (data, token) => api.post("/auth/reset-password", data, { headers: { Authorization: `Bearer ${token}` } }),
    googleAuth: (redirectTo = "") => {
        const backendUrl = import.meta.env.VITE_API_BACKEND_URL;
        const redirectPath = redirectTo ? `?redirectTo=${redirectTo}` : "";
        const url = `${backendUrl}/auth/google${redirectPath}`;

        // Full page redirect
        window.location.href = url;
    },
    setPassword: (data) => api.post("/auth/set-password", data),
    deleteAccount: (data) => api.delete("/auth/delete-account", data),
    disconnectGoogle: (data) => api.post("/auth/disconnect-google", data),
};

export const userAPI = {
    // GET /users/me
    getProfile: () => api.get("/users/me"),

    // PUT /users/me (Authenticated profile update)
    updateProfile: (data) => api.put("/users/me", data),
};

export const shopAPI = {
    // POST /shops/create-shop (Authenticated seller onboarding)
    createShop: (data) => api.post("/shops/create-shop", data),

    // GET /shops (Public or filtered shop list)
    getShops: (data) => api.get("/shops", data),

    // GET /shops/my (Authenticated — get seller's own shop)
    getMyShop: () => api.get("/shops/my"),

    // PUT /shops/update-shop (Authenticated shop update)
    updateShop: (data) => api.put("/shops/update-shop", data),

    // DELETE /shops/:id (Authenticated — soft delete shop)
    deleteShop: (id) => api.delete(`/shops/${id}`),
};

export const productAPI = {
    // POST /products (Authenticated, handles file upload via Multer)
    // NOTE: For file uploads, ensure your component sends a FormData object.
    create: (data) => api.post("/products", data, {
        headers: { "Content-Type": "multipart/form-data" }
    }),

    // GET /products (Public, get all products)
    getAll: () => api.get("/products"),

    // GET /products/my (Authenticated, get products owned by the current seller)
    getMy: () => api.get("/products/my"),

    // GET /products/:id (Public or optionalAuth)
    getSingle: (id) => api.get(`/products/${id}`),

    // PUT /products/:id (Authenticated, handles file upload)
    update: (id, data) => api.put(`/products/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" }
    }),

    // DELETE /products/:id (Authenticated)
    delete: (id) => api.delete(`/products/${id}`),
};

export const checkoutAPI = {
    // POST /checkout (Authenticated, initiate Stripe Checkout session)
    createCheckoutSession: (data) => api.post("/checkout", data),
};

export const stripeAPI = {
    // GET /stripe/connect-url (Authenticated, initiate Stripe Connect OAuth)
    getStripeConnectUrl: () => api.get("/stripe/connect-url"),

    // NOTE: The /stripe/callback and /stripe/webhook routes are server-side only.
};

export const orderAPI = {
    // GET /order/me → Orders **placed by the user** (buyer perspective)
    // Works for both buyer and seller (as buyer)
    getMyOrders: (params = {}) => api.get("/order/my", { params }),

    // GET /order/:id → Get a single order by ID (Authenticated)
    getSingle: (id) => api.get(`/order/${id}`),

    // GET /order/sales → Orders **received on seller's products**
    // Only accessible to sellers
    getMySales: () => api.get("/order/sales"),

    // GET /order/:id/download (Authenticated — download purchased file)
    // Must use `responseType: "blob"` for binary file response
    downloadProduct: (orderUid, productId) =>
        api.get(`/order/${orderUid}/download/${productId}`, {
            responseType: "blob",
        }),
};