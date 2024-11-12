const { body, validationResult, param } = require("express-validator");
const { ErrorHandler } = require("../middleware/errorMiddleware");

const validateCreateCompany = [
  body("name")
    .notEmpty()
    .withMessage("Company name should not be empty")
    .isString()
    .withMessage("Company name should be a string"),
  body("phone")
    .notEmpty()
    .withMessage("Phone number should not be empty")
    .isInt()
    .withMessage("Phone number should be an integer number"),
  (req, res, next) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      const errors = result.errors.map((err) => err.msg);
      return next(new ErrorHandler(errors.slice(0, 3), 400));
    }
    next();
  },
];

const validateEditCompany = [
  body("name").isString().optional(),
  body("phone").isInt().optional(),
  (req, res, next) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      const errors = result.errors.map((err) => err.msg);
      return next(new ErrorHandler(errors.slice(0, 3), 400));
    }
    next();
  },
];

const validateIdParam = [
  param("companyId")
    .notEmpty()
    .withMessage("Company ID parameter is required")
    .isInt({ min: 1 })
    .withMessage("Company ID must be a positive integer"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorHandler(errors.errors[0].msg), 400);
    }
    next();
  },
];

module.exports = {
  validateCreateCompany,
  validateEditCompany,
  validateIdParam,
};
