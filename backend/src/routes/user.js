const express = require("express");
const user = require("../controllers/user");
const { authMiddleware, validateUpdateProfileInputs } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/me", authMiddleware, user.getProfile);
router.put("/me", authMiddleware, validateUpdateProfileInputs, user.updateProfile);
router.patch("/country", authMiddleware, user.addCountry);

module.exports = router;