const express = require("express");
const router = express.Router();
const checkout = require("../controllers/checkout");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, checkout.createCheckoutSession);

module.exports = router;