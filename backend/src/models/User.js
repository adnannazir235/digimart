const mongoose = require("mongoose");
const { hashPassword } = require("../utils/validation");
const { setAvatar } = require("../utils/cloudinary");
const { generateAccessToken, generateRefreshToken } = require("../utils/token");
const { user: userConfig } = require("../config/validation");

const userSchema = new mongoose.Schema({
    name: { type: String, minlength: userConfig.minNameLength, maxlength: userConfig.maxNameLength, trim: true, required: false },
    username: {
        type: String,
        minlength: userConfig.minUserNameLength,
        maxlength: userConfig.maxUserNameLength,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
        match: [/^[a-z0-9_]+$/, "Username can only contain letters, numbers, and underscores"],
        set: function (value) {
            if (!value) return value;
            let sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, "_");
            return sanitized.length > 16 ? sanitized.slice(0, 16) : sanitized;
        }
    },
    email: {
        type: String,
        minlength: userConfig.minEmailLength,
        maxlength: userConfig.maxEmailLength,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"]
    },
    age: { type: Number, min: userConfig.minUserAge, max: userConfig.maxUserAge, required: false },
    role: { type: String, enum: ["buyer", "seller"], default: "buyer", required: false },
    sellerOnboardingComplete: { type: Boolean, default: false },
    isSeller: { type: Boolean, default: false },
    password: {
        type: String,
        minlength: userConfig.minPassLength,
        maxlength: userConfig.maxPassLength,
        select: false,
        required: function () {
            return !this.googleId;
        },
        validate: {
            validator: function (value) {
                if (this.googleId) return true;
                return value != null;
            },
            message: "Password is required."
        }
    },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    lastVerificationEmailSent: { type: Date },
    lastPasswordRequest: { type: Date },
    resetPasswordToken: { type: String, select: false },
    lastResetPasswordRequest: { type: Date },
    avatar: { type: String, maxlength: userConfig.maxUserAvatarLength, default: setAvatar },
    bio: { type: String, maxlength: userConfig.maxUserBioLength, default: "", trim: true },
    country: { type: String, enum: userConfig.allowedCountries.map(country => country.name), required: false },
    googleId: { type: String, unique: true, sparse: true, select: false },
    googleTokens: {
        access_token: { type: String, select: false },
        refresh_token: { type: String, select: false },
        id_token: { type: String, select: false },
        scope: { type: String, select: false },
        token_type: { type: String, select: false },
        expiry_date: { type: Date, select: false }
    },
    refreshTokenSelector: { type: String, select: false, index: true },
    refreshTokenHash: { type: String, select: false },
    refreshTokenExpiry: { type: Date, select: false },
    lastAccessToken: { type: String, select: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date }
}, { timestamps: true });

userSchema.pre("save", async function (next) {
    if (this.isModified("password") && this.password) this.password = await hashPassword(this.password); // Check if password is modified, if yes then Hash it before saving...
    next();
});

userSchema.statics.signup = async function (userData) {
    const user = new this(userData);
    return await user.save();
};

userSchema.methods.generateAuthTokensAndSave = async function (refreshTokenExpiryTime) {
    // Generating refresh and access token with User's doc ID, email in access token and saving
    // refreshTokenHash, refreshTokenSelector and refreshTokenExpiry in the User's doc in DB...
    const payload = { id: this._id, email: this.email };
    const accessToken = generateAccessToken(payload, "10m");
    const { rawToken, selector, hash } = generateRefreshToken();

    this.refreshTokenSelector = selector;
    this.refreshTokenHash = hash;
    this.refreshTokenExpiry = new Date(Date.now() + refreshTokenExpiryTime);
    this.lastAccessToken = accessToken;
    await this.save();

    return { accessToken, refreshToken: rawToken };
};

userSchema.methods.invalidateRefreshAndAccessToken = async function () {
    this.refreshTokenSelector = undefined;
    this.refreshTokenHash = undefined;
    this.refreshTokenExpiry = undefined;
    this.lastAccessToken = undefined;
    await this.save();
};

module.exports = mongoose.model("users", userSchema, "Users");