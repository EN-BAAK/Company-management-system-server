const express = require("express");
const { isAuthenticated } = require("../middleware/auth");
const { verifyToken, login, logout } = require("../controller/auth");

const router = express.Router();

router.get("/verify", isAuthenticated, verifyToken);

router.post("/login", login);
router.post("/logout", isAuthenticated, logout);

module.exports = router;
