const rateLimit = require("express-rate-limit");

// 1000 requests per 15 minutes per IP
const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15-minutes window
    max: 1000,
    message: {
        success: false,
        message: "High traffic detected. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// 3 requests per 60 minutes per IP
const resendEmailLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1-hour window
    max: 3,
    message: {
        success: false,
        message: "Too many email requests. Please check your inbox or try again in an hour.",
    },
});

module.exports = { rateLimiter, resendEmailLimiter };