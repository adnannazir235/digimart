const mongoose = require("mongoose");
const Shop = require("../models/Shop");
const Product = require("../models/Product");
const { sanitizeProduct } = require("../utils/filtering");
const { uploadFile, deleteCloudinaryFile } = require("../services/cloudinary");
const { getUsdEquivalent, getRawRate } = require("../services/exchangeRateApi");
const { getProductPreviewUrl } = require("../utils/cloudinary");

exports.create = async (req, res) => {
    let uploadedFile = null;

    try {
        // 🔒 Verify seller has Stripe connected
        const shop = await Shop.findOne({ sellerId: req.user._id });
        if (!shop || !shop.isStripeConnected) {
            return res.status(403).json({
                success: false,
                message: "You must connect your Stripe account before listing products."
            });
        }

        // Validate minimum USD equivalent
        let usdAmount, rate;
        try {
            usdAmount = await getUsdEquivalent("USD", req.body.price);
            rate = await getRawRate("USD");
        } catch (error) {
            return res.status(503).json({
                error: "Failed to validate price due to exchange rate service unavailability. Please try again later."
            });
        }

        const amountInCents = Math.round(req.body.price * 100);
        const platformFee = Math.round(amountInCents * (process.env.PLATFORM_FEE_PERCENT / 100));
        const netUsdAmount = await getUsdEquivalent("USD", (amountInCents - platformFee) / 100);

        if (usdAmount < 0.5 || netUsdAmount < 0.5) {
            const localMin = rate ? Math.ceil(0.5 * rate * 100) / 100 : "equivalent to $0.50 USD";
            return res.status(400).json({
                error: `Product price must be at least ${localMin} USD to meet the minimum $0.50 USD equivalent (after platform fee).`
            });
        }

        // 1. Upload new file
        uploadedFile = await uploadFile(req.file.buffer, {
            folder: "digimart/products",
            type: "private",
            resource_type: "auto",
            public_id: `product_${Date.now()}`
        });

        // 2. Create product with uploaded file details
        const createdProduct = await Product.create({
            ...req.body,
            sellerId: req.user._id,
            shopId: shop._id,
            fileUrl: uploadedFile.secure_url,
            cloudinaryPublicId: uploadedFile.public_id,
            cloudinarySecureUrl: uploadedFile.secure_url,
            mimeType: req.file.mimetype
        });

        // 3. Confirm product is created
        if (!createdProduct) {
            throw new Error("Failed to save product in DB");
        }

        // 4. No old file to delete in create
        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: sanitizeProduct(createdProduct)
        });
    } catch (error) {
        // Cleanup only the newly uploaded file if DB save failed
        if (uploadedFile?.public_id) {
            await deleteCloudinaryFile(uploadedFile.public_id).catch(() => { });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create product",
            error: error.message
        });
    }
};

exports.getAll = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;

    try {
        // Calculate the number of documents to skip
        const skipIndex = (page - 1) * limit;

        const products = await Product.find({ isActive: true, isDeleted: false })
            .populate({
                path: 'shopId',
                select: 'sellerId',
                populate: { path: 'sellerId', select: '_id' }
            })
            .sort({ createdAt: -1 })
            .skip(skipIndex)
            .limit(limit);

        const user = req.user || null;

        const productsWithPreview = await Promise.all(
            products.map(async (p) => {
                const sanitized = sanitizeProduct(p);

                // If user is logged in and is the actual seller of THIS product → clean
                // Otherwise → watermarked (even if user is a seller of other products)
                const isOwnerOfThisProduct = user && String(p.shopId?.sellerId?._id) === String(user?._id);
                sanitized.fileUrl = isOwnerOfThisProduct ? p.fileUrl : await getProductPreviewUrl(p, user);
                sanitized.isSeller = isOwnerOfThisProduct;

                delete sanitized.shopId;
                return sanitized;
            })
        );

        // Get the total count of documents for metadata (e.g., total pages)
        const count = await Product.countDocuments({});

        res.status(200).json({
            success: true,
            data: productsWithPreview,
            totalPages: Math.ceil(count / limit),
            totolProducts: count,
            currentPage: page,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch products",
            error: error.message
        });
    }
};

exports.getMy = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find the shop by sellerId (userId)
        const shop = await Shop.findOne({ sellerId: userId, isActive: true, isDeleted: false });
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: "Shop not found."
            });
        }

        // Get products for this shop
        const products = await Product.find({ shopId: shop._id, isDeleted: false })
            .populate({
                path: 'shopId',
                populate: { path: 'sellerId', select: 'name username' }
            })
            // .select("-cloudinaryPublicId")
            .sort({ createdAt: -1 });

        const productsClean = products.map(p => {
            const sanitized = sanitizeProduct(p);
            sanitized.fileUrl = p.fileUrl;
            return sanitized;
        });

        res.status(200).json({
            success: true,
            data: productsClean,
            count: productsClean.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch your products",
            error: error.message
        });
    }
};

exports.getSingle = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(id)
            .populate({
                path: 'shopId',
                populate: { path: 'sellerId', select: 'name username email avatar' }
            })
        // .select("-cloudinaryPublicId");

        if (!product || product.isDeleted || !product.isActive) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const sanitized = sanitizeProduct(product);
        sanitized.fileUrl = await getProductPreviewUrl(product, null);
        sanitized.isSeller = req.user && String(product.shopId?.sellerId?._id) === String(req.user._id);

        res.status(200).json({
            success: true,
            data: sanitized
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch product",
            error: error.message
        });
    }
};

exports.update = async (req, res) => {
    let uploadedFile = null;

    try {
        const { id } = req.params;
        const allowedUpdateFields = ["title", "description", "price", "isActive"];

        // 1. Validate product ID
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const product = await Product.findById(id).select("+cloudinaryPublicId");
        if (!product || product.isDeleted) {
            return res.status(404).json({
                success: false, message: "Product not found"
            });
        }

        const shop = await Shop.findOne({
            _id: product.shopId,
            isActive: true,
            isDeleted: false
        });

        if (!shop) {
            return res.status(404).json({
                success: false,
                message: "Shop not found."
            });
        }

        if (shop.sellerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "You're not authorized to update this product" });
        }

        const newPrice = req.body.price === undefined || null ? undefined : req.body.price === product.price ? undefined : req.body.price;
        let usdAmount, rate;
        try {
            usdAmount = await getUsdEquivalent("USD", newPrice);
            rate = await getRawRate("USD");
        } catch (error) {
            return res.status(503).json({
                error: "Failed to validate price due to exchange rate service unavailability. Please try again later."
            });
        }

        const amountInCents = Math.round(newPrice * 100);
        const platformFee = Math.round(amountInCents * (process.env.PLATFORM_FEE_PERCENT / 100));
        const netUsdAmount = await getUsdEquivalent("USD", (amountInCents - platformFee) / 100);

        if (usdAmount < 0.5 || netUsdAmount < 0.5) {
            const localMin = rate ? Math.ceil(0.5 * rate * 100) / 100 : "equivalent to $0.50 USD";
            return res.status(400).json({
                error: `Product price must be at least ${localMin} USD to meet the minimum $0.50 USD equivalent (after platform fee).`
            });
        }

        // 2. Prepare update fields
        const updateFields = {};
        allowedUpdateFields.forEach(field => {
            if (req.body[field] !== undefined) updateFields[field] = req.body[field];
        });

        // 3. Upload new file if provided
        if (req.file) {
            uploadedFile = await uploadFile(req.file.buffer, {
                folder: "digimart/products",
                resource_type: "auto",
                type: "private",
                public_id: `product_${Date.now()}`
            });

            updateFields.fileUrl = uploadedFile.secure_url;
            updateFields.cloudinaryPublicId = uploadedFile.public_id;
            updateFields.cloudinarySecureUrl = uploadedFile.secure_url;

            if (product.watermarkedFileUrl) {
                updateFields.watermarkedFileUrl = null;
                updateFields.watermarkedPublicId = null;
            }
        }

        // 4. Update DB
        const updatedProduct = await Product.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });
        if (!updatedProduct) {
            throw new Error("Failed to update product in DB");
        }

        // 5. Delete old file only after DB update success
        if (uploadedFile && product.cloudinaryPublicId) {
            await deleteCloudinaryFile(product.cloudinaryPublicId).catch(() => { });
        }

        const sanitized = sanitizeProduct(updatedProduct);
        sanitized.fileUrl = await getProductPreviewUrl(updatedProduct, req.user);

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: sanitized
        });
    } catch (error) {
        console.error(error);

        // Cleanup only new upload if DB update failed
        if (uploadedFile?.public_id) {
            await deleteCloudinaryFile(uploadedFile.public_id).catch(() => { });
        }

        if (error.name === "ValidationError") {
            return res.status(422).json({
                success: false,
                message: "Validation error",
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        res.status(500).json({
            success: false,
            message: "Error updating the product",
            error: error.message
        });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                status: "Error deleting the Product! Try Again...",
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(id).select("+cloudinaryPublicId");
        if (!product || product.isDeleted) {
            return res.status(404).json({
                success: false,
                status: "Error deleting the Product! Try Again...",
                message: "Product not found"
            });
        }

        if (product.sellerId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You're not authorized to delete this Product"
            });
        }

        product.isDeleted = true;
        product.deletedAt = new Date();
        await product.save();

        // if (product.cloudinaryPublicId) await deleteCloudinaryFile(product.cloudinaryPublicId); // Commented to prevent file deletion from cloudinary

        res.status(204).send();
    } catch (error) {
        res.status(500).json({
            success: false,
            status: "Error deleting the Product! Try Again...",
            error: error
        });
    }
};