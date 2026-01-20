const express = require("express");
const shop = require("../controllers/shop");
const { authMiddleware, validateUpdateShopInputs, validateShopInputs } = require("../middlewares/authMiddleware");
const router = express.Router();

// static routes
router.post("/create-shop", authMiddleware, validateShopInputs, shop.createShop);
router.get("/", authMiddleware, shop.getAll);
router.get("/my", authMiddleware, shop.getMy);
router.put("/update-shop", authMiddleware, validateUpdateShopInputs, shop.updateShop);

// dynamic routes
router.delete("/:id", authMiddleware, shop.delete);

module.exports = router;