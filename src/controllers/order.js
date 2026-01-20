const Order = require("../models/Order");
const { sanitizeOrder } = require("../utils/filtering");

exports.getMyOrders = async (req, res) => {
    try {
        const buyerId = req.user._id;

        // Corrected query to use 'productIds' array and deep population
        const orders = await Order.find({ buyerId })
            .select("-productIds -buyerId -downloadExpiry")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: orders.map(o => sanitizeOrder(o)),
            count: orders.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch your orders",
            error: error.message
        });
    }
};

exports.getSingleOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user._id.toString();

        // 1. Fetch order by UID only, do not filter by buyer yet
        const order = await Order.findOne({ orderUid: id })
            .select("-stripeSessionId") // hide Stripe session
            .populate({
                path: "buyerId",
                select: "name email avatar",
            })
            .populate({
                path: "productIds",
                select: "title description price shopId fileUrl",
                populate: {
                    path: "shopId",
                    select: "sellerId shopName",
                },
            });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // 2. Determine user relationship
        const isBuyer = order.buyerId._id.toString() === currentUserId;

        const sellerProducts = order.productIds.filter(p => p.shopId.sellerId.toString() === currentUserId);
        const isSeller = sellerProducts.length > 0;

        // 3. Authorization check
        if (!isBuyer && !isSeller) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        // 4. Filter order for seller view
        let orderForResponse = order.toObject();

        if (isSeller && !isBuyer) {
            // Replace productIds with only seller-owned products
            orderForResponse.productIds = sellerProducts.map((p) => ({
                ...p.toObject(),
                shopId: {
                    _id: p.shopId._id,
                    shopName: p.shopId.shopName,
                    sellerId: p.shopId.sellerId,
                },
            }));
        }

        // 5. Return same response structure
        return res.json({
            success: true,
            data: orderForResponse,
        });
    } catch (error) {
        console.error("Error fetching single order:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch order details",
            error: error.message,
        });
    }
};

exports.getMySales = async (req, res) => {
    try {
        if (req.user.role !== "seller") {
            return res.status(403).json({
                success: false,
                message: "Only sellers can view sales"
            });
        }

        const sellerId = req.user._id;

        const orders = await Order.find({ status: "completed" })
            .populate({
                path: "productIds",
                select: "title price currencyCode shopId",
                populate: {
                    path: "shopId",
                    match: { sellerId },
                    select: "shopName sellerId"
                }
            })
            .populate("buyerId", "name username email")
            .sort({ createdAt: -1 });

        // Keep only products sold by this seller
        const sales = orders
            .map(order => {
                const sellerProducts = order.productIds.filter(
                    product => product.shopId
                );

                if (!sellerProducts.length) return null;

                return order;
            })
            .filter(Boolean);

        return res.status(200).json({
            success: true,
            data: sales,
            count: sales.length
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch your sales",
            error: error.message
        });
    }
};

exports.downloadOrderProducts = async (req, res) => {
    try {
        const { orderId, productId } = req.params;
        const userId = req.user._id;

        const order = await Order.findOne({ orderId })
            .populate({
                path: "productIds",
                select: "fileUrl"
            });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Buyer ownership check
        if (order.buyerId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to download this product"
            });
        }

        // Order completion check
        if (order.status !== "completed") {
            return res.status(403).json({
                success: false,
                message: "Order is not completed"
            });
        }

        // Download expiry check
        if (order.downloadExpiry && new Date() > order.downloadExpiry) {
            return res.status(403).json({
                success: false,
                message: "Download link has expired"
            });
        }

        const product = order.productIds.find(
            p => p._id.toString() === productId
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found in this order"
            });
        }

        return res.redirect(product.fileUrl);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to download product",
            error: error.message
        });
    }
};