require("dotenv").config({ quiet: true });
const express = require("express");
const app = express();
const cors = require("cors");
const routes = require("./routes");
const port = process.env.PORT || 4001;

const db = require("./config/mongoDB");
const { uploadErrorHandler } = require("./middlewares/multer");
const { rateLimiter } = require("./middlewares/rateLimiter");
const cookieParser = require("cookie-parser");
const nodemailer = require("./config/nodemailer");

// Enable trust proxy to handle X-Forwarded-For headers
app.set('trust proxy', 1);  // Trust first proxy

app.use(rateLimiter);
app.use(cookieParser());
app.use(cors({
    origin: [process.env.FRONTEND_URL, ...JSON.parse(process.env.EXTRA_FRONTEND_URLS)],
    credentials: true,
}));
app.use(express.urlencoded({ extended: true }));

app.use("/stripe/webhook", express.raw({ type: "application/json" }));

const jsonParser = express.json();
app.use(jsonParser);

app.use((req, res, next) => {
    console.log("API Called:>", {
        method: req.method,
        body: process.env.NODE_ENV === "development" ? req.body : undefined,
        files: process.env.NODE_ENV === "development" ? req.files : undefined,
        authHeader: process.env.NODE_ENV === "development" ? req.headers.authorization : undefined,
        endPoint: `${req.protocol}://${req.get('host')}${req.originalUrl}`
    });
    next();
});
app.use(routes);
app.use(uploadErrorHandler);

(async function startServer() {
    try {
        // Try email — but don't block server start
        const emailOk = await nodemailer.verifyConnection();
        if (!emailOk) {
            console.warn("Starting server without email support");
        }

        // DB is required — fail if it can't connect
        await db.connect();

        const server = app.listen(port, "0.0.0.0", () => {
            console.log(`✅ Server: http://localhost:${port}`);
        });

        // Graceful shutdown
        process.on("SIGTERM", () => {
            console.log("⚠  SIGTERM received, shutting down");
            server.close(() => process.exit(0));
        });
    } catch (err) {
        console.error("❌ Failed to start server", err.message || err);
        process.exit(1); // Only exit on DB or critical failure
    }
})();