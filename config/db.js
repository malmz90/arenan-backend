const mariadb = require("mariadb");

const pool = mariadb.createPool({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  connectionLimit: 5,
  database: "arenan_db",
});

module.exports = pool;
