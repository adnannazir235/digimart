const express = require("express");
const order = require("../controllers/order");
const { authMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();

// static routes
router.get("/my", authMiddleware, order.getMyOrders);
router.get("/sales", authMiddleware, order.getMySales);

// dynamic routes
router.get("/:id", authMiddleware, order.getSingleOrder);
router.get("/:id/download", authMiddleware, order.downloadOrderProducts);

module.exports = router;