const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Admin123!",
  database: "gp",
});

module.exports = pool;
