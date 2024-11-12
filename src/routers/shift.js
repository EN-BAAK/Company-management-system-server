const express = require("express");
const { isAdmin } = require("../middleware/auth");
const { createShift, editShift, deleteShift } = require("../controller/shift");
const {
  validateCreateShift,
  validateEditShift,
  validateDeleteShift,
} = require("../validation/shift");

const router = express.Router();

router.post("/create", isAdmin, validateCreateShift, createShift);

router.put("/edit/:shiftId", isAdmin, validateEditShift, editShift);

router.delete("/delete/:shiftId", isAdmin, validateDeleteShift, deleteShift);

module.exports = router;
