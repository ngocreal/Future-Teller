import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  // host: process.env.DB_HOST || 'localhost',
  // user: process.env.DB_USER || 'root',
  // password: process.env.DB_PASS || '',
  // database: process.env.DB_NAME || 'future_teller',
  // port: process.env.DB_PORT,

  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

export default pool;