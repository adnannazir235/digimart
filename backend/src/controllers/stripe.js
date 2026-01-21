const JWT = require("jsonwebtoken");
const stripe = require("../config/stripe");
const Shop = require("../models/Shop");
const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { generateSignedUrl, generateZipDownloadUrl } = require("../utils/cloudinary");
const { createRedirectUrl } = require("../utils/createRedirectUrl");
const { sendStripeConnectedEmail } = require("../utils/sendSellerEmail");
const { sendProductPurchasedEmail } = require("../utils/sendProductPurchasedEmail");

/**
 * Generates a Stripe Connect OAuth URL for the seller to complete onboarding.
 * Returns the URL in JSON so frontend can redirect the user.
 */
exports.getStripeConnectUrl = async (req, res) => {
    const user = req.user;

    if (user.role !== "seller" || !user.isSeller) {
        return res.status(403).json({
            status: false,
            message: "Only sellers can connect Stripe accounts."
        });
    }

    // Find shop
    const shop = await Shop.findOne({ sellerId: user._id });
    if (!shop) {
        return res.status(404).json({
            status: false,
            message: "Shop not found. Please complete seller onboarding first."
        });
    }

    // ✅ Stripe account already connected
    if (shop.isStripeConnected && shop.stripeAccountId) {
        return res.status(409).json({
            status: false,
            message: "Your Stripe account is already connected.",
            data: { isStripeConnected: true }
        });
    }

    try {
        // Generate secure state token
        const state = JWT.sign({ userId: user._id.toString() }, process.env.JWT_STATE_SECRET, { expiresIn: "15m" });

        // Genereate Stripe Connect Auth Url
        const authUrl = stripe.oauth.authorizeUrl({
            client_id: process.env.STRIPE_CLIENT_ID,
            scope: "read_write",
            redirect_uri: process.env.STRIPE_REDIRECT_URI,
            state,
            stripe_user: { email: user.email }
        });

        return res.json({
            status: true,
            message: "Redirect the user to this URL to connect their Stripe account.",
            data: { url: authUrl }
        });
    } catch (err) {
        console.error("Failed to generate Stripe OAuth URL:", err.message);
        return res.status(500).json({
            status: false,
            message: "Failed to generate Stripe connection URL."
        });
    }
};

/**
 * Handles the OAuth callback from Stripe.
 * Called automatically by Stripe after user connects their account.
 */
exports.handleStripeConnectCallback = async (req, res) => {
    const { code, state, error } = req.query;

    if (error) {
        console.error("Stripe OAuth error:", error);
        const feUrl = createRedirectUrl("error", "Stripe connection failed. Please try again.", "seller/dashboard/products");
        return res.redirect(feUrl);
    }

    if (!code || !state) {
        const feUrl = createRedirectUrl("error", "Missing code or state parameter.", "seller/dashboard/products");
        return res.redirect(feUrl);
    }

    let userId;
    try {
        const decoded = JWT.verify(state, process.env.JWT_STATE_SECRET);
        userId = decoded.userId;
    } catch (err) {
        console.error("Invalid or expired state token:", err.message);
        const feUrl = createRedirectUrl("error", "Invalid or expired session. Please restart Stripe onboarding.", "seller/dashboard/products");
        return res.redirect(feUrl);
    }

    // Fetch user
    const user = await User.findById(userId);
    if (!user || user.role !== "seller" || !user.isSeller) {
        const feUrl = createRedirectUrl("error", "Invalid user or not a seller.", "seller/dashboard/products");
        return res.redirect(feUrl);
    }

    // Fetch shop
    const shop = await Shop.findOne({ sellerId: userId });
    if (!shop) {
        const feUrl = createRedirectUrl("error", "Shop not found. Please complete seller onboarding first.", "seller/dashboard/products");
        return res.redirect(feUrl);
    }

    // ✅ Already connected — idempotent success
    if (shop.isStripeConnected && shop.stripeAccountId) {
        const feUrl = createRedirectUrl("success", "Stripe account was already connected.", "seller/dashboard/products");
        return res.redirect(feUrl);
    }

    try {
        // Exchange code for Stripe account ID
        const tokenResponse = await stripe.oauth.token({ grant_type: "authorization_code", code });
        const stripeUserId = tokenResponse.stripe_user_id;

        // ✅ Same Stripe account already linked (idempotent)
        if (shop.stripeAccountId === stripeUserId) {
            shop.isStripeConnected = true;
            await shop.save();

            user.sellerOnboardingComplete = true;
            await user.save();
            const feUrl = createRedirectUrl("success", "Stripe account already linked. Onboarding complete.", "seller/dashboard/products");
            return res.redirect(feUrl);
        }

        // ✅ Different Stripe account already linked → reject
        if (shop.stripeAccountId && shop.stripeAccountId !== stripeUserId) {
            console.warn(`User ${userId} attempted to link a different Stripe account (${stripeUserId}) while already linked to ${shop.stripeAccountId}`);
            const feUrl = createRedirectUrl("error", "You're already linked to a different Stripe account. Email digimart if you have any issues.", "seller/dashboard/products");
            return res.redirect(feUrl);
        }

        // Update shop
        shop.stripeAccountId = stripeUserId;
        shop.isStripeConnected = true;
        await shop.save();

        // Update user
        user.sellerOnboardingComplete = true;
        await user.save();

        try {
            await sendStripeConnectedEmail(user);
        } catch (emailErr) {
            console.error("Failed to send Stripe connected email:", emailErr.message);
            // Continue without failing the response
        }

        const feUrl = createRedirectUrl("success", "Stripe account connected successfully.", "seller/dashboard/products");
        return res.redirect(feUrl);
    } catch (err) {
        console.error("OAuth token exchange failed:", err.message || err);

        // Handle specific Stripe errors
        if (err.type === "StripeInvalidGrantError") {
            const feUrl = createRedirectUrl("error", "The authorization code is invalid or expired. Please restart onboarding.", "seller/dashboard/products");
            return res.redirect(feUrl);
        }
        const feUrl = createRedirectUrl("error", "Failed to complete Stripe connection due to a server error.", "seller/dashboard/products");
        return res.redirect(feUrl);
    }
};

exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        // Construct the event from the webhook payload
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        try {
            // Find the order associated with the Stripe session
            const order = await Order.findOne({ stripeSessionId: session.id }).populate("productIds buyerId");
            if (!order) {
                console.error(`Order not found for session: ${session.id}`);
                return res.status(404).json({ error: "Order not found" });
            }

            // Check if the order is still pending
            if (order.status === "pending") {
                // Update order status to completed
                order.status = "completed";
                await order.save();

                // Handle product and buyer retrieval
                const productPromises = order.productIds.map((productId) => Product.findById(productId).select("+cloudinaryPublicId"));
                const products = await Promise.all(productPromises);
                const buyer = await User.findById(order.buyerId);

                // Check if product(s) and buyer exist
                if (!products.length || !buyer) {
                    console.error("Product(s) or buyer not found for order:", order.orderUid);
                    return res.status(404).json({ error: "Product or buyer not found" });
                }

                // Generate download URL for product(s)
                let downloadUrl = null;
                const SECONDS_IN_DAY = 24 * 60 * 60;

                if (products.length === 1) {
                    const product = products[0];
                    try {
                        downloadUrl = generateSignedUrl(product.cloudinaryPublicId, product.fileUrl, SECONDS_IN_DAY);
                    } catch (error) {
                        console.error("Failed to generate signed URL for single product:", product._id, error.message);
                    }
                } else {
                    const publicIds = products.map(p => p.cloudinaryPublicId);
                    try {
                        downloadUrl = generateZipDownloadUrl(publicIds, SECONDS_IN_DAY);
                    } catch (error) {
                        console.error("Failed to generate signed URL for multiple product:", publicIds, error.message);
                    }
                };

                // Ensure you have valid URL before passing to the email
                if (downloadUrl === null) console.warn(`No valid download URL for order ${order.orderUid}`);

                // Save download URL to the order
                order.downloadUrl = downloadUrl;

                order.downloadExpiry = new Date(Date.now() + SECONDS_IN_DAY * 1000);
                await order.save();

                // Send email notification with download instructions
                if (downloadUrl !== null && buyer.email) {
                    try {
                        await sendProductPurchasedEmail({
                            to: buyer.email,
                            orderUid: order.orderUid,
                            productTitles: products.map((p) => p.title),
                            downloadUrl: downloadUrl,
                            amount: order.amount,
                            currencyCode: order.currencyCode
                        });
                    } catch (emailError) {
                        console.error("Failed to send email for order:", order.orderUid, emailError.message);
                        // Don't fail the webhook; Stripe expects 200 OK even if email fails
                    }
                } else {
                    console.warn(`Skipping email for order ${order.orderUid}: No downloadUrl or buyer email`);
                }

                console.log(`✅ Order ${order.orderUid} completed`);
            }
        } catch (error) {
            console.error("Error processing checkout session:", error.message);
            return res.status(500).send("Internal Server Error");
        }
    } else if (event.type === "checkout.session.expired") {
        const session = event.data.object;

        const order = await Order.findOne({ stripeSessionId: session.id });

        if (order && order.status === "pending") {
            order.status = "canceled"; // or "expired"
            await order.save();

            console.log(`⛔ Order ${order.orderUid} expired`);
        }
    } else {
        // Log unhandled events for debugging purposes
        console.log(`Unhandled webhook event: ${event.type}`);
    }

    // Respond with 200 OK to acknowledge receipt of the event
    res.json({ received: true });
};