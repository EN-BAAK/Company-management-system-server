const { Op } = require("sequelize");
const { catchAsyncErrors } = require("../middleware/catchAsyncErrors");
const { ErrorHandler } = require("../middleware/errorMiddleware");
const { User } = require("../models");

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
    admin.password = hashedPassword;
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
  const offset = parseInt(req.query.offset) || 20;

  const users = await User.findAll({
    attributes: { exclude: ["password", "role"] },
    limit: offset,
    offset: (page - 1) * offset,
    where: {
      id: { [Op.ne]: 1 },
    },
  });

  res.status(200).json({ success: true, workers: [...users] });
});

const fetchWorkersID_FullName = catchAsyncErrors(async (req, res, next) => {
  const users = await User.findAll({
    attributes: ["id", "fullName"],
  });

  res.status(200).json({ success: true, workers: [...users] });
});

module.exports = {
  createWorker,
  editUser,
  deleteWorker,
  fetchWorkers,
  fetchWorkersID_FullName,
};
