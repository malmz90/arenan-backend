const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");

function genPassword(password) {
  return bcrypt.hash(password, 10);
}

module.exports.genPassword = genPassword;
