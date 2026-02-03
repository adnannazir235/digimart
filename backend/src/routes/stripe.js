const express = require("express");
const stripe = require("../controllers/stripe");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { createRedirectUrl } = require("../utils/createRedirectUrl");
const router = express.Router();
const jsonParser = express.json();

// Returns OAuth URL for frontend to redirect user
router.get("/connect-url", jsonParser, authMiddleware, stripe.getStripeConnectUrl);

// Called by Stripe after user completes OAuth
router.get("/callback", stripe.handleStripeConnectCallback);

// Use raw body for Stripe signature verification
router.post("/webhook", stripe.handleStripeWebhook);

// Handle success redirect (e.g., for Stripe Checkout)
router.get("/success", jsonParser, (req, res) => {
    const feUrl = createRedirectUrl("success", "Payment succeeded! Your order was successful.", "checkout-success");
    return res.redirect(feUrl);
});

// Handle cancel redirect (e.g., for Stripe Checkout)
router.get("/cancel", jsonParser, (req, res) => {
    const feUrl = createRedirectUrl("error", "Payment was canceled. You can retry checkout anytime.", "products");
    return res.redirect(feUrl);
});

module.exports = router;