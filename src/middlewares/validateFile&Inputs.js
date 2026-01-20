const mongoose = require("mongoose");
const { product } = require("../config/validation");
const productFields = ["title", "price", "description", "isActive"];

function validateInputsBefParse(body, user, method = "POST") {
    const isUpdate = method === "PUT";

    if (!user?.isSeller) {
        return { field: "auth", message: `Only sellers can ${isUpdate ? "update" : "create"} products.`, isAuthError: true };
    }

    if (!mongoose.Types.ObjectId.isValid(user._id)) {
        return { field: "user", message: "Valid user authentication required." };
    }

    const { title, price, description, isActive } = body;

    if (isUpdate) {
        if (title !== undefined && (!title.trim() || title.trim().length < product.minTitleLength || title.trim().length > product.maxTitleLength)) {
            return { field: "title", message: `Title must be ${product.minTitleLength}–${product.maxTitleLength} characters if provided.` };
        }

        if (price !== undefined && (isNaN(Number(price)) || Number(price) <= 0)) {
            return { field: "price", message: "Price must be greater than 0 if provided." };
        }

        if (description !== undefined && (!description.trim() || description.trim().length < product.minDescriptionLength || description.trim().length > product.maxDescriptionLength)) {
            return { field: "description", message: `Description must be ${product.minDescriptionLength}–${product.maxDescriptionLength} characters if provided.` };
        }

        if (isActive === undefined) {
            return { field: "isActive", message: "isActive check is required." };
        }

        if (title !== undefined) body.title = title.trim();
        if (price !== undefined) body.price = Number(price);
        if (description !== undefined) body.description = description.trim();
        if (isActive !== undefined) body.isActive = isActive;
    } else {
        if (!title?.trim() || title.trim().length < product.minTitleLength || title.trim().length > product.maxTitleLength) {
            return { field: "title", message: `Title is required (${product.minTitleLength}–${product.maxTitleLength} characters).` };
        }

        if (isNaN(Number(price)) || Number(price) <= 0) {
            return { field: "price", message: "Price is required and must be > 0." };
        }

        if (!description?.trim() || description.trim().length < product.minDescriptionLength || description.trim().length > product.maxDescriptionLength) {
            return { field: "description", message: `Description is required (${product.minDescriptionLength}–${product.maxDescriptionLength} characters).` };
        }

        if (isActive === undefined) {
            return { field: "isActive", message: "isActive check is required." };
        }

        body.title = title.trim();
        body.price = Number(price);
        body.description = description.trim();
        if (isActive !== undefined) body.isActive = isActive;
    };

    body.sellerId = user._id;
    body.isAlreadyDone = true;
    return null;
};

function validateInputsAftParse(req, res, next) {
    if (!req.body?.isAlreadyDone) {
        req.body = req.body || {};
        const isUpdate = req.method === "PUT";
        const inputError = validateInputsBefParse(req.body, req.user, req.method);
        if (inputError) {
            return res.status(inputError.isAuthError ? 403 : 422).json({
                success: false,
                status: isUpdate ? "Failed to update product" : "Failed to create product",
                error: { field: inputError.field, message: inputError.message },
            });
        }

        if (isUpdate) {
            const hasField = productFields.some(f => req.body[f] !== undefined);
            if (!hasField && !req.file) {
                return res.status(422).json({
                    success: false,
                    status: "Failed to update product",
                    error: { field: "general", message: "Provide at least one field or file to update." }
                });
            }
        } else if (!req.file) {
            return res.status(422).json({
                success: false,
                status: "Failed to create product",
                error: { field: "file", message: "At least one file is required." }
            });
        }
    };

    next();
};

module.exports = { validateInputsBefParse, validateInputsAftParse };