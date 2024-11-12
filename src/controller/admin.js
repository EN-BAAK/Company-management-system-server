const { catchAsyncErrors } = require("../middleware/catchAsyncErrors");
const { ErrorHandler } = require("../middleware/errorMiddleware");
const { User } = require("../models");
const { comparePassword } = require("../misc/helpers");
const bcrypt = require("bcryptjs");

const editPassword = catchAsyncErrors(async (req, res, next) => {
  const { password, newPassword } = req.body;

  const admin = await User.findOne({ where: { role: "admin" } });

  if (!admin) return next(new ErrorHandler("Admin not found", 404));

  const correctPassword = await comparePassword(password, admin.password);

  if (!correctPassword)
    return next(new ErrorHandler("Internal server error", 500));

  const hashedPassword = await bcrypt.hash(
    newPassword,
    parseInt(process.env.SALT)
  );

  admin.password = hashedPassword;

  await admin.save();

  res.status(200).json({
    success: true,
    message: "admin updated successfully",
  });
});

const editPhone = catchAsyncErrors(async (req, res, next) => {
  const { password, newPhone } = req.body;

  const admin = await User.findOne({ where: { role: "admin" } });

  if (!admin) return next(new ErrorHandler("Admin not found", 404));

  const correctPassword = await comparePassword(password, admin.password);

  if (!correctPassword)
    return next(new ErrorHandler("Incorrect password", 401));

  admin.phone = newPhone;
  await admin.save();

  res.status(200).json({
    success: true,
    message: "Admin phone updated successfully",
  });
});

const editFullName = catchAsyncErrors(async (req, res, next) => {
  const { newFullName } = req.body;

  const admin = await User.findOne({ where: { role: "admin" } });

  if (!admin) return next(new ErrorHandler("Admin not found", 404));

  admin.fullName = newFullName;
  await admin.save();

  res.status(200).json({
    success: true,
    message: "Admin full name updated successfully",
    fullName: admin.fullName,
  });
});

module.exports = {
  editFullName,
  editPassword,
  editPhone,
};
