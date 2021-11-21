const bcrypt = require("bcryptjs");

exports.checkPassword = async (candidatePass, userPass) => {
  return await bcrypt.compare(candidatePass, userPass);
};
