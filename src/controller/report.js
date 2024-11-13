const { catchAsyncErrors } = require("../middleware/catchAsyncErrors");
const { ErrorHandler } = require("../middleware/errorMiddleware");
const { Shift, User, Company } = require("../models");
const PDFDocument = require("pdfkit");
const { Op } = require("sequelize");
const path = require("path");

const calculateTimeDifference = (startHour, endHour) => {
  if (!startHour || !endHour) return "00:00";

  const [startH, startM] = startHour.slice(0, 5).split(":").map(Number);
  const [endH, endM] = endHour.slice(0, 5).split(":").map(Number);

  const startTotalMinutes = startH * 60 + startM;
  const endTotalMinutes = endH * 60 + endM;

  let diffMinutes = endTotalMinutes - startTotalMinutes;

  if (diffMinutes < 0) {
    diffMinutes += 24 * 60;
  }

  const diffH = Math.floor(diffMinutes / 60);
  const diffM = diffMinutes % 60;

  return `${String(diffH).padStart(2, "0")}:${String(diffM).padStart(2, "00")}`;
};

const buildReport = catchAsyncErrors(async (req, res, next) => {
  const { workerName } = req.query;

  const worker = await User.findOne({
    where: { fullName: { [Op.like]: `%${workerName}%` } },
    attributes: ["fullName", "phone", "personal_id", "id"],
  });

  if (!worker) {
    return next(
      new ErrorHandler(`Worker with name ${workerName} not found`, 404)
    );
  }

  const shifts = await Shift.findAll({
    where: { workerId: worker.id },
    include: [
      { model: Company, as: "company", attributes: ["name"], required: true },
    ],
    attributes: ["workType", "startHour", "endHour", "date"],
    order: [["date", "ASC"]],
  });

  const doc = new PDFDocument();
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  doc.on("end", () => {
    const pdfBuffer = Buffer.concat(chunks);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${workerName}_shifts_report.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdfBuffer);
  });

  const logoPath = path.join(__dirname, "../assets/logo.jpg");
  doc.image(logoPath, 50, 40, { width: 250 });

  doc
    .font("Helvetica")
    .fontSize(12)
    .text(`${worker.fullName}`, 380, 50, { align: "right" });
  doc.text(`${worker.phone}`, 380, 70, { align: "right" });
  if (worker.personal_id)
    doc.text(`${worker.personal_id}`, 380, 90, { align: "right" });

  doc.lineWidth(2);
  doc.moveTo(50, 125).lineTo(550, 125).stroke();

  const currentDate = new Date().toLocaleDateString();
  doc.fontSize(14).text(currentDate, 380, 110, { align: "right" });

  doc
    .fontSize(10)
    .text("Company Name", 65, 135)
    .text("Work Type", 180, 135)
    .text("Start Hour", 275, 135)
    .text("End Hour", 335, 135)
    .text("Date", 410, 135)
    .text("Total Hours", 485, 135);

  let totalHours = 0;

  shifts.forEach((shift, index) => {
    const yPosition = 156 + index * 20;
    const hoursWorked = calculateTimeDifference(shift.startHour, shift.endHour);

    doc.text(shift.company.name, 65, yPosition);
    doc.text(shift.workType || "N/A", 180, yPosition);
    doc.text(shift.startHour || "N/A", 275, yPosition);
    doc.text(shift.endHour || "N/A", 335, yPosition);
    doc.text(
      shift.date ? new Date(shift.date).toLocaleDateString() : "N/A",
      410,
      yPosition
    );
    doc.text(hoursWorked, 485, yPosition);

    const [hours, minutes] = hoursWorked.split(":").map(Number);
    totalHours += hours + minutes / 60;
  });

  const totalHoursString = `${Math.floor(totalHours)
    .toString()
    .padStart(2, "0")}:${String(Math.round((totalHours % 1) * 60)).padStart(
    2,
    "0"
  )}`;

  const totalSumYPosition = 150 + shifts.length * 20 + 20;
  doc
    .fontSize(12)
    .text(`Total Hours: ${totalHoursString}`, 50, totalSumYPosition);

  doc.end();
});

module.exports = {
  buildReport,
};
