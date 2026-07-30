/*
Names: Braeden Carlson, Lynda Ofurie, Justin Day
Date: 10/20/2025
Purpose: Advising Website Database Access
Filename: db.js
*/

// database/db.js
const mysql = require("mysql2");

const db = mysql.createPool({
    host: "localhost",
    user: "adviser",
    password: "Password01#",
    database: "advisingdb",
});


module.exports = db;