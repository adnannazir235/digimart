const mongoose = require("mongoose");

const blackListedTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
        index: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, { timestamps: true });

// TTL index on expiresAt field (expires immediately when expiresAt is reached)
blackListedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to blacklist a token only if it's not expired
blackListedTokenSchema.statics.addToBlackList = async function (token, userId, expiresAt) {
    if (!token || !userId || !expiresAt) {
        console.warn(`🚫 Skipping blacklist: Missing required fields (token: ${token}, userId: ${userId}, expiresAt: ${expiresAt})`);
        return null;
    }

    if (expiresAt && expiresAt.getTime() <= Date.now()) {
        console.log(`🚫 Skipping blacklist for expired token for user ${userId}`);
        return null;
    }

    try {
        return await this.create({ token, userId, expiresAt });
    } catch (error) {
        console.error(`⚠️ Failed to blacklist token for user ${userId}: ${error.message}`);
        throw error;
    }
};

module.exports = mongoose.model("blackListedTokens", blackListedTokenSchema, "BlackListedTokens");