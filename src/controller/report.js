const { catchAsyncErrors } = require("../middleware/catchAsyncErrors");
const { ErrorHandler } = require("../middleware/errorMiddleware");
const { Shift, User, Company } = require("../models");
const PDFDocument = require("pdfkit");
const { Op } = require("sequelize");
const path = require("path");

const hebrewFontPathRegular = path.join(
  __dirname,
  "../assets/NotoSansHebrew_SemiCondensed-Regular.ttf"
);
const hebrewFontPathBold = path.join(
  __dirname,
  "../assets/NotoSansHebrew_SemiCondensed-Bold.ttf"
);

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

const reverseHebrewText = (text) => text.split(" ").reverse().join("  ");

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
        attributes: ["phone", "id", "fullName", "personal_id"], // Include necessary worker details
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

  // Extract worker details from the first shift
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

  const logoPath = path.join(__dirname, "../assets/logo.jpg");

  doc.font(hebrewFontPathRegular);

  let totalHours = 0;
  let currentPage = 1;

  const addHeader = () => {
    doc.image(logoPath, 50, 40, { width: 250 });

    doc
      .fontSize(12)
      .text(reverseHebrewText(worker.fullName) || "-", 380, 50, {
        align: "right",
      })
      .text(worker.phone || "-", 380, 70, { align: "right" });
    if (worker.personal_id)
      doc.text(worker.personal_id, 380, 90, { align: "right" });

    doc.lineWidth(2);
    doc.moveTo(50, 125).lineTo(555, 125).stroke();

    const currentDate = new Date().toLocaleDateString();
    doc.fontSize(14).text(currentDate, 380, 110, { align: "right" });

    doc
      .fontSize(10)
      .text(reverseHebrewText(`סה"כ שעות`), 90, 135)
      .text(reverseHebrewText("תאריך"), 170, 135)
      .text(reverseHebrewText("שעת סיום"), 240, 135)
      .text(reverseHebrewText("שעת התחלה"), 325, 135)
      .text(reverseHebrewText("סוג עבודה"), 400, 135)
      .text(reverseHebrewText("שם החברה"), 485, 135)
  };

  const addFooter = () => {
    doc.fontSize(10).text(`Page ${currentPage}`, 500, 700);
    currentPage += 1;
  };

  addHeader();

  let yPosition = 156; // Position just below the header
  shifts.forEach((shift) => {
    const hoursWorked = calculateTimeDifference(shift.startHour, shift.endHour);

    // Check if we need to start a new page
    if (yPosition > 680) {
      addFooter(); // Add footer before moving to new page
      doc.addPage(); // Create a new page
      addHeader(); // Add header to the new page
      yPosition = 156; // Reset yPosition just below the header
    }

    // Draw a background rectangle for better row separation
    doc.rect(50, yPosition - 5, 505, 20).fill("#f9f9f9").stroke();

    // Shift details in the reversed column order
    doc.fillColor("black")
      .text(hoursWorked, 90, yPosition)
      .text(
        shift.date ? new Date(shift.date).toLocaleDateString() : "N/A",
        170,
        yPosition,
      );
    shift.endHour
      ? doc.text(shift.endHour.slice(0, 5), 240, yPosition)
      : doc.text("N/A", 240, yPosition);
    shift.startHour
      ? doc.text(shift.startHour.slice(0, 5), 325, yPosition, {
          align: "right",
        })
      : doc.text("N/A", 325, yPosition);
    doc.text(shift.workType || "-", 400, yPosition);
    doc.text(shift.company.name, 485, yPosition);

    // Update total hours
    const [hours, minutes] = hoursWorked.split(":").map(Number);
    totalHours += hours + minutes / 60;

    // Move down for the next row
    yPosition += 25;
  });

  // Final total hours calculation
  const totalHoursString = `${Math.floor(totalHours)
    .toString()
    .padStart(2, "0")}:${String(Math.round((totalHours % 1) * 60)).padStart(
    2,
    "0"
  )}`;

  // Print total hours on the last page
  if (yPosition > 680) {
    addFooter();
    doc.addPage();
    addHeader();
    yPosition = 156;
  }

  doc
    .font(hebrewFontPathBold)
    .fontSize(12)
    .text(
      reverseHebrewText(`סה"כ שעות: ${totalHoursString}`),
      90,
      yPosition + 20,
      {
        align: "left",
      }
    );

  doc.end();
});

module.exports = {
  buildReport,
};
