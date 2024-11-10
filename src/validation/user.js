const { body, validationResult, param } = require("express-validator");
const { ErrorHandler } = require("../middleware/errorMiddleware");

const validateCreateWorker = [
  body("fullName")
    .notEmpty()
    .withMessage("Full name should not be empty")
    .isString()
    .withMessage("Full name should be string"),
  body("phone")
    .notEmpty()
    .withMessage("Mobile number should not be empty")
    .isString()
    .withMessage("Mobile number should be string"),
  body("work_type")
    .notEmpty()
    .withMessage("Work type should not be empty")
    .isString()
    .withMessage("Work type should be string"),
  body("personal_id").isString().withMessage("Personal ID should be string"),
  body("password")
    .notEmpty()
    .withMessage("password should not be empty")
    .isString()
    .withMessage("password should be string"),
  (req, res, next) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      const errors = result.errors.map((err) => err.msg);
      return next(new ErrorHandler(errors.slice(0, 3), 400));
    }
    next();
  },
];

const validateEditWorker = [
  body("fullName").isString().optional(),
  body("phone").isString().optional(),
  body("work_type").isString().optional(),
  body("personal_id").isString().optional(),
  body("password").isString().optional(),
  (req, res, next) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      const errors = result.errors.map((err) => err.msg);
      return next(new ErrorHandler(errors.slice(0, 3), 400));
    }
    next();
  },
];

const validateUserIdParam = [
  param("userId")
    .notEmpty()
    .withMessage("User ID parameter is required")
    .isInt({ min: 1 })
    .withMessage("User ID must be a positive integer"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorHandler(errors.errors[0].msg), 400);
    }
    next();
  },
];

module.exports = {
  validateCreateWorker,
  validateEditWorker,
  validateUserIdParam,
};
