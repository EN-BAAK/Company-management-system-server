const { Op } = require("sequelize");
const { catchAsyncErrors } = require("../middleware/catchAsyncErrors");
const { ErrorHandler } = require("../middleware/errorMiddleware");
const { Shift, User, Company } = require("../models");

const createShift = catchAsyncErrors(async (req, res, next) => {
  const {
    date,
    workerId,
    companyId,
    work_type,
    startHour,
    endHour,
    location,
    notes,
  } = req.body;

  const newShift = await Shift.create({
    date,
    workerId,
    companyId,
    work_type,
    startHour,
    endHour,
    location,
    notes,
  });

  res.status(200).json({
    success: true,
    message: "Shift created successfully",
    shift: newShift,
  });
});

const editShift = catchAsyncErrors(async (req, res, next) => {
  const { date, workerId, companyId, work_type, startHour, endHour, location } =
    req.body;
  const shiftId = req.params.shiftId;

  const shift = await Shift.findByPk(shiftId);

  if (!shift) {
    return next(new ErrorHandler("Shift not found", 404));
  }

  if (date) shift.date = date;
  shift.workerId = workerId ? workerId : null;
  if (companyId) shift.companyId = companyId;
  if (location) shift.location = location;
  shift.notes = notes ? notes : null;
  shift.work_type = work_type ? work_type : null;
  shift.startHour = startHour ? startHour : null;
  shift.endHour = endHour ? endHour : null;

  await shift.save();

  res.status(200).json({
    success: true,
    message: "Shift updated successfully",
    shift,
  });
});

const deleteShift = catchAsyncErrors(async (req, res, next) => {
  const shiftId = req.params.shiftId;

  const shift = await Shift.findByPk(shiftId);

  if (!shift) {
    return next(new ErrorHandler("Shift not found", 404));
  }

  await shift.destroy();

  res.status(200).json({
    success: true,
    message: "Shift deleted successfully",
    id: shift.id,
  });
});

const fetchShifts = catchAsyncErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const { workerName, workerPhone, companyName, date1, date2 } = req.query;

  const where = {};

  if (workerName) {
    where["$worker.fullName$"] = { [Op.iLike]: `%${workerName}%` };
  }

  if (workerPhone) {
    where["$worker.phone$"] = { [Op.iLike]: `%${workerPhone}%` };
  }

  if (companyName) {
    where["$company.name$"] = { [Op.iLike]: `%${companyName}%` };
  }

  if (date1 && date2) {
    where.date = { [Op.between]: [new Date(date1), new Date(date2)] };
  } else if (date1) {
    where.date = { [Op.eq]: new Date(date1) };
  } else if (date2) {
    where.date = { [Op.eq]: new Date(date2) };
  }

  const shifts = await Shift.findAndCountAll({
    limit,
    offset,
    where,
    include: [
      {
        model: User,
        as: "worker",
        attributes: ["phone", "id", "fullName"],
        required: false,
      },
      {
        model: Company,
        as: "company",
        attributes: ["name"],
        required: true,
      },
    ],
    attributes: ["id", "startHour", "endHour", "date", "location"],
    order: [["date", "DESC"]],
  });

  res.status(200).json({
    success: true,
    message: "Shifts retrieved successfully",
    shifts: shifts.rows,
    totalRecords: shifts.count,
  });
});

module.exports = {
  createShift,
  editShift,
  deleteShift,
  fetchShifts,
};
