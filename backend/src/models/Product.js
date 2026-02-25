const mongoose = require("mongoose");
const { product: productConfig } = require("../config/validation");
const { user: userConfig } = require("../config/validation");
const { allowedMimeTypes } = require("../config/upload");

const productSchema = new mongoose.Schema({
    title: { type: String, minlength: productConfig.minTitleLength, maxlength: productConfig.maxTitleLength, trim: true, required: true },
    description: { type: String, minlength: productConfig.minDescriptionLength, maxlength: productConfig.maxDescriptionLength, trim: true, required: true },
    price: { type: Number, required: true, min: [0, "Price cannot be negative"] }, // in cents
    currencyCode: { type: String, enum: userConfig.allowedCountries.map(country => country.currencyCode), default: "USD", required: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    stats: {
        totalSales: { type: Number, default: 0 },
        totalDownloads: { type: Number, default: 0 },
        ratingAvg: { type: Number, default: 0 }
    },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "shops", required: true },
    fileUrl: { type: String, required: true },
    cloudinaryPublicId: { type: String, select: false },
    cloudinarySecureUrl: { type: String },
    watermarkedFileUrl: { type: String },
    watermarkedPublicId: { type: String },
    mimeType: { type: String, enum: allowedMimeTypes, required: true }
}, { timestamps: true });

module.exports = mongoose.model("products", productSchema, "Products");