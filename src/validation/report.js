const { body, param, validationResult, query } = require("express-validator");
const { ErrorHandler } = require("../middleware/errorMiddleware");

const validateWorkerNameReport = [
  query("workerName")
    .noEmpty()
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

module.exports = {
  validateWorkerNameReport,
};
