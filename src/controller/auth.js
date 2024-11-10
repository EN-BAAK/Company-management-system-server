const { catchAsyncErrors } = require("../middleware/catchAsyncErrors");
const { ErrorHandler } = require("../middleware/errorMiddleware");
const { comparePassword, generateToken } = require("../misc/helpers");
const { User } = require("../models");

const login = catchAsyncErrors(async (req, res, next) => {
  const { phone, password } = req.body;

  const user = await User.findOne({
    where: { phone },
  });

  if (!user) return next(new ErrorHandler("Wrong phone or password", 400));

  const correctPassword = await comparePassword(password, user.password);

  if (!correctPassword)
    return next(new ErrorHandler("Wrong phone or password", 400));

  generateToken(user, "User login successfully", 200, res, next);
});

const verifyToken = catchAsyncErrors(async (req, res) => {
  res.status(200).send({
    success: true,
    userId: req.userId,
  });
});

const logout = catchAsyncErrors(async (req, res, next) => {
  const token = req.cookies["adminToken"] ? "adminToken" : "workerToken";

  res
    .status(200)
    .cookie(token, "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "User logged out successfully",
    });
});

module.exports = {
  login,
  verifyToken,
  logout,
};
