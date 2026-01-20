const sharp = require("sharp");
const { allowedMimeTypes } = require("../config/upload");

/**
 * Adds a watermark to supported product files
 * @param {Buffer} fileBuffer - Original file buffer from multer
 * @param {string} mimeType    - File's MIME type (e.g. "image/jpeg")
 * @returns {Promise<Buffer>}  - Watermarked buffer (or original if unsupported)
 * @throws {Error} if file type is not allowed
 */
async function watermarkProduct(fileBuffer, mimeType) {
    // Validate MIME type first
    if (!allowedMimeTypes.includes(mimeType)) {
        throw new Error(`File type ${mimeType} is not allowed for products`);
    }

    // Audio → no visual watermark possible → return original
    if (mimeType === "audio/mpeg") {
        return fileBuffer;
    }

    // Images → full watermark
    if (mimeType.startsWith("image/")) {
        return await addWatermarkToImage(fileBuffer);
    }

    // Videos → watermark on preview frame (protects screenshots/previews)
    if (mimeType === "video/mp4") {
        return await addWatermarkToVideo(fileBuffer);
    }

    // Fallback (should never hit)
    return fileBuffer;
}

async function addWatermarkToImage(buffer) {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    const svgWidth = metadata.width || 800;
    const svgHeight = metadata.height || 800;

    const watermarkSvg = Buffer.from(`
        <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
            <style>
                .watermark {
                    fill: rgba(255, 255, 255, 0.5);
                    font-size: ${Math.round(svgWidth / 8)}px;
                    font-weight: bold;
                    font-family: Arial, sans-serif;
                }
                .shadow {
                    fill: rgba(0, 0, 0, 0.4);
                    font-size: ${Math.round(svgWidth / 7.8)}px;
                }
            </style>
            <text x="${svgWidth / 2}" y="${svgHeight / 2 - 20}" class="shadow" text-anchor="middle" transform="rotate(-35 ${svgWidth / 2} ${svgHeight / 2})">DigiMart</text>
            <text x="${svgWidth / 2}" y="${svgHeight / 2}" class="watermark" text-anchor="middle" transform="rotate(-35 ${svgWidth / 2} ${svgHeight / 2})">DigiMart</text>
        </svg>
    `);

    return await image
        .composite([
            {
                input: watermarkSvg,
                gravity: "center",
                blend: "over"
            }
        ])
        .withMetadata()
        .toBuffer();
}

async function addWatermarkToVideo(buffer) {
    // Sharp can read the first frame of MP4 → treat as image
    return await addWatermarkToImage(buffer);
}

module.exports = { watermarkProduct };