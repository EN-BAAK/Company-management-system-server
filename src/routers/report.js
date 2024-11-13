const express = require("express");
const { isAuthenticated } = require("../middleware/auth");
const { buildReport } = require("../controller/report");

const router = express.Router();

router.get("/", isAuthenticated, buildReport);

module.exports = router;
