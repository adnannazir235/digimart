const express = require("express");
const router = express.Router();

// Importing Routes
const authRoutes = require("./auth");
const usersRoutes = require("./user");
const shopsRoutes = require("./shop");
const productsRoutes = require("./product");
const stripeRoutes = require("./stripe");
const checkoutRoutes = require("./checkout");
const orderRoutes = require("./order");

// Defining Routes
router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/shops", shopsRoutes);
router.use("/products", productsRoutes);
router.use("/stripe", stripeRoutes);
router.use("/checkout", checkoutRoutes);
router.use("/order", orderRoutes);

module.exports = router;