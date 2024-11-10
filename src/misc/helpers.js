const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

comparePassword = async (enteredPassword, password) => {
  return await bcrypt.compare(enteredPassword, password);
};

const generateJsonWebToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1000y",
  });
};

const generateToken = (user, message, statusCode, res) => {
  const token = generateJsonWebToken(user.id);
  const cookieName = user.role === "admin" ? "adminToken" : "workerToken";

  res
    .status(statusCode)
    .cookie(cookieName, token, {
      expires: new Date("9999-12-31"),
    })
    .json({
      success: true,
      message,
      token,
    });
};

module.exports = { comparePassword, generateToken };
