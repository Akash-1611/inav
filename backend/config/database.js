require('dotenv').config();
const { Pool } = require('pg');
const mysql = require('mysql2/promise');

let pool;
let dbType;

const initDatabase = async () => {
  dbType = process.env.DB_TYPE || 'postgres';

  if (dbType === 'postgres') {
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'payment_collection',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });

    // Test connection
    try {
      await pool.query('SELECT NOW()');
      console.log('PostgreSQL connected successfully');
    } catch (error) {
      console.error('PostgreSQL connection error:', error);
      throw error;
    }
  } else if (dbType === 'mysql') {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      database: process.env.DB_NAME || 'payment_collection',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connection
    try {
      await pool.query('SELECT 1');
      console.log('MySQL connected successfully');
    } catch (error) {
      console.error('MySQL connection error:', error);
      throw error;
    }
  }

  return pool;
};

const getPool = () => {
  if (!pool) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return pool;
};

// Convert PostgreSQL-style parameters ($1, $2) to MySQL-style (?)
const convertParams = (query, params) => {
  if (dbType === 'mysql' && params && params.length > 0) {
    // Replace $1, $2, etc. with ?
    return query.replace(/\$\d+/g, '?');
  }
  return query;
};

const query = async (text, params) => {
  const dbPool = getPool();
  const convertedQuery = convertParams(text, params);
  const result = await dbPool.query(convertedQuery, params);
  
  // Normalize result format
  if (dbType === 'mysql') {
    return { rows: result[0], rowCount: result[0].length };
  }
  return result;
};

module.exports = {
  initDatabase,
  getPool,
  query,
  getDbType: () => dbType
};

