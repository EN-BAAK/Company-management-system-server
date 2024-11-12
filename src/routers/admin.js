const express = require("express");
const { isAdmin } = require("../middleware/auth");
const {
  editFullName,
  editPhone,
  editPassword,
} = require("../controller/admin");
const {
  validateEditPassword,
  validateEditPhone,
  validateEditFullName,
} = require("../validation/admin");

const router = express.Router();

router.put("/edit/fullName", isAdmin, validateEditFullName, editFullName);
router.put("/edit/password", isAdmin, validateEditPassword, editPassword);
router.put("/edit/phone", isAdmin, validateEditPhone, editPhone);

module.exports = router;
