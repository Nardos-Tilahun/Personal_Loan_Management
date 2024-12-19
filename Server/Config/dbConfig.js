const mysql = require("mysql2");

const dbConfig = {
    user: process.env.DATABASE_USER,
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
    connectionLimit: process.env.DATABASE_CONNECTION_LIMIT,
};

const dbConnection = mysql.createPool(dbConfig).promise();


module.exports = dbConnection;