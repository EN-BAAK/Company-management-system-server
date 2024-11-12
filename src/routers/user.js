const express = require("express");
const { isAdmin } = require("../middleware/auth");
const {
  createWorker,
  editUser,
  deleteWorker,
  fetchWorkers,
} = require("../controller/user");
const {
  validateCreateWorker,
  validateEditWorker,
  validateUserIdParam,
} = require("../validation/user");
const router = express.Router();

router.get("/", isAdmin, fetchWorkers);

router.post("/", isAdmin, validateCreateWorker, createWorker);

router.put(
  "/:userId",
  isAdmin,
  validateUserIdParam,
  validateEditWorker,
  editUser
);

router.delete("/:userId", isAdmin, validateUserIdParam, deleteWorker);

module.exports = router;
