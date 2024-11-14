const { body, param, validationResult } = require("express-validator");
const { ErrorHandler } = require("../middleware/errorMiddleware");

const validateCreateShift = [
  body("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Date must be a valid date"),
  body("companyId")
    .notEmpty()
    .withMessage("Company ID is required")
    .isInt()
    .withMessage("Company ID must be an integer"),
  body("workerId")
    .optional({ nullable: true })
    .isInt()
    .withMessage("Worker ID must be an integer if provided"),
  body("work_type")
    .optional({ nullable: true })
    .isString()
    .withMessage("Work type must be a string if provided"),
  body("startHour")
    .optional({ nullable: true })
    .matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
    .withMessage(
      "Start hour must be a valid time in HH:MM or HH:MM:SS format if provided"
    ),
  body("endHour")
    .optional({ nullable: true })
    .matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
    .withMessage(
      "End hour must be a valid time in HH:MM or HH:MM:SS format if provided"
    ),

  (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const errors = result.errors.map((err) => err.msg);
      return next(new ErrorHandler(errors.slice(0, 3), 400));
    }
    next();
  },
];

const validateEditShift = [
  param("shiftId")
    .notEmpty()
    .withMessage("Shift ID is required")
    .isInt()
    .withMessage("Shift ID must be an integer"),
  body("date").optional().isISO8601().withMessage("Date must be a valid date"),
  body("companyId")
    .optional()
    .isInt()
    .withMessage("Company ID must be an integer"),
  body("workerId")
    .optional({ nullable: true })
    .isInt()
    .withMessage("Worker ID must be an integer if provided"),
  body("workType")
    .optional({ nullable: true })
    .isString()
    .withMessage("Work type must be a string if provided"),
  body("startHour")
    .optional({ nullable: true })
    .matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
    .withMessage(
      "Start hour must be a valid time in HH:MM or HH:MM:SS format if provided"
    ),
  body("endHour")
    .optional({ nullable: true })
    .matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
    .withMessage(
      "End hour must be a valid time in HH:MM or HH:MM:SS format if provided"
    ),

  (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const errors = result.errors.map((err) => err.msg);
      return next(new ErrorHandler(errors.slice(0, 3), 400));
    }
    next();
  },
];

const validateDeleteShift = [
  param("shiftId")
    .notEmpty()
    .withMessage("Shift ID is required")
    .isInt()
    .withMessage("Shift ID must be an integer"),
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
  validateCreateShift,
  validateEditShift,
  validateDeleteShift,
};
