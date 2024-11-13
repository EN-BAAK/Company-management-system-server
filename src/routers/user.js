const express = require("express");
const { isAdmin } = require("../middleware/auth");
const multer = require("multer");
const upload = multer();
const {
  createWorker,
  editUser,
  deleteWorker,
  fetchWorkers,
  fetchWorkersIdentity,
} = require("../controller/user");
const {
  validateCreateWorker,
  validateEditWorker,
  validateUserIdParam,
} = require("../validation/user");
const router = express.Router();

router.get("/", isAdmin, fetchWorkers);
router.get("/identity", isAdmin, fetchWorkersIdentity);

router.post("/", isAdmin, validateCreateWorker, createWorker);

router.put(
  "/:userId",
  isAdmin,
  upload.none(),
  validateUserIdParam,
  validateEditWorker,
  editUser
);

router.delete("/:userId", isAdmin, validateUserIdParam, deleteWorker);

module.exports = router;
