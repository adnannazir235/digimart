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