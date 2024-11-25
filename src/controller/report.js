const { catchAsyncErrors } = require("../middleware/catchAsyncErrors");
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
  const { workerName, workerPhone, companyName, date1, date2, searcher } =
    req.query;

  const where = {};
  const searchCondition = {};

  where["$worker.fullName$"] = { [Op.like]: `%${workerName}%` };
  if (workerPhone) where["$worker.phone$"] = { [Op.like]: `%${workerPhone}%` };
  if (companyName) where["$company.name$"] = { [Op.like]: `%${companyName}%` };

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

  if (searcher)
    searchCondition[Op.or] = [
      { "$company.name$": { [Op.like]: `${searcher}%` } },
      { location: { [Op.like]: `${searcher}%` } },
    ];

  Object.assign(where, searchCondition);

  const shifts = await Shift.findAll({
    where,
    include: [
      {
        model: User,
        as: "worker",
        attributes: ["phone", "id", "fullName", "personal_id"],
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

  if (shifts.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No shifts found for the given criteria.",
    });
  }

  const worker = shifts[0].worker;

  const doc = new PDFDocument();
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  doc.on("end", () => {
    const pdfBuffer = Buffer.concat(chunks);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${encodeURIComponent(
        worker.fullName || "report"
      )}_shifts_report.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdfBuffer);
  });

  const logoPath = path.join(__dirname, "../assets/logo.png");

  let totalHours = 0;
  let currentPage = 1;

  const addHeader = () => {
    doc
      .fontSize(12)
      .text(worker.fullName || "-", 50, 50)
      .text(worker.phone || "-", 50, 70);
    if (worker.personal_id) doc.text(worker.personal_id, 50, 90);

    const currentDate = new Date().toLocaleDateString();
    doc.fontSize(14).text(currentDate, 50, 110);

    doc.image(logoPath, 320, 40, { width: 250 });

    doc.lineWidth(2);
    doc.moveTo(50, 125).lineTo(555, 125).stroke();

    doc
      .fontSize(10)
      .text("Company Name", 65, 135)
      .text("Work Type", 170, 135)
      .text("Start Time", 240, 135)
      .text("End Time", 325, 135)
      .text("Date", 400, 135)
      .text("Total Hours", 485, 135);
  };

  const addFooter = () => {
    doc.fontSize(10).text(`Page ${currentPage}`, 500, 700);
    currentPage += 1;
  };

  addHeader();

  let yPosition = 156;
  shifts.forEach((shift) => {
    const hoursWorked = calculateTimeDifference(shift.startHour, shift.endHour);

    if (yPosition > 680) {
      addFooter();
      doc.addPage();
      addHeader();
      yPosition = 156;
    }

    doc
      .rect(50, yPosition - 5, 505, 20)
      .fill("#f9f9f9")
      .stroke();

    doc.fillColor("black").text(hoursWorked, 485, yPosition);

    doc.text(
      shift.date ? new Date(shift.date).toLocaleDateString() : "N/A",
      400,
      yPosition
    );

    shift.startHour
      ? doc.text(shift.startHour.slice(0, 5), 240, yPosition)
      : doc.text("N/A", 240, yPosition);
    shift.endHour
      ? doc.text(shift.endHour.slice(0, 5), 325, yPosition)
      : doc.text("N/A", 325, yPosition);

    doc.text(shift.workType || "-", 170, yPosition);
    doc.text(shift.company.name, 65, yPosition);

    const [hours, minutes] = hoursWorked.split(":").map(Number);
    totalHours += hours + minutes / 60;

    yPosition += 25;
  });

  const totalHoursString = `${Math.floor(totalHours)
    .toString()
    .padStart(2, "0")}:${String(Math.round((totalHours % 1) * 60)).padStart(
    2,
    "0"
  )}`;

  if (yPosition > 680) {
    addFooter();
    doc.addPage();
    addHeader();
    yPosition = 156;
  }

  doc.fontSize(12).text(`Total Hours: ${totalHoursString}`, 50, yPosition + 20);

  doc.end();
});

module.exports = {
  buildReport,
};
