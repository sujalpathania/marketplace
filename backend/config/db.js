const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();

let usePg = true;
let pgPool = null;
let sqliteDb = null;

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function convertQuery(text) {
  return text.replace(/\$\d+/g, '?');
}

const initDb = async () => {
  try {
    pgPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'campus_marketplace',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      connectionTimeoutMillis: 2000
    });

    const client = await pgPool.connect();
    client.release();

    await pgPool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        student_id VARCHAR(50),
        college_name VARCHAR(200),
        student_id_photo TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS listings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        condition VARCHAR(50) NOT NULL,
        image_url TEXT,
        status VARCHAR(20) DEFAULT 'Available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
        buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
        seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
        total_price DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'Confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS photo_requests (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
        buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
        message TEXT,
        status VARCHAR(20) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS listing_photos (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
        request_id UUID REFERENCES photo_requests(id) ON DELETE CASCADE,
        photo_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('PostgreSQL database connected and tables initialized successfully.');
  } catch (err) {
    // console.warn('PostgreSQL connection failed:', err.message);
    console.log('Falling back to SQLite database for reliable execution...');
    usePg = false;

    const dbPath = path.join(dataDir, 'campus_marketplace.db');
    sqliteDb = new sqlite3.Database(dbPath);

    await runSqlite(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        student_id TEXT,
        college_name TEXT,
        student_id_photo TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await runSqlite(`
      CREATE TABLE IF NOT EXISTS listings (
        id TEXT PRIMARY KEY,
        seller_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        price REAL NOT NULL,
        category TEXT NOT NULL,
        condition TEXT NOT NULL,
        image_url TEXT,
        status TEXT DEFAULT 'Available',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await runSqlite(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        listing_id TEXT NOT NULL,
        buyer_id TEXT NOT NULL,
        seller_id TEXT NOT NULL,
        total_price REAL NOT NULL,
        status TEXT DEFAULT 'Confirmed',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await runSqlite(`
      CREATE TABLE IF NOT EXISTS photo_requests (
        id TEXT PRIMARY KEY,
        listing_id TEXT NOT NULL,
        buyer_id TEXT NOT NULL,
        message TEXT,
        status TEXT DEFAULT 'Pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await runSqlite(`
      CREATE TABLE IF NOT EXISTS listing_photos (
        id TEXT PRIMARY KEY,
        listing_id TEXT NOT NULL,
        request_id TEXT,
        photo_url TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('SQLite database initialized successfully.');
  }
};

function runSqlite(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function getSqliteAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

const query = async (text, params = []) => {
  if (usePg) {
    return await pgPool.query(text, params);
  }

  let sqliteParams = [...params];
  let sqliteText = text;

  // Handle INSERT statements for SQLite
  if (sqliteText.trim().toUpperCase().startsWith('INSERT')) {
    const newId = crypto.randomUUID();
    let hasReturning = false;

    if (/RETURNING/i.test(sqliteText)) {
      hasReturning = true;
      sqliteText = sqliteText.replace(/RETURNING.*/i, '');
    }

    if (!sqliteText.includes('(id,')) {
      if (sqliteText.includes('INSERT INTO users (')) {
        sqliteText = sqliteText.replace('INSERT INTO users (', 'INSERT INTO users (id, ');
        sqliteText = sqliteText.replace(/VALUES\s*\(/i, 'VALUES (?, ');
        sqliteParams.unshift(newId);
      } else if (sqliteText.includes('INSERT INTO listings (')) {
        sqliteText = sqliteText.replace('INSERT INTO listings (', 'INSERT INTO listings (id, ');
        sqliteText = sqliteText.replace(/VALUES\s*\(/i, 'VALUES (?, ');
        sqliteParams.unshift(newId);
      } else if (sqliteText.includes('INSERT INTO orders (')) {
        sqliteText = sqliteText.replace('INSERT INTO orders (', 'INSERT INTO orders (id, ');
        sqliteText = sqliteText.replace(/VALUES\s*\(/i, 'VALUES (?, ');
        sqliteParams.unshift(newId);
      } else if (sqliteText.includes('INSERT INTO photo_requests (')) {
        sqliteText = sqliteText.replace('INSERT INTO photo_requests (', 'INSERT INTO photo_requests (id, ');
        sqliteText = sqliteText.replace(/VALUES\s*\(/i, 'VALUES (?, ');
        sqliteParams.unshift(newId);
      } else if (sqliteText.includes('INSERT INTO listing_photos (')) {
        sqliteText = sqliteText.replace('INSERT INTO listing_photos (', 'INSERT INTO listing_photos (id, ');
        sqliteText = sqliteText.replace(/VALUES\s*\(/i, 'VALUES (?, ');
        sqliteParams.unshift(newId);
      }
    }

    sqliteText = convertQuery(sqliteText);
    sqliteText = sqliteText.replace(/ILIKE/gi, 'LIKE').replace(/FOR UPDATE/gi, '');

    await runSqlite(sqliteText, sqliteParams);

    if (hasReturning) {
      let tableName = 'users';
      if (/INTO listings/i.test(text)) tableName = 'listings';
      if (/INTO orders/i.test(text)) tableName = 'orders';
      if (/INTO photo_requests/i.test(text)) tableName = 'photo_requests';
      if (/INTO listing_photos/i.test(text)) tableName = 'listing_photos';
      const rows = await getSqliteAll(`SELECT * FROM ${tableName} WHERE id = ?`, [newId]);
      return { rows };
    }
    return { rows: [] };
  }

  sqliteText = convertQuery(sqliteText);
  sqliteText = sqliteText.replace(/ILIKE/gi, 'LIKE').replace(/FOR UPDATE/gi, '');

  if (sqliteText.trim().toUpperCase().startsWith('BEGIN') ||
      sqliteText.trim().toUpperCase().startsWith('COMMIT') ||
      sqliteText.trim().toUpperCase().startsWith('ROLLBACK')) {
    await runSqlite(sqliteText);
    return { rows: [] };
  }  

  const rows = await getSqliteAll(sqliteText, sqliteParams);
  return { rows };
};

const getClient = async () => {
  if (usePg) {
    const client = await pgPool.connect();
    return client;
  }
  return {
    query: async (text, params) => query(text, params),
    release: () => {}
  };
};

module.exports = {
  pool: { connect: getClient },
  query,
  initDb
};
