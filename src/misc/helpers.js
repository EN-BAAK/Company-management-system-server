const bcrypt = require("bcrypt");

comparedPassword = async (candidatePassword) => {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = { comparedPassword };
