const rateLimit = require("express-rate-limit");

// 100 requests per 15 minutes per IP
const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 250,
    message: {
        success: false,
        message: "Too many requests from this IP. Please try again later.",
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false, // Disable X-RateLimit headers
});

// 5 requests per 15 minutes per IP
const resendEmailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
});

module.exports = { rateLimiter, resendEmailLimiter };