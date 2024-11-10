const express = require("express");
const { isAdmin } = require("../middleware/auth");
const {
  createCompany,
  editCompany,
  deleteCompany,
} = require("../controller/company");
const {
  validateCreateCompany,
  validateEditCompany,
  validateIdParam,
} = require("../validation/company");

const router = express.Router();

router.post("/create", isAdmin, validateCreateCompany, createCompany);

router.put(
  "/edit/:companyId",
  isAdmin,
  validateIdParam,
  validateEditCompany,
  editCompany
);

router.delete("/delete/:companyId", isAdmin, validateIdParam, deleteCompany);

module.exports = router;
