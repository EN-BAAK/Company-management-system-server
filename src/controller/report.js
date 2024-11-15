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

// Utility function to reverse Hebrew text
const reverseHebrewText = (text) => text.split(" ").reverse().join("  ");

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
      `attachment; filename=${encodeURIComponent(workerName)}_shifts_report.pdf`
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
      .text(worker.fullName, 380, 50, { align: "right" })
      .text(worker.phone, 380, 70, { align: "right" });
    if (worker.personal_id)
      doc.text(worker.personal_id, 380, 90, { align: "right" });

    doc.lineWidth(2);
    doc.moveTo(50, 125).lineTo(555, 125).stroke();

    const currentDate = new Date().toLocaleDateString();
    doc.fontSize(14).text(currentDate, 380, 110, { align: "right" });

    // Reversed column headers in Hebrew
    doc
      .fontSize(10)
      .text(reverseHebrewText(`סה"כ שעות`), 90, 135)
      .text(reverseHebrewText("תאריך"), 170, 135)
      .text(reverseHebrewText("שעת סיום"), 240, 135)
      .text(reverseHebrewText("שעת התחלה"), 325, 135)
      .text(reverseHebrewText("סוג עבודה"), 400, 135)
      .text(reverseHebrewText("שם החברה"), 485, 135);
  };

  const addFooter = () => {
    doc.fontSize(10).text(`Page ${currentPage}`, 500, 700);
    currentPage += 1;
  };

  addHeader();

  let yPosition = 156; // Position just below the header
  shifts.forEach((shift, index) => {
    const hoursWorked = calculateTimeDifference(shift.startHour, shift.endHour);

    // Check if we need to start a new page
    if (yPosition > 680) {
      addFooter(); // Add footer before moving to new page
      doc.addPage(); // Create a new page
      addHeader(); // Add header to the new page
      yPosition = 156; // Reset yPosition just below the header
    }

    // Shift details in the reversed column order
    doc.text(hoursWorked, 90, yPosition);
    doc.text(
      shift.date ? new Date(shift.date).toLocaleDateString() : "N/A",
      170,
      yPosition
    );
    shift.endHour
      ? doc.text(shift.endHour.slice(1, 5), 240, yPosition)
      : doc.text("N/A", 240, yPosition);
    shift.startHour
      ? doc.text(shift.startHour.slice(1, 5), 325, yPosition)
      : doc.text("N/A", 325, yPosition);
    doc.text(shift.workType || "-", 400, yPosition);
    doc.text(shift.company.name, 485, yPosition);

    // Update total hours
    const [hours, minutes] = hoursWorked.split(":").map(Number);
    totalHours += hours + minutes / 60;

    // Move down for next row
    yPosition += 20;
  });

  // Final total hours calculation
  const totalHoursString = `${Math.floor(totalHours)
    .toString()
    .padStart(2, "0")}:${String(Math.round((totalHours % 1) * 60)).padStart(
    2,
    "0"
  )}`;

  // Print total hours on the last page
  const totalSumYPosition = yPosition + 20;
  doc
    .font(hebrewFontPathBold)
    .fontSize(12)
    .text(
      reverseHebrewText(`סה"כ שעות: ${totalHoursString}`),
      90,
      totalSumYPosition,
      {
        align: "left",
      }
    );

  doc.font(hebrewFontPathRegular);

  doc.end();
});

module.exports = {
  buildReport,
};
