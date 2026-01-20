module.exports = {
    allowedMimeTypes: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "video/mp4",
        "audio/mpeg",
    ],
    maxFileSize: 10 * 1024 * 1024, // 10 MB per file
    maxFiles: 1, // limit to 1 file for now
};