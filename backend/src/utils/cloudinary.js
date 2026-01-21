const path = require('path');
const cloudinary = require("../config/cloudinary");
const { watermarkProduct } = require('./watermark');
const { uploadFile } = require('../services/cloudinary');

exports.setAvatar = function (doc) {
    if (!doc) return "https://avatar.iran.liara.run/public";
    if (doc?.username) return `https://avatar.iran.liara.run/username?username=${encodeURIComponent(doc.username)}`;
    if (doc?.name) return `https://robohash.org/${encodeURIComponent(doc.name)}.png?size=200x200`;
    if (doc?.email) return `https://robohash.org/${encodeURIComponent(doc.email.split("@")[0])}.png?size=200x200`;
    return "https://avatar.iran.liara.run/public";
};

/**
 * Generates a signed ZIP download URL for multiple private assets
 * @param {string[]} publicIds - Array of public IDs to include in the ZIP
 * @param {number} expirySeconds - URL expiration time (min 1 minute)
 * @returns {string} - Signed ZIP download URL
 */
exports.generateZipDownloadUrl = (publicIds, expirySeconds = 60) => {
    try {
        if (!publicIds || publicIds.length === 0) {
            throw new Error("No public IDs provided for ZIP generation");
        }

        // Generate a time-limited signed ZIP URL
        // download_zip_url is more efficient as it doesn't store the file in Cloudinary
        const url = cloudinary.utils.download_zip_url({
            public_ids: publicIds,
            resource_type: 'raw', // Allows zipping images, videos, and raw files together
            type: 'private', // Must match the original asset's delivery type
            expires_at: Math.floor(Date.now() / 1000) + expirySeconds,
            flatten_folders: true, // Optional: keeps the ZIP root clean
            target_format: 'zip'
        });

        return url;
    } catch (error) {
        console.error("Error generating ZIP URL:", error.message);
        throw new Error("Failed to generate ZIP download URL");
    }
};

exports.generateSignedUrl = (publicId, fileUrl, expirySeconds = 60) => {
    try {
        if (!publicId) throw new Error("Missing public_id");

        const extname = path.extname(fileUrl);
        const fileFormat = extname.substring(1);
        console.log("fileFormat:>", fileFormat);

        const timestamp = Math.floor(Date.now() / 1000); // Current time in seconds
        const expires_at = timestamp + expirySeconds;

        // Generate time-limited signed URL for private assets
        const url = cloudinary.utils.private_download_url(publicId, fileFormat, {
            type: "private",
            expires_at: expires_at,
            attachment: true // Triggers download
        });

        return url;
    } catch (error) {
        console.error("Error generating signed URL:", error.message);
        throw new Error("Failed to generate signed URL");
    }
};

/**
 * Returns the correct PREVIEW URL for a product
 * - Seller sees clean version
 * - Everyone else sees watermarked version (generated once)
 */
exports.getProductPreviewUrl = async (product, viewer) => {
    const isOwner = viewer && String(product.shopId?.sellerId?._id) === String(viewer._id);
    if (isOwner) return product.fileUrl;

    if (product.watermarkedFileUrl) return product.watermarkedFileUrl;

    try {
        const res = await fetch(product.fileUrl);
        if (!res.ok) throw new Error("Failed to fetch file");

        const buffer = Buffer.from(await res.arrayBuffer());
        const watermarkedBuffer = await watermarkProduct(buffer, product.mimeType || "image/jpeg");

        const uploaded = await uploadFile(watermarkedBuffer, {
            folder: "digimart/products/previews",
            resource_type: "auto",
            type: "private",
            public_id: `preview_${product._id}_${Date.now()}`,
        });

        product.watermarkedFileUrl = uploaded.secure_url;
        product.watermarkedPublicId = uploaded.public_id;
        await product.save({ validateBeforeSave: false });

        return uploaded.secure_url;
    } catch (error) {
        console.error("Watermark generation failed:", error.message);
        return product.fileUrl; // fallback
    }
};

exports.isGoogleusercontent = function (url) {
    return url && url.includes("googleusercontent.com/");
};

exports.isCloudinaryUrl = function (url) {
    return url && url.includes(`cloudinary.com/`);
};