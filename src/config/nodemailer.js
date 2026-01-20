const nodemailer = require("nodemailer");
let transporter = null;

const createTransporter = () => {
    return nodemailer.createTransport({
        service: "gmail", // Can also use 'outlook', 'yahoo', or custom SMTP
        // Or use SMTP directly (more flexible):
        /*
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        */
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        // Optional: Improve deliverability
        tls: {
            rejectUnauthorized: false, // Avoid issues with self-signed certs (in dev)
        },
    });
};

// Only verify when needed, and DO NOT throw on startup
const verifyConnection = async () => {
    if (!transporter) transporter = createTransporter();

    try {
        await transporter.verify();
        console.log("✅ Nodemailer: Connected");
        return true;
    } catch (err) {
        console.warn("❌ Nodemailer: Gmail unreachable (emails disabled)", err.message);
        return false;
    }
};

// Export transporter and safe send function
const sendMail = async (options) => {
    if (!transporter) transporter = createTransporter();

    try {
        await transporter.verify(); // Try to reconnect
        return await transporter.sendMail(options);
    } catch (err) {
        console.error("Failed to send email:", err.message);
        throw err; // Let caller handle (e.g. return 500)
    }
};

module.exports = { sendMail, verifyConnection };