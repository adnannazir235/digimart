import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_BACKEND_URL });

// Enable withCredentials for HTTP-only cookies (likely used by /auth/refresh-token)
api.defaults.withCredentials = true;

// Request Interceptor
api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken && accessToken !== null && accessToken !== "null") {
            try {
                const parsedToken = JSON.parse(accessToken);
                if (parsedToken) {
                    config.headers.Authorization = `Bearer ${parsedToken}`;
                }
            } catch (e) {
                console.error("Failed to parse accessToken:", e);
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

        if (originalRequest.url.includes("/auth/login") || originalRequest.url.includes("/auth/reset-password")) {
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

            // Update localStorage
            localStorage.setItem("accessToken", JSON.stringify(newAccessToken));

            // Dispatch storage event to notify other components
            window.dispatchEvent(new StorageEvent("storage", {
                key: "accessToken",
                newValue: JSON.stringify(newAccessToken),
            }));

            // Update headers
            api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
            processQueue(null, newAccessToken);

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            localStorage.removeItem("accessToken");

            // Dispatch manual storage event to trigger handlers in same tab
            window.dispatchEvent(new StorageEvent("storage", {
                key: "accessToken",
                newValue: null,
            }));
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

        // Full page redirect — NOT AJAX
        window.location.href = url;
    },
    setPassword: (data) => api.post("/auth/set-password", data),
    deleteAccount: (data) => api.delete("/auth/delete-account", data),
    disconnectGoogle: (data) => api.post("/auth/disconnect-google", data),
};

// --- USER API ---
export const userAPI = {
    // GET /users/me
    getProfile: () => api.get("/users/me"),

    // PUT /users/me (Authenticated profile update)
    updateProfile: (data) => api.put("/users/me", data),
};

// --- SHOP API ---
export const shopAPI = {
    // POST /shops/create-shop (Authenticated seller onboarding)
    createShop: (data) => api.post("/shops/create-shop", data),

    // GET /shops/update-shop (Authenticated shop update)
    getShops: (data) => api.get("/shops", data),

    // GET /shops/my (Authenticated get seller's shop)
    getMyShop: () => api.get("/shops/my"),

    // PUT /shops/update-shop (Authenticated shop update)
    updateShop: (data) => api.put("/shops/update-shop", data),

    // PUT /shops/update-shop (Authenticated shop delete)
    deleteShop: (id) => api.delete(`/shops/${id}`),
};

// --- PRODUCT API ---
export const productAPI = {
    // POST /products (Authenticated, handles file upload via Multer)
    // NOTE: For file uploads, ensure your component sends a FormData object.
    create: (data) => api.post("/products", data, {
        headers: { "Content-Type": "multipart/form-data" }
    }),

    // GET /products (Public, get all products)
    getAll: (params = {}) => api.get("/products", { params }), // Allow optional query params for filtering/pagination

    // GET /products/my (Authenticated, get products owned by the current seller)
    getMy: (params = {}) => api.get("/products/my", { params }),

    // GET /products/:id (Public or optionalAuth)
    getSingle: (id) => api.get(`/products/${id}`),

    // PUT /products/:id (Authenticated, handles file upload)
    update: (id, data) => api.put(`/products/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" }
    }),

    // DELETE /products/:id (Authenticated)
    delete: (id) => api.delete(`/products/${id}`),
};

// --- PAYMENT & ORDER API ---
export const checkoutAPI = {
    // POST /checkout (Authenticated, initiate Stripe Checkout session)
    createCheckoutSession: (data) => api.post("/checkout", data),
};

export const paymentAPI = {
    // GET /stripe/connect-url (Authenticated, initiate Stripe Connect OAuth)
    getStripeConnectUrl: () => api.get("/stripe/connect-url"),

    // NOTE: The /stripe/callback and /stripe/webhook routes are server-side only.
};

export const orderAPI = {
    // GET /order/me (Unified endpoint for both roles)
    getMyOrders: (params = {}) => api.get("/order/me", { params }),

    // GET /order/:id/download (Authenticated, file download)
    // IMPORTANT: Use `responseType: "blob"` for file downloads.
    downloadProduct: (orderId) => api.get(`/order/${orderId}/download`, {
        responseType: "blob"
    }),
};