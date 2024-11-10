const { catchAsyncErrors } = require("./catchAsyncErrors");
const { ErrorHandler } = require("./errorMiddleware");
const jwt = require("jsonwebtoken");

const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const token = req.cookies["adminToken"] || req.cookies["workerToken"];

  if (!token) return next(new ErrorHandler("User not authenticated", 400));

  const decode = await jwt.verify(token, process.env.JWT_SECRET_KEY);

  req.userId = decode.id;

  next();
});

const isAdmin = catchAsyncErrors(async (req, res, next) => {
  const token = req.cookies["adminToken"];

  if (!token) return next(new ErrorHandler("Admin not authenticated", 400));

  const decode = await jwt.verify(token, process.env.JWT_SECRET_KEY);

  req.userId = decode.id;

  next();
});

module.exports = {
  isAuthenticated,
  isAdmin,
};
