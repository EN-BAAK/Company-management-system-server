const { catchAsyncErrors } = require("../middleware/catchAsyncErrors");
const { ErrorHandler } = require("../middleware/errorMiddleware");
const { Shift } = require("../models");

const createShift = catchAsyncErrors(async (req, res, next) => {
  const { date, workerId, companyId, work_type, startHour, endHour } = req.body;

  const shiftExists = await Shift.findOne({
    where: { date, companyId },
  });

  if (shiftExists) {
    return next(new ErrorHandler("Shift already exists for this date and company", 400));
  }

  const newShift = await Shift.create({
    date,
    workerId,
    companyId,
    work_type,
    startHour,
    endHour,
  });

  res.status(200).json({
    success: true,
    message: "Shift created successfully",
    shift: newShift,
  });
});

const editShift = catchAsyncErrors(async (req, res, next) => {
  const { date, workerId, companyId, work_type, startHour, endHour } = req.body;
  const shiftId = req.params.shiftId;

  const shift = await Shift.findByPk(shiftId);

  if (!shift) {
    return next(new ErrorHandler("Shift not found", 404));
  }

  if (date) shift.date = date;
  if (workerId) shift.workerId = workerId;
  if (companyId) shift.companyId = companyId;
  if (work_type) shift.work_type = work_type;
  if (startHour) shift.startHour = startHour;
  if (endHour) shift.endHour = endHour;

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

module.exports = {
  createShift,
  editShift,
  deleteShift,
};
