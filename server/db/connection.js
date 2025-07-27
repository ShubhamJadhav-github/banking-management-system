const mysql = require('mysql2');    // Import mysql2 module
require('dotenv').config();         // Load environment variables

// Set up the config
const db = mysql.createConnection({
    host: process.env.DB_HOST,      // Read from .env file
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Actually Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error("Error connection to MySql: ", err);
        return;
    }
    console.log("Connected to MySql Database");
});

module.exports = db;    // export the connection so other files (like routes) can use it.