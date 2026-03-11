const google = require("googleapis").google;
const oauth2Client = require("../config/google");
const JWT = require("jsonwebtoken");
const User = require("../models/User");
const BlackListedToken = require("../models/BlackListedToken");
const { sanitizeUser } = require("../utils/filtering");
const { generateAccessToken, hashToken } = require("../utils/token");
const sendVerificationEmail = require("../utils/sendVerificationEmail");
const { uploadAvatar } = require("../services/cloudinary");
const { isCloudinaryUrl, isGoogleusercontent } = require("../utils/cloudinary");
const { verifyPassword, passChecks, confirmPassChecks, emailChecks } = require("../utils/validation");
const limitations = require("../config/validation");
const sendPasswordNotificationEmail = require("../utils/sendPasswordNotificationEmail");
const { sendResetPasswordEmail } = require("../utils/sendResetPasswordEmail");
const { createRedirectUrl } = require("../utils/createRedirectUrl");
const EMAIL_VERIFICATION_COOLDOWN = 5 * 60 * 1000; // 5 minutes
const refreshTokenExpiryTime = 7 * 24 * 60 * 60 * 1000; // 7 days

exports.registerAccount = async function (req, res) {
    const { username, email, country, password } = req.validatedData;

    try {
        // Checking if user exists in DB already or not, then saving it if no duplicate conflict occurred...
        const savedUser = await User.signup({ username, email, country, password });

        // Generating a JWT Token which contains User's Email for User's Email Verification...
        const verificationToken = generateAccessToken({ email: savedUser.email }, "1d");
        savedUser.emailVerificationToken = verificationToken;
        savedUser.lastVerificationEmailSent = new Date();

        await savedUser.save(); // Saving user doc with those fields...
        await sendVerificationEmail(savedUser); // Sending Verification Email...
        const safeUser = sanitizeUser(savedUser); // Sanitizing User's object that will be returned...

        res.status(201).json({
            success: true,
            message: "Registration successful! Please check your email to verify your account.",
            data: { user: safeUser }
        });
    } catch (error) {
        console.error("🚫 Signup error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Username or email already exists."
            });
        }

        if (error.name === "ValidationError") {
            return res.status(422).json({
                success: false,
                message: "Validation failed.",
                error: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Something went wrong during registration.",
            error: error.message || error,
        });
    }
};

exports.verifyUserEmail = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        const feUrl = createRedirectUrl("error", "Invalid verification link.", "login");
        return res.redirect(feUrl);
    }

    try {
        // Decoding the JWT from the token (Verification link)...
        const decoded = JWT.decode(token, process.env.JWT_ACCESS_TOKEN_SECRET);

        // Finding the user with his email...
        const user = await User.findOne({ email: decoded.email }).select("+emailVerificationToken"); // Selecting (need) emailVerificationToken for comparing...

        // Checking if user doesn't exist or his account is deleted...
        if (!user || user.isDeleted) {
            const feUrl = createRedirectUrl("error", "No account found.", "signup");
            return res.redirect(feUrl);
        }

        // Checking if his Email is already Verified...
        if (user.isEmailVerified) {
            const feUrl = createRedirectUrl("info", "Email is already verified.", "login");
            return res.redirect(feUrl);
        }

        // Comparing the token sent in Verification Link with the one in the DB in emailVerificationToken key in User's Doc...
        if (token !== user.emailVerificationToken) {
            const feUrl = createRedirectUrl("error", "Verification link is expired or invalid.", "login");
            return res.redirect(feUrl);
        }

        JWT.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);

        // Move forward to remove the fields and mark that the User verified his email...
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.lastVerificationEmailSent = undefined;
        await user.save();

        // Redirect the user (if frontend is present)
        const feUrl = createRedirectUrl("success", "Email verified successfully! You can now log in.", "login");
        return res.redirect(feUrl);
    } catch (error) {
        console.error("🚫 Email verification error:", error);

        let status = "error";
        let message = "Server error. Please try again later.";

        if (error.name === "TokenExpiredError") {
            message = "The verification link has expired. Please request a new one.";
            const feUrl = createRedirectUrl(status, message, "login");
            return res.redirect(feUrl);
        }

        if (error.name === "JsonWebTokenError") {
            message = "The verification link is invalid.";
            const feUrl = createRedirectUrl(status, message, "login");
            return res.redirect(feUrl);
        }
    }
};

exports.resendVerificationEmail = async (req, res) => {
    const { email } = req.validatedData;

    try {
        // Getting the user who isn't deleted with the provided Email...
        const user = await User.findOne({ email, isDeleted: { $ne: true } });

        if (!user) return res.status(404).json({ success: false, message: "No account found." }); // User doesn't exist...
        if (user.isEmailVerified) return res.status(200).json({ success: true, message: "Email already verified!" });

        // Checking that is it over 2 minutes (EMAIL_VERIFICATION_COOLDOWN) or under that the user is requesting again to resend the Email Verification Mail Link
        // to himself, if less then stop him if more then move forward...
        const now = new Date();
        if (user.lastVerificationEmailSent && (now - user.lastVerificationEmailSent) < EMAIL_VERIFICATION_COOLDOWN) {
            const timeLeft = Math.ceil((EMAIL_VERIFICATION_COOLDOWN - (now - user.lastVerificationEmailSent)) / 1000);
            return res.status(429).json({ success: false, message: `Please wait ${timeLeft}s before resending.` });
        }

        const token = generateAccessToken({ email }, "1d"); // Generating new Email Verification Token against User's Email...
        user.emailVerificationToken = token; // Setting the generated token in the User's Object...
        user.lastVerificationEmailSent = now; // Setting the time we're sending the Email again in the User's doc...

        await user.save();
        await sendVerificationEmail(user, true); // Sending the Verification Email (passing true for resending status/mark, instead of sending status/mark)...
        res.status(200).json({ success: true, message: "Verification email resent! Check your inbox." });
    } catch (error) {
        console.error("🚫 Resend verification email error:", error);
        res.status(500).json({ success: false, message: "Error resending verification email. Try again later." });
    }
};

exports.login = async (req, res) => {
    try {
        // Step 1: Look up user
        const { email, username, password } = req.validatedData;
        const query = email ? { email } : { username };
        const user = await User.findOne(query).select("+password +googleId +lastAccessToken");

        // Step 2: Validate credentials
        if (!user || user.isDeleted) {
            return res.status(404).json({
                success: false,
                message: "No account found with provided credentials."
            });
        }

        // Checking if User have already logged in with his Google Account and Password is missing in the DB, if yes them telling him to log in with his Google Account...
        if (user.googleId && !user.password) {
            return res.status(401).json({
                success: false,
                message: "You created your account with Google! Please log in with Google."
            });
        }

        // Checking if his Email is already Verified...
        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before logging in.",
                requiresVerification: true
            });
        }

        // Verifying the User's Password by comparing it with the (hashed) one saved in the DB...
        const isMatch = await verifyPassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Incorrect password."
            });
        }

        // Step 3: Blacklist previous access token if it exists
        if (user.lastAccessToken) {
            try {
                const decoded = JWT.verify(user.lastAccessToken, process.env.JWT_ACCESS_TOKEN_SECRET);
                if (decoded?.exp) {
                    await BlackListedToken.addToBlackList(
                        user.lastAccessToken,
                        user._id,
                        new Date(decoded.exp * 1000)
                    );
                    console.log(`🚫 Blacklisted previous access token for user ${user._id}`);
                }
            } catch (error) {
                console.warn(`⚠️  Failed to verify/blacklist previous access token for user ${user._id}: ${error.message}`);
            }
        }

        // Step 4: Generate new tokens and save to user doc
        const { accessToken, refreshToken } = await user.generateAuthTokensAndSave(refreshTokenExpiryTime);

        // Step 5: Set refresh token in HTTP-only cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: refreshTokenExpiryTime,
        });

        // Step 6: Send new access token in response
        console.log(`🔑 Login successful for user ${user._id}`);
        res.status(200).json({
            success: true,
            message: "Logged in successfully!",
            accessToken: accessToken,
            isCountrySelected: !!user.country === true ? undefined : !!user.country
        });
    } catch (error) {
        console.error("🚫 Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Login failed. Try again later.",
            error: error.message || error,
        });
    }
};

exports.getGoogleAuthUrl = (req, res) => {
    const state = req.query.redirectTo
        ? encodeURIComponent(JSON.stringify({ redirectTo: req.query.redirectTo }))
        : encodeURIComponent(JSON.stringify({ redirectTo: "settings" }));

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: [
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile"
        ],
        prompt: "consent select_account",
        state
    });

    console.log("Redirecting to Google auth URL:", authUrl);
    res.redirect(authUrl);
};

exports.googleAuthCallback = async (req, res) => {
    const { code, error, state } = req.query;

    if (error) {
        const message = error === "access_denied" ? "You canceled the login process." : "Authentication failed.";
        const feUrl = createRedirectUrl("error", message, "login");
        return res.redirect(feUrl);
    }

    if (!code) {
        const feUrl = createRedirectUrl("error", "Authorization code missing.", "login");
        return res.redirect(feUrl);
    }

    try {
        // 1. Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // 2. Get user data from Google
        const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
        const { data } = await oauth2.userinfo.get();
        const { id: googleId, email, name, picture } = data;

        // 3. Find user by email with all necessary fields selected
        const loginUser = await User.findOne({ email: email.toLowerCase() }).select("+googleTokens.access_token +googleTokens.refresh_token +googleTokens.id_token +googleTokens.scope +googleTokens.token_type +googleTokens.expiry_date +googleId +password +emailVerificationToken +refreshTokenHash +refreshTokenSelector +refreshTokenExpiry +lastAccessToken");

        // ✅ Case 1: User exists and is soft-deleted → block reuse
        if (loginUser && loginUser.isDeleted) {
            const feUrl = createRedirectUrl("error", "An account previously associated with this email has been deleted. To continue, use a different email address (or Google account). Account recovery will be available soon.", "signup");
            return res.redirect(feUrl);
        }

        let user = loginUser;

        // ✅ Case 2: User exists and is active → login (and link if not already linked)
        if (loginUser && !loginUser.isDeleted) {
            // If this is the first time with Google, link the Google ID
            if (!user.googleId) {
                user.googleId = googleId;
                user.name = name;
            }

            if (!user.isEmailVerified) {
                user.isEmailVerified = true;
                user.emailVerificationToken = undefined;
                user.lastVerificationEmailSent = undefined;
                user.password = undefined;
            }

            // Update avatar if missing, not on Cloudinary, or from Google (to sync changes)
            if (!user.avatar || !isCloudinaryUrl(user.avatar) || isGoogleusercontent(user.avatar)) {
                try {
                    const cloudinaryUrl = await uploadAvatar(picture, user.username);
                    if (cloudinaryUrl) user.avatar = cloudinaryUrl;
                } catch (uploadError) {
                    console.error("Avatar upload failed, using Google Picture URL:", uploadError.message);
                    user.avatar = picture;
                }
            }

            // Update Google tokens (always, for repeat logins)
            const updatedTokens = {
                access_token: tokens.access_token,
                scope: tokens.scope,
                token_type: tokens.token_type,
                id_token: tokens.id_token,
                expiry_date: tokens.expiry_date || user.googleTokens?.expiry_date,
                refresh_token: tokens.refresh_token || user.googleTokens?.refresh_token,
            };

            user.googleTokens = updatedTokens;
            await user.save();
        }

        // ✅ Case 3: No user exists → create new account
        else {
            let baseUsername = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_");
            baseUsername = baseUsername.substring(0, 15);

            let candidate;
            // Generating a unique username, retrying up to 10 times
            for (let i = 0; i < 10; i++) {
                const suffix = i === 0 ? "" : `_${i}`;
                candidate = `${baseUsername}${suffix}`.slice(0, limitations.user.maxUserNameLength);
                if (!await User.findOne({ username: candidate })) break;
            }

            if (!candidate) {
                const feUrl = createRedirectUrl("error", "Could not generate a unique username. Please try again.", "signup");
                return res.redirect(feUrl);
            }

            let avatarUrl = picture;
            // Upload avatar to Cloudinary if needed
            try {
                const cloudinaryUrl = await uploadAvatar(picture, candidate);
                if (cloudinaryUrl) avatarUrl = cloudinaryUrl;
            } catch (uploadError) {
                console.error("Avatar upload failed, using Google Picture URL:", uploadError.message);
            }

            user = await User.signup({
                username: candidate,
                email,
                name,
                googleId,
                avatar: avatarUrl,
                isEmailVerified: true,
                googleTokens: {
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token,
                    scope: tokens.scope,
                    token_type: tokens.token_type,
                    id_token: tokens.id_token,
                    expiry_date: tokens.expiry_date
                }
            });
        }

        // 4: Blacklist previous access token if it exists
        if (user.lastAccessToken) {
            try {
                const decoded = JWT.verify(user.lastAccessToken, process.env.JWT_ACCESS_TOKEN_SECRET);
                if (decoded?.exp) {
                    await BlackListedToken.addToBlackList(
                        user.lastAccessToken,
                        user._id,
                        new Date(decoded.exp * 1000)
                    );
                    console.log(`🚫 Blacklisted previous access token for user ${user._id}`);
                }
            } catch (error) {
                console.warn(`⚠️  Failed to verify/blacklist previous access token for user ${user._id}: ${error.message}`);
            }
        }

        // 5: Generate new tokens and save to user doc
        const { accessToken, refreshToken } = await user.generateAuthTokensAndSave(refreshTokenExpiryTime);

        console.log(`🔑 Google login successful for user ${user._id}`);

        // 6: Set refresh token in HTTP-only cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: refreshTokenExpiryTime,
        });

        // 7: Determine redirect path
        let redirectPath = "settings";
        try {
            const stateData = JSON.parse(decodeURIComponent(state));
            redirectPath = stateData.redirectTo || redirectPath;
        } catch (e) {
            console.warn("Invalid state parameter:", e.message);
        }

        console.log("This is redirectPath:>", redirectPath);

        // 8: Redirect to frontend with access token
        const feUrl = createRedirectUrl("success", "Logged in successfully with Google!", redirectPath, accessToken, isCountrySelected = !!user.country === true ? undefined : !!user.country);
        console.log("Redirecting (success):", feUrl);
        res.redirect(feUrl);
    } catch (error) {
        console.error("🚫 Google Auth Error:", error.message);
        const feUrl = createRedirectUrl("error", "Google authentication failed.", "login");
        console.log("Redirecting (error):", feUrl);
        res.redirect(feUrl);
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const user = req.user;

        // Blacklist the previous access token if it exists
        if (user.lastAccessToken) {
            try {
                const decoded = JWT.verify(user.lastAccessToken, process.env.JWT_ACCESS_TOKEN_SECRET);
                if (decoded?.exp) {
                    await BlackListedToken.addToBlackList(
                        user.lastAccessToken,
                        user._id,
                        new Date(decoded.exp * 1000)
                    );
                    console.log(`🚫 Blacklisted previous access token for user ${user._id}`);
                }
            } catch (error) {
                console.warn(`⚠️  Failed to verify/blacklist previous access token for user ${user._id}: ${error.message}`);
            }
        }

        // Generate new access token
        const payload = { id: user._id, email: user.email };
        const accessToken = generateAccessToken(payload, "10m");

        // Update lastAccessToken in user document
        user.lastAccessToken = accessToken;
        await user.save();

        console.log(`🔄 Refreshed access token for user ${user._id}`);

        res.status(200).json({
            success: true,
            accessToken: accessToken,
        });
    } catch (error) {
        console.error("🚫 Refresh token error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to refresh token. Please log in again.",
            error: error.message || error,
        });
    }
};

exports.logout = async (req, res) => {
    try {
        const user = req.user;
        const decoded = req.decoded;

        // Blacklist the current access token
        await BlackListedToken.addToBlackList(decoded.token, user._id, new Date(decoded.exp * 1000));
        console.log(`🚫 Blacklisted access token for user ${user._id}`);

        // Remove access token from user document and invalidate refresh token
        await User.updateOne(
            { _id: user._id },
            {
                $unset: {
                    refreshTokenSelector: "",
                    refreshTokenHash: "",
                    refreshTokenExpiry: "",
                    lastAccessToken: ""
                }
            }
        );

        console.log(`🚪 Logged out user ${user._id}`);

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict"
        });

        res.status(200).json({
            success: true,
            message: "Logged out successfully."
        });

    } catch (error) {
        console.error("🚫 Logout error:", error);
        res.status(500).json({
            success: false,
            message: "Logout failed. Try again later."
        });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const user = req.user;
        const decoded = req.decoded;

        // Blacklist the current access token
        await BlackListedToken.addToBlackList(decoded.token, user._id, new Date(decoded.exp * 1000));
        console.log(`🚫 Blacklisted access token for user ${user._id}`);

        // Revoke Google tokens if connected
        if (user.googleId) {
            const tokenToRevoke = user.googleTokens.refresh_token || user.googleTokens.access_token;
            console.log("tokenToRevoke:>", tokenToRevoke);
            if (tokenToRevoke) {
                try {
                    const revokedRes = await oauth2Client.revokeToken(tokenToRevoke);
                    if (revokedRes.status === 200) {
                        console.log(`Successfully revoked the token for Google Account: ${user.googleId} of user: ${user._id}`);
                    }
                } catch (revokeError) {
                    console.warn("⚠️ Google token revocation failed:", revokeError.message);
                    // Proceed anyway, but log the issue
                }
            }
        }

        // Soft delete the user and clear tokens
        await User.updateOne(
            { _id: user._id },
            {
                $set: { isDeleted: true, deletedAt: new Date() },
                $unset: {
                    googleTokens: "",
                    googleId: "",
                    refreshTokenHash: "",
                    refreshTokenSelector: "",
                    refreshTokenExpiry: "",
                    lastAccessToken: ""
                }
            }
        );

        console.log(`🗑️ Deleted account for user ${user._id}`);

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict"
        });

        res.status(204).send();
    } catch (error) {
        console.error("🚫 Delete account error:", error);
        res.status(500).json({
            success: false,
            message: "Server error. Try again later."
        });
    }
};

exports.setPassword = async (req, res) => {
    const { password, confirmPassword } = req.body;
    const user = req.user;
    const cooldownMs = 5 * 60 * 1000; // 5 minutes
    const now = new Date();

    // Unverified email: 403 error
    if (!user.isEmailVerified) {
        return res.status(403).json({
            success: false,
            message: "Please verify your email before setting a password."
        });
    }

    // Non-Google user or existing password: 403 error
    if (!user.googleId || user.password) {
        return res.status(403).json({
            success: false,
            message: user.password
                ? "You already have a password set. Use 'Change Password' to update it."
                : "This endpoint is for Google-authenticated users only."
        });
    }

    // Invalid password: 400 error
    const passError = passChecks(password);
    if (passError) {
        return res.status(400).json({
            success: false,
            field: "password",
            message: passError.message
        });
    }

    // Invalid confirmPassword: 400 error
    const confirmPassError = confirmPassChecks(password, confirmPassword);
    if (confirmPassError) {
        return res.status(400).json({
            success: false,
            field: "confirmPassword",
            message: confirmPassError.message
        });
    }

    // Cooldown active: 429 error
    if (user.lastPasswordRequest && (now - user.lastPasswordRequest) < cooldownMs) {
        const timeLeftSeconds = Math.ceil((cooldownMs - (now - user.lastPasswordRequest)) / 1000);
        return res.status(429).json({
            success: false,
            message: `Please wait ${timeLeftSeconds}s before trying again.`
        });
    }

    try {
        user.password = password;
        user.lastPasswordRequest = undefined;
        await user.save();

        await sendPasswordNotificationEmail(user, "set");

        res.status(200).json({
            success: true,
            message: "Password set successfully. You can now log in manually."
        });
    } catch (error) {
        console.error("🚫 Set password error:", error.message);

        // Database failure: 500 error
        user.lastPasswordRequest = now;
        await user.save();

        res.status(500).json({
            success: false,
            message: "Failed to set password.",
            error: error.message
        });
    }
};

exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    const user = req.user;
    const cooldownMs = 2 * 60 * 1000;
    const now = new Date();

    // Unverified email: 403 error
    if (!user.isEmailVerified) {
        return res.status(403).json({
            success: false,
            message: "Please verify your email before changing your password."
        });
    }

    // No password set: 403 error
    if (!user.password) {
        return res.status(403).json({
            success: false,
            message: "No password set to your account. Use 'Set Password' to add password to your account first."
        });
    }

    // Invalid old password: 400 error
    const oldPassError = passChecks(oldPassword);
    if (oldPassError) {
        return res.status(400).json({
            success: false,
            field: "oldPassword",
            message: oldPassError.message
        });
    }

    // Invalid new password: 400 error
    const newPassError = passChecks(newPassword);
    if (newPassError) {
        return res.status(400).json({
            success: false,
            field: "newPassword",
            message: newPassError.message
        });
    }

    // Mismatched confirm password: 400 error
    const confirmPassError = confirmPassChecks(newPassword, confirmNewPassword);
    if (confirmPassError) {
        return res.status(400).json({
            success: false,
            field: "confirmNewPassword",
            message: confirmPassError.message
        });
    }

    // Cooldown active: 429 error
    if (user.lastPasswordRequest && (now - user.lastPasswordRequest) < cooldownMs) {
        const timeLeftSeconds = Math.ceil((cooldownMs - (now - user.lastPasswordRequest)) / 1000);
        return res.status(429).json({
            success: false,
            message: `Please wait ${timeLeftSeconds}s before trying again.`
        });
    }

    try {
        user.lastPasswordRequest = now;

        const isMatch = await verifyPassword(oldPassword, user.password);
        if (!isMatch) {
            await user.save();
            return res.status(401).json({
                success: false,
                message: "Incorrect old password."
            });
        }

        if (user.lastAccessToken) {
            try {
                const decodedToken = JWT.verify(user.lastAccessToken, process.env.JWT_ACCESS_TOKEN_SECRET);
                if (decodedToken?.exp) {
                    await BlackListedToken.addToBlackList(
                        user.lastAccessToken,
                        user._id,
                        new Date(decodedToken.exp * 1000)
                    );
                    console.log(`🚫 Blacklisted access token for user ${user._id}`);
                }
            } catch (error) {
                console.warn(`⚠️ Failed to verify/blacklist access token for user ${user._id}: ${error.message}`);
            }
        }

        user.password = newPassword;
        user.lastPasswordRequest = undefined;
        await user.invalidateRefreshAndAccessToken();

        await sendPasswordNotificationEmail(user, "change");

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict"
        });

        res.status(200).json({
            success: true,
            message: "Password changed successfully. Please log in again."
        });
    } catch (error) {
        console.error("🚫 Change password error:", error.message);
        await user.save();
        res.status(500).json({
            success: false,
            message: "Failed to change password.",
            error: error.message
        });
    }
};

exports.initiateForgotPassword = async (req, res) => {
    const { email } = req.body;
    const cooldownMs = 2 * 60 * 1000; // 2 minutes
    const now = new Date();

    // Check if user is logged in via refresh token
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        try {
            const selector = refreshToken.slice(0, 8); // Extract selector
            const hashedToken = hashToken(refreshToken); // Hash the token
            const user = await User.findOne({ refreshTokenSelector: selector }).select("+refreshTokenHash +refreshTokenExpiry");

            if (user && !user.isDeleted && user.refreshTokenHash === hashedToken && user.refreshTokenExpiry && new Date() <= user.refreshTokenExpiry) {
                return res.status(403).json({
                    success: false,
                    message: "You are already logged in. Use the change password option in settings or log out to reset your password."
                });
            }
        } catch (error) {
            console.warn("⚠️ Failed to validate refresh token in forgot password:", error.message);
            // Continue with reset flow if token validation fails (treat as logged out)
        }
    }

    // Validate email format: 400 error if invalid
    const emailError = emailChecks(email);
    if (emailError) {
        return res.status(400).json({
            success: false,
            field: "email",
            message: emailError.message
        });
    }

    try {
        // Find user by email, ensure not deleted, and select necessary fields
        const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false }).select("+password +resetPasswordToken +lastAccessToken");

        // No user found: 404 error (generic to avoid enumeration)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email."
            });
        }

        // Unverified email: 403 error
        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before resetting your password."
            });
        }

        // No password set (Google-authenticated account): 403 error
        if (!user.password) {
            return res.status(403).json({
                success: false,
                message: "This account uses Google authentication. Please log in with Google."
            });
        }

        // Cooldown active: 429 error
        if (user.lastResetPasswordRequest && (now - user.lastResetPasswordRequest) < cooldownMs) {
            const timeLeftSeconds = Math.ceil((cooldownMs - (now - user.lastResetPasswordRequest)) / 1000);
            return res.status(429).json({
                success: false,
                message: `Please wait ${timeLeftSeconds}s before trying again.`
            });
        }

        const resetPasswordToken = generateAccessToken({ email: user.email }, "15m");
        user.resetPasswordToken = resetPasswordToken;
        user.lastResetPasswordRequest = now;
        await user.save();

        await sendResetPasswordEmail(user);

        res.status(200).json({
            success: true,
            message: "Please check your email for instructions to reset your password."
        });
    } catch (error) {
        console.error("🚫 Initiate forgot password error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to initiate password reset.",
            error: error.message
        });
    }
};

exports.resetPassword = async (req, res) => {
    const { newPassword, confirmPassword } = req.body;
    const authHeader = req.headers.authorization;

    // Validate required fields: 400 error if missing
    if (!authHeader || !newPassword || !confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "Authorization token, new password, and confirm password are required."
        });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (!token) {
        return res.status(400).json({
            success: false,
            message: "Invalid authorization format. Use Bearer token."
        });
    }

    // Validate new password: 400 error if invalid
    const passError = passChecks(newPassword);
    if (passError) {
        return res.status(400).json({
            success: false,
            field: "newPassword",
            message: passError.message
        });
    }

    // Validate confirm password: 400 error if mismatched
    const confirmPassError = confirmPassChecks(newPassword, confirmPassword);
    if (confirmPassError) {
        return res.status(400).json({
            success: false,
            field: "confirmPassword",
            message: confirmPassError.message
        });
    }

    try {
        // Find user by reset token, ensure not deleted, and select necessary fields
        const user = await User.findOne({ resetPasswordToken: token, isDeleted: false }).select("+resetPasswordToken +password +lastAccessToken");

        // No user found: 400 error
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired token."
            });
        }

        // Unverified email: 403 error
        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before resetting your password."
            });
        }

        // No password set (Google-authenticated account): 403 error
        if (!user.password) {
            return res.status(403).json({
                success: false,
                message: "This account uses Google authentication. Please log in with Google."
            });
        }

        // Check if new password matches old password: 400 error
        const isSamePassword = await verifyPassword(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                field: "newPassword",
                message: "New password cannot be the same as the current password."
            });
        }

        const decoded = JWT.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
        if (decoded.email !== user.email || token !== user.resetPasswordToken) {
            return res.status(400).json({
                success: false,
                message: "Invalid token."
            });
        }

        if (user.lastAccessToken) {
            try {
                const decodedToken = JWT.verify(user.lastAccessToken, process.env.JWT_ACCESS_TOKEN_SECRET);
                if (decodedToken?.exp) {
                    await BlackListedToken.addToBlackList(
                        user.lastAccessToken,
                        user._id,
                        new Date(decodedToken.exp * 1000)
                    );
                    console.log(`🚫 Blacklisted access token for user ${user._id}`);
                }
            } catch (error) {
                console.warn(`⚠️ Failed to verify/blacklist access token for user ${user._id}: ${error.message}`);
            }
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.lastResetPasswordRequest = undefined;
        await user.invalidateRefreshAndAccessToken();

        await sendPasswordNotificationEmail(user, "reset");

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict"
        });

        res.status(200).json({
            success: true,
            message: "Password reset successfully. Please log in with your new password."
        });
    } catch (error) {
        console.error("🚫 Reset password error:", error.message);

        // Handle expired token: 400 error
        if (error.name === "TokenExpiredError") {
            return res.status(400).json({
                success: false,
                message: "The password reset token has expired. Please request a new one."
            });
        }

        // Handle invalid token: 400 error
        if (error.name === "JsonWebTokenError") {
            return res.status(400).json({
                success: false,
                message: "Invalid token."
            });
        }

        // Handle server errors: 500 error
        res.status(500).json({
            success: false,
            message: "Failed to reset password.",
            error: error.message
        });
    }
};

exports.disconnectGoogle = async (req, res) => {
    const user = req.user;

    // Check if user has a google account connected
    if (!user.googleId) {
        return res.status(400).json({
            success: false,
            message: "No Google account connected to disconnect."
        });
    }

    // Check if user has a password set
    if (!user.password) {
        return res.status(400).json({
            success: false,
            message: "Cannot disconnect Google account: No password set for this account. Please set a password first."
        });
    }

    try {
        const tokenToRevoke = user.googleTokens.access_token || user.googleTokens.refresh_token;
        let revocationSuccess = true;

        if (tokenToRevoke) {
            try {
                await oauth2Client.revokeToken(tokenToRevoke);
            } catch (revokeError) {
                console.warn("⚠️  Google token revocation failed:", revokeError.message);
                revocationSuccess = false;
            }
        }

        user.googleId = undefined;
        user.googleTokens = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: revocationSuccess ? "Google account disconnected successfully." : "Local account disconnected, but Google token revocation failed. Please try again or email digimart."
        });
    } catch (error) {
        console.error("🚫 Disconnect Google error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to disconnect Google account.",
            error: error.message
        });
    }
};