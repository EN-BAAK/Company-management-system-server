const express = require("express");
const { isAdmin, isAuthenticated } = require("../middleware/auth");
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

router.post("/", isAdmin, validateCreateShift, createShift);

router.put("/:shiftId", isAdmin, validateEditShift, editShift);

router.delete("/:shiftId", isAdmin, validateDeleteShift, deleteShift);

module.exports = router;
