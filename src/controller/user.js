const { Op } = require("sequelize");
const { catchAsyncErrors } = require("../middleware/catchAsyncErrors");
const { ErrorHandler } = require("../middleware/errorMiddleware");
const { User } = require("../models");
const bcrypt = require("bcryptjs");

const createWorker = catchAsyncErrors(async (req, res, next) => {
  const { fullName, personal_id, phone, password, notes } = req.body;

  const user = await User.findOne({
    where: { phone },
  });

  if (user) return next(new ErrorHandler("The user already exists", 400));

  const newUser = await User.create({
    fullName,
    phone,
    role: "worker",
    personal_id: personal_id ? personal_id : null,
    password,
    notes,
  });

  res.status(200).json({
    succuss: true,
    message: "Worker added successfully",
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      phone: newUser.phone,
      personal_id: newUser.personal_id,
      notes: newUser.notes,
    },
  });
});

const editUser = catchAsyncErrors(async (req, res, next) => {
  const { fullName, personal_id, phone, password, notes } = req.body;
  const userId = req.params.userId;

  const user = await User.findByPk(userId);

  if (!user) return next(new ErrorHandler("User not found", 404));

  if (user.role === "admin")
    return next(new ErrorHandler("Internal server error", 500));

  if (fullName) user.fullName = fullName;

  user.personal_id = personal_id ? personal_id : null;

  if (phone) user.phone = phone;

  if (password) {
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.SALT)
    );
    user.password = hashedPassword;
  }

  user.notes = notes ? notes : null;

  await user.save();

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    user: {
      id: user.id,
      fullName: user.fullName,
      phone: user.phone,
      personal_id: user.personal_id,
      notes: user.notes,
    },
  });
});

const deleteWorker = catchAsyncErrors(async (req, res, next) => {
  const userId = req.params.userId;

  const user = await User.findByPk(userId);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  if (user.role === "admin")
    return next(new ErrorHandler("Internal server error!", 500));

  await user.destroy();

  res.status(200).json({
    success: true,
    message: "Worker deleted successfully",
    id: user.id,
  });
});

const fetchWorkers = catchAsyncErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  const offset = (page - 1) * limit;

  const totalWorkers = (await User.count()) - 1;
  const workers = await User.findAll({
    attributes: { exclude: ["password", "role"] },
    limit,
    offset,
    where: {
      id: { [Op.ne]: 1 },
    },
  });

  const totalPages = Math.ceil(totalWorkers / limit);

  res.status(200).json({
    success: true,
    workers,
    totalPages,
    currentPage: page,
  });
});

const fetchWorkersIdentity = catchAsyncErrors(async (req, res, next) => {
  const users = await User.findAll({
    attributes: ["id", "fullName"],
    where: {
      role: { [Op.ne]: "admin" },
    },
  });

  res.status(200).json({ success: true, workers: [...users] });
});

module.exports = {
  createWorker,
  editUser,
  deleteWorker,
  fetchWorkers,
  fetchWorkersIdentity,
};
