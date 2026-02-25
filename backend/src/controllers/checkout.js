const { v4: uuidv4 } = require("uuid");
const stripe = require("../config/stripe");
const Product = require("../models/Product");
const Shop = require("../models/Shop");
const Order = require("../models/Order");

exports.createCheckoutSession = async (req, res) => {
    const { productIds } = req.body;
    const buyerId = req.user._id.toString();

    if (!Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
    }

    const products = await Product.find({ _id: { $in: productIds }, isDeleted: false, isActive: true })
        .populate({
            path: 'shopId',
            select: 'sellerId',
            populate: { path: 'sellerId', select: '_id' }
        });

    if (products.length !== productIds.length) {
        return res.status(404).json({ error: "Some products not found" });
    }

    const owned = products.find(p => p.shopId?.sellerId?._id.toString() === buyerId);
    if (owned) {
        return res.status(403).json({ error: `You cannot buy your own product: ${owned.title}` });
    }

    const existing = await Order.findOne({
        productIds: { $in: productIds },
        buyerId,
        status: "completed"
    });
    if (existing) {
        return res.status(403).json({
            error: "You have already purchased one of these products",
            orderUid: existing.orderUid
        });
    }

    const pendingOrder = await Order.findOne({
        buyerId,
        productIds: { $in: productIds },
        status: "pending",
    }).sort({ createdAt: -1 });

    if (pendingOrder) {
        const ageMs = Date.now() - pendingOrder.createdAt.getTime();

        // 30 minutes = same as Checkout minimum expiry
        if (ageMs < 30 * 60 * 1000) {
            return res.status(409).json({
                error: "You already have a checkout in progress",
                orderUid: pendingOrder.orderUid,
            });
        }
    }

    const sellerIds = [...new Set(products.map(p => p.shopId?.sellerId?._id.toString()))];
    if (sellerIds.length > 1) {
        return res.status(400).json({
            error: "Products from multiple sellers. Checkout one seller at a time."
        });
    }
    const singleSellerId = sellerIds[0];

    const shop = await Shop.findOne({ sellerId: singleSellerId });
    if (!shop || !shop.isStripeConnected || !shop.stripeAccountId) {
        return res.status(403).json({ error: "Seller not connected to Stripe" });
    }
    const accountId = shop.stripeAccountId;

    let totalUsdCents = 0;
    let platformFeeUsdCents = 0;
    const productUsdCents = []; // To store the final price per product, including platform fee

    // Calculate the product prices + platform fee
    for (const product of products) {
        const localCents = Math.round(product.price); // Price in cents (USD)
        const platformFeeForProduct = Math.round(localCents * (process.env.PLATFORM_FEE_PERCENT / 100)); // Platform fee per product
        const finalPriceWithFee = localCents + platformFeeForProduct; // Product price + platform fee

        productUsdCents.push(finalPriceWithFee); // Store the final price for each product (price + fee)

        totalUsdCents += finalPriceWithFee; // Total USD for all products (including fees)
        platformFeeUsdCents += platformFeeForProduct; // Total platform fee
    }

    if (totalUsdCents < 50) {
        return res.status(400).json({ error: "Cart total too low ($0.50 min)" });
    }

    const orderUid = uuidv4();
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: products.map((product, index) => ({
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: product.title,
                    },
                    unit_amount: productUsdCents[index], // Final price including the platform fee
                },
                quantity: 1,
            })),
            mode: "payment",
            success_url: process.env.STRIPE_SUCCESS_URL,
            cancel_url: process.env.STRIPE_CANCEL_URL,
            expires_at: Math.floor(Date.now() / 1000) + (30 * 60),
            payment_intent_data: {
                application_fee_amount: platformFeeUsdCents, // The total platform fee (still passed to Stripe for fee splitting)
                transfer_data: { destination: accountId }
            }
        });

        // Save ONE ORDER with all productIds (Fix #2)
        await Order.create({
            orderUid,
            productIds: products.map(p => p._id),
            buyerId,
            sellerId: singleSellerId,
            amount: totalUsdCents, // The total price paid (including fees)
            platformFee: platformFeeUsdCents, // Total platform fee
            stripeSessionId: session.id,
            status: "pending"
        });

        res.json({
            checkoutUrl: session.url,
            message: "Redirecting to payment"
        });
    } catch (error) {
        console.error("Stripe error:", error.message);
        res.status(500).json({ error: "Failed to create checkout session" });
    }
};