const { body, validationResult, param } = require("express-validator");
const { ErrorHandler } = require("../middleware/errorMiddleware");

const validateEditFullName = [
  body("newFullName")
    .notEmpty()
    .withMessage("Full name should not be empty")
    .isString()
    .withMessage("Full name should be string"),
  (req, res, next) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      const errors = result.errors.map((err) => err.msg);
      return next(new ErrorHandler(errors.slice(0, 3), 400));
    }
    next();
  },
];

const validateEditPassword = [
  body("password")
    .notEmpty()
    .withMessage("password should not be empty")
    .isString()
    .withMessage("password should be string"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password should not be empty")
    .isString()
    .withMessage("New Password should be string"),
  (req, res, next) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      const errors = result.errors.map((err) => err.msg);
      return next(new ErrorHandler(errors.slice(0, 3), 400));
    }
    next();
  },
];

const validateEditPhone = [
  body("password")
    .notEmpty()
    .withMessage("password should not be empty")
    .isString()
    .withMessage("password should be string"),
  body("newPhone")
    .notEmpty()
    .withMessage("Mobile number should not be empty")
    .isString()
    .withMessage("Mobile number should be an integer number"),
  (req, res, next) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      const errors = result.errors.map((err) => err.msg);
      return next(new ErrorHandler(errors.slice(0, 3), 400));
    }
    next();
  },
];

module.exports = {
  validateEditFullName,
  validateEditPassword,
  validateEditPhone,
};
