const JWT = require("jsonwebtoken");
const User = require("../models/User");
const BlackListedToken = require("../models/BlackListedToken");
const { verifyPassword, userNameChecks, emailChecks, passChecks, confirmPassChecks, ageChecks, nameChecks, avatarChecks, bioChecks, shopLogoChecks, shopDescriptionChecks, shopNameChecks, countryChecks } = require("../utils/validation");
const { hashToken } = require("../utils/token");

exports.validateRegisterInputs = (req, res, next) => {
    const { username, email, country, password, confirmPassword } = req.body;

    const userNameReturned = userNameChecks(username);
    if (userNameReturned) {
        return res.status(400).json({
            success: false,
            field: "username",
            message: userNameReturned.message
        });
    }

    const emailReturned = emailChecks(email);
    if (emailReturned) {
        return res.status(400).json({
            success: false,
            field: "email",
            message: emailReturned.message
        });
    }

    if (country) {
        const countryReturned = countryChecks(country);
        if (countryReturned) {
            return res.status(400).json({
                success: false,
                field: "country",
                message: countryReturned.message
            });
        }
    }

    const passReturned = passChecks(password);
    if (passReturned) {
        return res.status(400).json({
            success: false,
            field: "password",
            message: passReturned.message
        });
    }

    const confirmPassReturned = confirmPassChecks(password, confirmPassword);
    if (confirmPassReturned) {
        return res.status(400).json({
            success: false,
            field: "confirmPassword",
            message: confirmPassReturned.message
        });
    }

    req.validatedData = { username, email, country, password };
    delete req.validatedData.confirmPassword;
    next();
};

exports.validateLoginInputs = (req, res, next) => {
    const { username, email, password } = req.body;

    // Make sure only one is provided between Email and Username (not both)...
    if ((!username && !email) || (username && email)) {
        return res.status(400).json({
            success: false,
            field: "usernameOrEmail",
            message: "Provide either a username OR an email (only one is allowed)."
        });
    }

    // Run Username validations if available...
    const userNameReturned = userNameChecks(username);
    if (username && userNameReturned) {
        return res.status(400).json({
            success: false,
            field: "username",
            message: userNameReturned.message
        });
    }

    // Run Email validations if available...
    const emailReturned = emailChecks(email);
    if (email && emailReturned) {
        return res.status(400).json({
            success: false,
            field: "email",
            message: emailReturned.message
        });
    }

    const passReturned = passChecks(password);
    if (passReturned) {
        return res.status(400).json({
            success: false,
            field: "password",
            message: passReturned.message
        });
    }

    req.validatedData = {
        ...(username ? { username } : { email }),
        password
    };
    next();
};

exports.validateResendEmailInputs = (req, res, next) => {
    const { email } = req.body;

    const emailReturned = emailChecks(email);
    if (emailReturned) {
        return res.status(400).json({
            success: false,
            field: "email",
            message: emailReturned.message
        });
    }

    req.validatedData = { email };
    next();
};

exports.validatePassword = async (req, res, next) => {
    const user = req.user;

    if (user.googleId) {
        return next();
    }

    if (!req?.body?.password) {
        return res.status(400).json({
            success: false,
            message: "Password is required to delete your account."
        });
    }

    try {
        const isMatch = await verifyPassword(req.body.password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Password is incorrect."
            });
        }

        next();
    } catch (error) {
        console.error("🚫 Password verification error:", error);
        return res.status(500).json({
            success: false,
            message: "Error verifying password. Try again later."
        });
    }
};

exports.authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "No access token provided"
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        // Check if token is blacklisted
        const blacklisted = await BlackListedToken.findOne({ token });
        if (blacklisted) {
            return res.status(401).json({
                success: false,
                message: "Access Token has been revoked"
            });
        }

        const decoded = JWT.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded.id).select("+googleId +password +resetPasswordToken +lastAccessToken +googleTokens.access_token +googleTokens.refresh_token");
        if (!user || user.isDeleted) {
            return res.status(401).json({
                success: false,
                message: "Account doesn't exist"
            });
        }

        req.user = user;
        req.decoded = { ...decoded, token };
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Access Token has expired"
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Access Token is Invalid"
            });
        }

        console.error("🚫 Auth middleware error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error during authentication"
        });
    }
};

exports.optionalAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
            const token = authHeader.split(" ")[1];
            const blacklisted = await BlackListedToken.findOne({ token });
            if (blacklisted) {
                return next();
            }

            const decoded = JWT.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
            const user = await User.findById(decoded.id);
            if (user && !user.isDeleted) {
                req.user = user;
                req.token = token;
            }
        } catch (error) {
            // Silently ignore invalid/expired tokens
        }
    }

    next();
};

exports.validateRefreshToken = async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({
            success: false,
            message: "No refresh token provided. Please log in to get a new one."
        });
    }

    try {
        const selector = refreshToken.slice(0, 8); // Getting selector...
        const hashedToken = hashToken(refreshToken); // Hashing the token...
        const user = await User.findOne({ refreshTokenSelector: selector }).select("+refreshTokenHash +refreshTokenExpiry +lastAccessToken");

        // Checking if the User doesn't exist OR his account is deleted OR no refreshToken assigned to him...
        if (!user || user.isDeleted || !user.refreshTokenHash) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired refresh token"
            });
        }

        // Verifying the token, that is it valid or not, by comparing it with the one saved in the User's doc...
        if (user.refreshTokenHash !== hashedToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token"
            });
        }

        // Checking if the token is expired or not...
        if (user.refreshTokenExpiry && new Date() > user.refreshTokenExpiry) {
            return res.status(403).json({
                success: false,
                message: "Refresh token has expired. Please log in again."
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("🚫 Refresh token validation error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to validate refresh token"
        });
    }
};

exports.validateUpdateProfileInputs = (req, res, next) => {
    const { name, username, age, avatar, bio } = req.body;

    // Check if at least one field is provided
    if (!name && !username && !age && !avatar && !bio) {
        return res.status(400).json({
            success: false,
            message: "At least one of the following fields must be provided: 'name', 'username', 'age', 'avatar', 'bio', 'country."
        });
    }

    // Run Name validation if provided
    if (name) {
        const nameValidation = nameChecks(name);
        if (nameValidation) {
            return res.status(400).json({
                success: false,
                field: "name",
                message: nameValidation.message
            });
        }
    }

    // Run Username validation if provided
    if (username) {
        const usernameValidation = userNameChecks(username);
        if (usernameValidation) {
            return res.status(400).json({
                success: false,
                field: "username",
                message: usernameValidation.message
            });
        }
    }

    // Run Age validation if provided
    if (age) {
        const ageValidation = ageChecks(age);
        if (ageValidation) {
            return res.status(400).json({
                success: false,
                field: "age",
                message: ageValidation.message
            });
        }
    }

    // Run Avatar validation if provided
    if (avatar) {
        const avatarValidation = avatarChecks(avatar);
        if (avatarValidation) {
            return res.status(400).json({
                success: false,
                field: "avatar",
                message: avatarValidation.message
            });
        }
    }

    // Run Bio validation if provided
    if (bio) {
        const bioValidation = bioChecks(bio);
        if (bioValidation) {
            return res.status(400).json({
                success: false,
                field: "bio",
                message: bioValidation.message
            });
        }
    }

    req.validatedData = {};
    if (name) req.validatedData.name = name;
    if (username) req.validatedData.username = username;
    if (age) req.validatedData.age = age;
    if (avatar) req.validatedData.avatar = avatar;
    if (bio) req.validatedData.bio = bio;
    next();
};

const validateShopData = (isUpdating = false) => (req, res, next) => {
    const { shopName, description, logo } = req.body;

    // Check if at least one field is provided (for updates)
    if (isUpdating && !shopName && !description && !logo) {
        return res.status(400).json({
            success: false,
            message: "At least one of the following fields must be provided: 'shopName', 'description', 'logo'."
        });
    }

    // Check if shopName is provided (for creation)
    if (!isUpdating && !shopName) {
        return res.status(400).json({
            success: false,
            field: "shopName",
            message: "Shop name is required."
        });
    }

    // Run shopName validation if provided
    if (shopName) {
        const shopNameValidation = shopNameChecks(shopName);
        if (shopNameValidation) {
            return res.status(400).json({
                success: false,
                field: "shopName",
                message: shopNameValidation.message
            });
        }
    }

    // Run Description validation if provided
    if (description) {
        const descriptionValidation = shopDescriptionChecks(description);
        if (descriptionValidation) {
            return res.status(400).json({
                success: false,
                field: "description",
                message: descriptionValidation.message
            });
        }
    }

    // Run Logo validation if provided
    if (logo) {
        const logoValidation = shopLogoChecks(logo);
        if (logoValidation) {
            return res.status(400).json({
                success: false,
                field: "logo",
                message: logoValidation.message
            });
        }
    }

    // Store validated data
    req.validatedData = {};
    if (shopName) req.validatedData.shopName = shopName.trim();
    if (description) req.validatedData.description = description.trim();
    if (logo) req.validatedData.logo = logo.trim();
    next();
};

// Export specific middleware for create and update
exports.validateShopInputs = validateShopData(false); // For creating shops, shopName is required
exports.validateUpdateShopInputs = validateShopData(true); // For updating shops, at least one field is required