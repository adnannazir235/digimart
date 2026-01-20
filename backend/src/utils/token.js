const JWT = require("jsonwebtoken");
const crypto = require("crypto");

const hashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};

const generateAccessToken = (payload, expiresIn = "5m") => {
    try {
        return JWT.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn }); // Short-lived
    } catch (error) {
        throw new Error(error);
    }
};

const generateRefreshToken = () => {
    const rawToken = crypto.randomBytes(64).toString("hex"); // Long random string
    const selector = rawToken.slice(0, 8);
    const hash = hashToken(rawToken);
    return { rawToken, selector, hash };
};

module.exports = { generateAccessToken, generateRefreshToken, hashToken };