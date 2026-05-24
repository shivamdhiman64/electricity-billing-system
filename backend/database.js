// database.js - SQLite Database
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'electricity_billing.db');
const db = new sqlite3.Database(DB_PATH);

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

const init = async () => {
  await run(`PRAGMA foreign_keys = ON`);

  // Admin table
  await run(`CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )`);

  // Customers table
  await run(`CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    meter_no TEXT NOT NULL UNIQUE,
    connection_type TEXT NOT NULL DEFAULT 'Residential',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Bills table
  await run(`CREATE TABLE IF NOT EXISTS bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    previous_reading REAL NOT NULL,
    current_reading REAL NOT NULL,
    units REAL NOT NULL,
    amount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'Unpaid',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
  )`);

  // Smart Meters table
  await run(`CREATE TABLE IF NOT EXISTS smart_meters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL UNIQUE,
    previous_reading REAL DEFAULT 0,
    current_reading REAL DEFAULT 0,
    monthly_units REAL DEFAULT 0,
    status TEXT DEFAULT 'Online',
    bill_generated INTEGER DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
  )`);

  // Bill Charges breakdown table
  await run(`CREATE TABLE IF NOT EXISTS bill_charges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id INTEGER NOT NULL UNIQUE,
    base_amount REAL DEFAULT 0,
    online_meter_charge REAL DEFAULT 50,
    service_charge REAL DEFAULT 30,
    gst REAL DEFAULT 0,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
  )`);

  // Notifications table
  await run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    bill_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
  )`);

  // Seed admin
  const admin = await get('SELECT * FROM admin WHERE username = ?', ['admin']);
  if (!admin) {
    await run('INSERT INTO admin (username, password) VALUES (?, ?)', ['admin', '1234']);
    console.log('✅ Admin created: admin / 1234');
  }

  // Seed customers
  const count = await get('SELECT COUNT(*) as count FROM customers');
  if (count.count === 0) {
    await run('INSERT INTO customers (name, phone, address, meter_no, connection_type) VALUES (?, ?, ?, ?, ?)',
      ['Arun Kumar', '9876543210', '12, MG Road, Bangalore', 'MTR001', 'Residential']);
    await run('INSERT INTO customers (name, phone, address, meter_no, connection_type) VALUES (?, ?, ?, ?, ?)',
      ['Priya Sharma', '9123456789', '45, Anna Nagar, Chennai', 'MTR002', 'Commercial']);
    await run('INSERT INTO customers (name, phone, address, meter_no, connection_type) VALUES (?, ?, ?, ?, ?)',
      ['Rahul Mehta', '9988776655', '7, Connaught Place, Delhi', 'MTR003', 'Residential']);
    console.log('✅ Sample customers seeded');
  }

  console.log('✅ Database ready');
};

module.exports = { db, run, get, all, init };
