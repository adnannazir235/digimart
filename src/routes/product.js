const express = require("express");
const { authMiddleware, optionalAuth } = require("../middlewares/authMiddleware");
const { upload } = require("../middlewares/multer");
const product = require("../controllers/product");
const { validateInputsAftParse } = require("../middlewares/validateFile&Inputs");
const router = express.Router();

// static routes
router.post("/", authMiddleware, upload.single("file"), validateInputsAftParse, product.create);
router.get("/", optionalAuth, product.getAll);
router.get("/my", authMiddleware, product.getMy);

// dynamic routes
router.get("/:id", optionalAuth, product.getSingle);
router.put("/:id", authMiddleware, upload.single("file"), validateInputsAftParse, product.update);
router.delete("/:id", authMiddleware, product.delete);

module.exports = router;