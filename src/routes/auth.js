const express = require("express");
const auth = require("../controllers/auth");
const { resendEmailLimiter } = require("../middlewares/rateLimiter");
const { authMiddleware, validateRegisterInputs, validateLoginInputs, validateResendEmailInputs, validateRefreshToken } = require("../middlewares/authMiddleware");
const router = express.Router();

// Manual Auth
router.post("/register", validateRegisterInputs, auth.registerAccount);
router.get("/verify-email", auth.verifyUserEmail);
router.post("/resend-verify-email", resendEmailLimiter, validateResendEmailInputs, auth.resendVerificationEmail);
router.post("/login", validateLoginInputs, auth.login);
router.delete("/delete-account", authMiddleware, auth.deleteAccount);

// Google Auth
router.get("/google", auth.getGoogleAuthUrl);
router.get("/google/callback", auth.googleAuthCallback);
router.post("/disconnect-google", authMiddleware, auth.disconnectGoogle);

// Token Management
router.post("/refresh-token", validateRefreshToken, auth.refreshToken);
router.post("/logout", authMiddleware, auth.logout);

// Password Management
router.post("/set-password", resendEmailLimiter, authMiddleware, auth.setPassword);
router.post("/change-password", resendEmailLimiter, authMiddleware, auth.changePassword);
router.post("/forgot-password", resendEmailLimiter, auth.initiateForgotPassword);
router.post("/reset-password", auth.resetPassword);

module.exports = router;