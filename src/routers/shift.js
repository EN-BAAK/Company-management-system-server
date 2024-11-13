const express = require("express");
const { isAdmin, isAuthenticated } = require("../middleware/auth");
const multer = require("multer");
const upload = multer();
const {
  createShift,
  editShift,
  deleteShift,
  fetchShifts,
} = require("../controller/shift");
const {
  validateCreateShift,
  validateEditShift,
  validateDeleteShift,
} = require("../validation/shift");

const router = express.Router();

router.get("/", isAuthenticated, fetchShifts);

router.post("/", isAdmin, upload.none(), validateCreateShift, createShift);

router.put("/:shiftId", isAdmin, upload.none(), validateEditShift, editShift);

router.delete("/:shiftId", isAdmin, validateDeleteShift, deleteShift);

module.exports = router;
