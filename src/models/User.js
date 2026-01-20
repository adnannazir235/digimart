const mongoose = require("mongoose");
const { hashPassword } = require("../utils/validation");
const { setAvatar } = require("../utils/cloudinary");
const { generateAccessToken, generateRefreshToken } = require("../utils/token");
const { user: userConfig } = require("../config/validation");

const userSchema = new mongoose.Schema({
    name: { type: String, minlength: userConfig.minNameLength, maxlength: userConfig.maxNameLength, trim: true, required: false }, // Allowed in updateProfile
    username: { // Allowed in updateProfile
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
    email: { // Will get changed in the users/changeEmail controller
        type: String,
        minlength: userConfig.minEmailLength,
        maxlength: userConfig.maxEmailLength,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"]
    },
    age: { type: Number, min: userConfig.minUserAge, max: userConfig.maxUserAge, required: false }, // Allowed in updateProfile
    role: { type: String, enum: ["buyer", "seller"], default: "buyer", required: false }, // Will get changed in the becomeSeller and deleteSellerAccount controller
    sellerOnboardingComplete: { type: Boolean, default: false }, // Will get changed in the becomeSeller and in deleteSellerAccount controller
    isSeller: { type: Boolean, default: false }, // Will get changed in the becomeSeller and in deleteSellerAccount controller
    password: { // Is getting changed in the set, change and forgot/reset password controllers
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
    isEmailVerified: { type: Boolean, default: false }, // Is getting changed in the register and resendVerificationEmail and in login controller
    emailVerificationToken: { type: String, select: false }, // Is getting changed in the register and resendVerificationEmail and in login controller
    lastVerificationEmailSent: { type: Date }, // Is getting changed in the register and resendVerificationEmail and in login controller
    lastPasswordRequest: { type: Date }, // Is getting changed in the set and change password controllers
    resetPasswordToken: { type: String, select: false }, // Is getting changed in the forgot/reset password controllers
    lastResetPasswordRequest: { type: Date }, // Is getting changed in the forgot/reset password controllers
    avatar: { type: String, maxlength: userConfig.maxUserAvatarLength, default: setAvatar }, // Allowed in updateProfile
    bio: { type: String, maxlength: userConfig.maxUserBioLength, default: "", trim: true }, // Allowed in updateProfile
    country: { type: String, enum: userConfig.allowedCountries.map(country => country.name), required: false },
    googleId: { type: String, unique: true, sparse: true, select: false }, // Is getting changed in the googleAuthCallback controller
    googleTokens: { // Is getting changed in the googleAuthCallback controller
        access_token: { type: String, select: false },
        refresh_token: { type: String, select: false },
        id_token: { type: String, select: false },
        scope: { type: String, select: false },
        token_type: { type: String, select: false },
        expiry_date: { type: Date, select: false }
    },
    refreshTokenSelector: { type: String, select: false, index: true }, // Is getting changed in the login, googleAuthCallback, logut and deleteAccount controller
    refreshTokenHash: { type: String, select: false }, // Is getting changed in the login, googleAuthCallback, logut and deleteAccount controller
    refreshTokenExpiry: { type: Date, select: false }, // Is getting changed in the login, googleAuthCallback, logut and deleteAccount controller
    lastAccessToken: { type: String, select: false }, // Is getting changed in the login, googleAuthCallback, logut and deleteAccount controller
    isDeleted: { type: Boolean, default: false }, // Is getting changed in the deleteAccount controller
    deletedAt: { type: Date } // Is getting changed in the deleteAccount controller
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