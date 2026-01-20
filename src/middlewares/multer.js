const multer = require("multer");
const { maxFileSize, maxFiles, allowedMimeTypes } = require("../config/upload");
const { validateInputsBefParse } = require("./validateFile&Inputs");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxFileSize, files: maxFiles },
    fileFilter: (req, file, cb) => {
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error(JSON.stringify({
                field: "file",
                message: `Invalid file type: ${file.originalname}. Allowed: JPEG, PNG, WEBP, MP4, MPEG.`
            })), false);
        }

        const inputError = validateInputsBefParse(req.body || {}, req.user, req.method);
        if (inputError) {
            return cb(new Error(JSON.stringify(inputError)), false);
        }

        cb(null, true);
    },
});

function uploadErrorHandler(err, req, res, next) {
    const isUpdate = req.method === "PUT";

    const operations = {
        file: isUpdate ? "Couldn't Upload File While Updating! Try Again..." : "Couldn't Upload File! Try Again...",
        general: isUpdate ? "Failed to update product" : "Failed to create product"
    };

    if (err instanceof multer.MulterError) {
        const messages = {
            "LIMIT_FILE_SIZE": `File too large. Max size allowed is ${maxFileSize / (1024 * 1024)} MB.`,
            "LIMIT_FILE_COUNT": "Only 1 file is allowed per product.",
            "LIMIT_UNEXPECTED_FILE": "Unexpected file field. Please upload using the correct field name."
        };

        return res.status(422).json({
            success: false,
            status: operations.file,
            error: { field: "file", message: messages[err.code] || "File upload failed." }
        });
    }

    if (err instanceof Error && err.message.startsWith("{")) {
        const errorObj = JSON.parse(err.message);

        return res.status(errorObj.isAuthError ? 403 : 422).json({
            success: false,
            status: errorObj.isAuthError ? operations.general : operations.file,
            error: { field: errorObj.field, message: errorObj.message }
        });
    };

    next(err);
};

module.exports = { upload, uploadErrorHandler };