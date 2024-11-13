const { Op } = require("sequelize");
const { catchAsyncErrors } = require("../middleware/catchAsyncErrors");
const { ErrorHandler } = require("../middleware/errorMiddleware");
const { Shift, User, Company } = require("../models");

const createShift = catchAsyncErrors(async (req, res, next) => {
  const {
    date,
    workerId,
    companyId,
    workType,
    startHour,
    endHour,
    location,
    notes,
  } = req.body;

  const newShift = await Shift.create({
    date,
    workerId: workerId || null,
    companyId,
    workType,
    startHour,
    endHour,
    location,
    notes,
  });

  const includeOptions = [
    {
      model: Company,
      as: "company",
      attributes: ["name"],
    },
  ];

  if (workerId) {
    includeOptions.push({
      model: User,
      as: "worker",
      attributes: ["fullName", "phone"],
    });
  }

  // Fetch the shift with additional details
  const shiftWithDetails = await Shift.findOne({
    where: { id: newShift.id },
    attributes: [
      "id",
      "date",
      "workerId",
      "companyId",
      "workType",
      "startHour",
      "endHour",
      "location",
      "notes",
    ],
    include: includeOptions,
  });

  const shift = {
    id: shiftWithDetails.id,
    date: shiftWithDetails.date,
    company: {
      id: shiftWithDetails.companyId,
      name: shiftWithDetails.company.name,
    },
    workType: shiftWithDetails.workType,
    startHour: shiftWithDetails.startHour,
    endHour: shiftWithDetails.endHour,
    location: shiftWithDetails.location,
    notes: shiftWithDetails.notes,
    worker: workerId
      ? {
          id: shiftWithDetails.workerId,
          fullName: shiftWithDetails.worker.fullName,
          phone: shiftWithDetails.worker.phone,
        }
      : null,
  };

  res.status(200).json({
    success: true,
    message: "Shift created successfully",
    shift,
  });
});

const editShift = catchAsyncErrors(async (req, res, next) => {
  const {
    date,
    workerId,
    companyId,
    workType,
    startHour,
    endHour,
    location,
    notes,
  } = req.body;
  const shiftId = req.params.shiftId;

  const shift = await Shift.findByPk(shiftId);

  if (!shift) {
    return next(new ErrorHandler("Shift not found", 404));
  }

  if (date) shift.date = date;
  shift.workerId = workerId || null;
  shift.companyId = companyId || null;
  shift.location = location || null;
  shift.notes = notes || null;
  shift.workType = workType || null;
  shift.startHour = startHour || null;
  shift.endHour = endHour || null;

  await shift.save();

  const includeOptions = [
    {
      model: Company,
      as: "company",
      attributes: ["name"],
    },
  ];

  if (workerId) {
    includeOptions.push({
      model: User,
      as: "worker",
      attributes: ["fullName", "phone"],
    });
  }

  const updatedShift = await Shift.findOne({
    where: { id: shift.id },
    attributes: [
      "id",
      "date",
      "workerId",
      "companyId",
      "workType",
      "startHour",
      "endHour",
      "location",
      "notes",
    ],
    include: includeOptions,
  });

  const newShift = {
    id: updatedShift.id,
    date: updatedShift.date,
    workType: updatedShift.workType,
    startHour: updatedShift.startHour,
    endHour: updatedShift.endHour,
    location: updatedShift.location,
    notes: updatedShift.notes,
    worker: workerId
      ? {
          id: updatedShift.workerId,
          fullName: updatedShift.worker?.fullName,
          phone: updatedShift.worker?.phone,
        }
      : null,
    company: companyId
      ? {
          id: updatedShift.companyId,
          name: updatedShift.company?.name,
        }
      : null,
  };

  res.status(200).json({
    success: true,
    message: "Shift updated successfully",
    shift: newShift,
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
  const limit = parseInt(req.query.limit) || 15;
  const offset = (page - 1) * limit;

  const { workerName, workerPhone, companyName, date1, date2 } = req.query;

  const where = {};

  if (workerName) {
    where["$worker.fullName$"] = { [Op.eq]: workerName };
  }

  if (workerPhone) {
    where["$worker.phone$"] = { [Op.like]: `${workerPhone}` };
  }

  if (companyName) {
    where["$company.name$"] = { [Op.like]: `${companyName}` };
  }

  if (date1 && date2) {
    const startDate = new Date(date1);
    const endDate = new Date(date2);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    where.date = { [Op.between]: [startDate, endDate] };
  } else if (date1) {
    const startDate = new Date(date1);
    startDate.setHours(0, 0, 0, 0);
    where.date = { [Op.eq]: startDate };
  } else if (date2) {
    const endDate = new Date(date2);
    endDate.setHours(23, 59, 59, 999);
    where.date = { [Op.eq]: endDate };
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
        attributes: ["name", "id"],
        required: true,
      },
    ],
    attributes: [
      "id",
      "startHour",
      "endHour",
      "date",
      "location",
      "workType",
      "notes",
    ],
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
