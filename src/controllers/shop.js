const { default: mongoose } = require("mongoose");
const Shop = require("../models/Shop");
const Product = require("../models/Product");
const { sanitizeShop } = require("../utils/filtering");
const { sendSellerOnboardingEmail } = require("../utils/sendSellerEmail");

exports.createShop = async (req, res) => {
    const user = req.user;
    const { shopName, description, logo } = req.validatedData;

    if (user.isSeller || user.role !== "buyer" || !user.isEmailVerified) {
        return res.status(403).json({
            status: false,
            message: "Only verified buyers can create a shop."
        });
    }

    try {
        const shop = await Shop.create({
            sellerId: user._id,
            shopName,
            description,
            logo,
            stripeAccountId: null,
            isStripeConnected: false,
            isActive: true,
            isDeleted: false
        });

        user.role = "seller";
        user.isSeller = true;
        user.sellerOnboardingComplete = false;
        await user.save();

        await sendSellerOnboardingEmail(user);

        return res.status(201).json({
            status: true,
            message: "Shop created successfully. Next: connect your Stripe account.",
            data: {
                shop: sanitizeShop(shop)
            }
        });

    } catch (err) {
        console.error("createShop error:", err);

        if (err.code === 11000 && err.keyPattern?.shopName) {
            return res.status(409).json({
                status: false,
                message: "A shop with this name already exists."
            });
        }

        if (err.name === "ValidationError") {
            return res.status(400).json({
                status: false,
                message: "Validation failed.",
                errors: Object.values(err.errors).map(e => e.message)
            });
        }

        return res.status(500).json({
            status: false,
            message: "Failed to create a shop."
        });
    }
};

exports.getAll = async (req, res) => {
    try {
        const shops = await Shop.find({ isActive: true, isDeleted: false })
            .populate("sellerId", "name username")
            // .select("-cloudinaryPublicId")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: shops.map(s => sanitizeShop(s))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch shops",
            error: error.message
        });
    }
};

exports.getMy = async (req, res) => {
    try {
        const user = req.user;

        // Find the shop by sellerId (user._id)
        const shop = await Shop.findOne({ sellerId: user._id, isDeleted: { $ne: true } });
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: "Shop not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Shop retrieved successfully!",
            data: { shop: sanitizeShop(shop) }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error retrieving shop! Try again later."
        });
    }
};

exports.updateShop = async (req, res) => {
    try {
        const user = req.user;
        const updates = req.validatedData;

        // Find the shop by sellerId (user._id)
        const shop = await Shop.findOne({ sellerId: user._id, isDeleted: false });
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: "Shop not found."
            });
        }

        if (!shop.isActive) {
            return res.status(404).json({
                success: false,
                message: "Please activate the shop first, in order to update it."
            });
        }

        // Apply updates
        Object.assign(shop, updates);
        await shop.save();

        res.status(200).json({
            success: true,
            message: "Shop info updated successfully!",
            data: { shop: sanitizeShop(shop) }
        });
    } catch (err) {
        console.error("Error updating shop:", err);

        // Handle MongoDB duplicate key error for shopName
        if (err.code === 11000 && err.keyPattern?.shopName) {
            return res.status(409).json({
                success: false,
                field: "shopName",
                message: "Shop name is already taken."
            });
        }

        res.status(500).json({
            success: false,
            message: "Server error while updating shop.",
            error: err.message || err
        });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        // 1. Validate shop ID
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                status: "Error deleting the Shop! Try Again...",
                message: "Invalid shop ID",
            });
        }

        // 2. Find the shop
        const shop = await Shop.findById(id);
        if (!shop || shop.isDeleted) {
            return res.status(404).json({
                success: false,
                status: "Error deleting the Shop! Try Again...",
                message: "Shop not found",
            });
        }

        // 3. Check authorization
        if (shop.sellerId.toString() !== user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You're not authorized to delete this shop",
            });
        }

        // 4. Soft delete the shop
        shop.isDeleted = true;
        shop.deletedAt = new Date();
        await shop.save();

        // 5. Soft delete all products associated with the shop
        await Product.updateMany(
            { shopId: id, isDeleted: false },
            { $set: { isDeleted: true, deletedAt: new Date() } }
        );

        // 6. Update user's role and isSeller
        user.role = "buyer";
        user.isSeller = false;
        await user.save();

        res.status(204).send();
    } catch (error) {
        console.error("Error deleting shop and products:", error);
        res.status(500).json({
            success: false,
            status: "Error deleting the Shop! Try Again...",
            message: error.message || "Server error",
        });
    }
};