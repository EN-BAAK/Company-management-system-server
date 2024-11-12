const express = require("express");
const { isAdmin } = require("../middleware/auth");
const multer = require("multer");
const upload = multer();
const {
  createCompany,
  editCompany,
  deleteCompany,
  fetchCompanies,
} = require("../controller/company");
const {
  validateCreateCompany,
  validateEditCompany,
  validateIdParam,
} = require("../validation/company");

const router = express.Router();

router.get("/", isAdmin, fetchCompanies);

router.post("/", isAdmin, validateCreateCompany, createCompany);

router.put(
  "/:companyId",
  isAdmin,
  upload.none(),
  validateIdParam,
  validateEditCompany,
  editCompany
);

router.delete("/:companyId", isAdmin, validateIdParam, deleteCompany);

module.exports = router;
