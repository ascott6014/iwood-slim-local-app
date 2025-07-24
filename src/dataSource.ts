import mysql from 'mysql2/promise';

if (
    !process.env.DB_HOST ||
    !process.env.DB_PORT ||
    !process.env.DB_USERNAME ||
    !process.env.DB_PASSWORD ||
    !process.env.DB_NAME
) {
    throw new Error('MySQL environment variables (DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME) are required in .env file');
}

export const db = await mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});