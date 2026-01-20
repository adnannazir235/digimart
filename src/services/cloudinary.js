const { default: fetch } = require("node-fetch");
const cloudinary = require("../config/cloudinary");

const uploadFile = (buffer, options) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        });

        uploadStream.end(buffer);
    });
};

const uploadAvatar = async (imageUrl, userName) => {
    try {
        const response = await fetch(imageUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.startsWith("image/")) {
            throw new Error("URL does not point to a valid image");
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const result = await uploadFile(buffer, {
            folder: "digimart/avatars",
            resource_type: "image",
            public_id: `${userName}_${Date.now()}`, // ✅ userName_timestamp
            transformation: { width: 200, height: 200, crop: "thumb", gravity: "face" }
        });

        return result.secure_url;
    } catch (error) {
        console.error("Cloudinary upload failed:", error.message);
        return null;
    }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary file's public_id to delete
 */
async function deleteCloudinaryFile(publicId) {
    console.log("publicId in deleteCloudinaryFile:>", publicId);
    try {
        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result === "ok") {
            console.log(`✅ Cloudinary file deleted successfully: ${publicId}`);
        } else {
            console.warn(`⚠️ Cloudinary cleanup may have failed for ${publicId}`, result);
        }
    } catch (error) {
        console.error("❌ Cloudinary delete failed:", error.message);
    }
};

module.exports = { uploadFile, uploadAvatar, deleteCloudinaryFile };