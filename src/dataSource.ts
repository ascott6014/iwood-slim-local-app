const mysql = require('mysql2/promise');

if (
    !process.env.DB_HOST ||
    !process.env.DB_PORT ||
    !process.env.DB_USERNAME ||
    !process.env.DB_PASSWORD ||
    !process.env.DB_NAME
) {
    throw new Error('MySQL environment variables (DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME) are required in .env file');
}

let dbPool: any;

async function initializeDatabase() {
    if (!dbPool) {
        dbPool = await mysql.createPool({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT, 10),
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });
    }
    return dbPool;
}

async function getDatabase() {
    if (!dbPool) {
        await initializeDatabase();
    }
    return dbPool;
}

// Initialize the pool synchronously for compatibility with existing code
const dbPromise = initializeDatabase();

// Create a proxy that will wait for the database to be ready
const db = new Proxy({}, {
    get(target, prop) {
        return async function(...args: any[]) {
            const database = await dbPromise;
            return database[prop](...args);
        };
    }
});

module.exports = { getDatabase, db };