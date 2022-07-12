const mysql = require("mysql");
require("dotenv").config();

//Conectar base de dados
var db = mysql.createConnection({
  connectionLimit: 1,
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  multipleStatements: true,
});

db.connect(function (err) {
  if (err) throw err;
})

module.exports = db;
