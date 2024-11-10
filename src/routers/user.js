const express = require("express");
const { isAdmin } = require("../middleware/auth");
const { createWorker, editUser, deleteWorker } = require("../controller/user");
const {
  validateCreateWorker,
  validateEditWorker,
  validateUserIdParam,
} = require("../validation/user");
const router = express.Router();

router.post("/create", isAdmin, validateCreateWorker, createWorker);

router.put(
  "/edit/:userId",
  isAdmin,
  validateUserIdParam,
  validateEditWorker,
  editUser
);

router.delete("/delete/:userId", isAdmin, validateUserIdParam, deleteWorker);

module.exports = router;
