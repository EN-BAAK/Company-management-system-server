const express = require("express");
const cors = require("cors")
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config()
const db = require("./src/models");

const app = express();

app.use(cookieParser());
app.use(express.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
// app.use(express.static(path.join(__dirname, "./dist")));
// app.use((req, res, next) => {
//   if (req.method === "GET" && !req.path.startsWith("/api")) {
//     const indexPath = path.join(__dirname, "./dist/index.html");
//     res.sendFile(indexPath);
//   } else {
//     next();
//   }
// });

// Routers


const port = process.env.PORT || 3012
db.sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});