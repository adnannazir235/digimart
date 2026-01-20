const mongoose = require("mongoose");
const { user: userConfig } = require("../config/validation");

const orderSchema = new mongoose.Schema({
    orderUid: { type: String, required: true, unique: true },
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "products", required: true }],
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    amount: { type: Number, required: true }, // in **cents**
    currencyCode: { type: String, enum: userConfig.allowedCountries.map(country => country.currencyCode), default: "USD", required: true },
    platformFee: { type: Number, required: true }, // your cut, in cents
    status: { type: String, enum: ["pending", "completed", "refunded", "canceled", "failed"], default: "pending" },
    stripeSessionId: { type: String, required: true },
    downloadUrl: { type: String, select: false },
    downloadExpiry: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("orders", orderSchema, "Orders");