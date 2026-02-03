const mongoose = require("mongoose");
const { shop: shopConfig } = require("../config/validation");

const shopSchema = new mongoose.Schema({
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true, index: true },
    shopName: { type: String, minlength: shopConfig.minShopNameLength, maxlength: shopConfig.maxShopNameLength, trim: true, required: [true, "Shop name is required"], match: [/^[a-zA-Z0-9\s_-]+$/, "Shop name can only contain letters, numbers, spaces, underscores, and hyphens"], unique: true },
    description: { type: String, maxlength: shopConfig.maxShopDescriptionLength, trim: true, default: "" },
    logo: { type: String, maxlength: shopConfig.maxShopLogoLength, trim: true, default: "" },
    stripeAccountId: { type: String, default: null },
    isStripeConnected: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: true },
    deletedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model("shops", shopSchema, "Shops");