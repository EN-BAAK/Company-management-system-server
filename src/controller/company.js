const { catchAsyncErrors } = require("../middleware/catchAsyncErrors");
const { ErrorHandler } = require("../middleware/errorMiddleware");
const { Company } = require("../models");

const createCompany = catchAsyncErrors(async (req, res, next) => {
  const { name, phone } = req.body;

  const company = await Company.findOne({
    where: { phone },
  });

  if (company) return next(new ErrorHandler("The company already exists", 400));

  await Company.create({
    name,
    phone,
  });

  res
    .status(200)
    .json({ success: true, message: "Company added successfully" });
});

const editCompany = catchAsyncErrors(async (req, res, next) => {
  const { name, phone } = req.body;
  const companyId = req.params.companyId;

  const company = await Company.findByPk(companyId);

  if (!company) {
    return next(new ErrorHandler("Company not found", 404));
  }

  if (name) company.name = name;

  if (phone) company.phone = phone;

  await company.save();

  res
    .status(200)
    .json({ success: true, message: "Company updated successfully" });
});

const deleteCompany = catchAsyncErrors(async (req, res, next) => {
  const companyId = req.params.companyId;

  const company = await Company.findByPk(companyId);

  if (!company) {
    return next(new ErrorHandler("Company not found", 404));
  }

  await company.destroy();

  res
    .status(200)
    .json({
      success: true,
      message: "Company deleted successfully",
      id: company.id,
    });
});

const fetchCompanies = catchAsyncErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const offset = parseInt(req.query.offset) || 20;

  const companies = await Company.findAll({
    limit: offset,
    offset: (page - 1) * offset,
  });

  res.status(200).json({ success: true, companies });
});

module.exports = {
  createCompany,
  editCompany,
  deleteCompany,
  fetchCompanies,
};
