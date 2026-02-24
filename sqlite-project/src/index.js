const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the SQLite database
const dbPath = path.join(__dirname, '../data/AppData.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        createTables();
    }
});

// Function to create tables
function createTables() {
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE
        );
    `;

    const createProductsTable = `
        CREATE TABLE IF NOT EXISTS Products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL
        );
    `;

    const createOrdersTable = `
        CREATE TABLE IF NOT EXISTS Orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            productId INTEGER,
            quantity INTEGER NOT NULL,
            FOREIGN KEY (userId) REFERENCES Users(id),
            FOREIGN KEY (productId) REFERENCES Products(id)
        );
    `;

    db.serialize(() => {
        db.run(createUsersTable);
        db.run(createProductsTable);
        db.run(createOrdersTable);
    });
}

// Export the database connection for use in other modules
module.exports = db;