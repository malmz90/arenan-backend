const bcrypt = require('bcrypt')

function genPassword(password) {
  return bcrypt.hash(password, 10)
}

module.exports.genPassword = genPassword
