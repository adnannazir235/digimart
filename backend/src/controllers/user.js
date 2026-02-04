const User = require("../models/User");
const { countryChecks } = require("../utils/validation");
const { sanitizeUser } = require("../utils/filtering");

exports.getProfile = async (req, res) => {
    try {
        const user = req.user;

        res.status(200).json({
            success: true,
            message: "User profile retrieved successfully!",
            data: { user: sanitizeUser(user) }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error retrieving user profile! Try again later."
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const user = req.user;
        const updates = req.validatedData;

        // Apply updates
        Object.assign(user, updates);
        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully!",
            data: { user: sanitizeUser(user) }
        });

    } catch (err) {
        console.error("Error updating profile:", err);

        // Handle MongoDB duplicate key error (fallback)
        if (err.code === 11000 && err.keyPattern?.username) {
            return res.status(409).json({
                success: false,
                field: "username",
                message: "Username is already taken."
            });
        }

        res.status(500).json({
            success: false,
            message: "Server error while updating profile.",
            error: err.message || err,
        });
    }
};

exports.addCountry = async (req, res) => {
    try {
        const { country } = req.body;

        // 1. Check if user already has a country (one-time rule)
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.country) {
            return res.status(403).json({
                success: false,
                message: "Country has already been set."
            });
        }

        // 2. Allowed countries check (using your existing helper)
        const countryReturned = countryChecks(country);
        if (countryReturned) {
            return res.status(400).json({
                success: false,
                field: "country",
                message: countryReturned.message
            });
        }

        // 3. Add country (and optional currency)
        user.country = country.trim(); // Store cleaned value
        await user.save();

        // Return success response
        res.status(200).json({
            success: true,
            message: "Country added successfully"
        });

    } catch (err) {
        console.error("Country addition error:", err);
        res.status(500).json({
            success: false,
            message: "Server error while adding country.",
            error: err.message || err
        });
    }
};