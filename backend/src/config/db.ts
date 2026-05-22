import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { sequelize } from './sequelize';
import '../models/entities';
import { DEMO_EMAIL, DEMO_PASSWORD_HASH } from './demoUser';

dotenv.config();

const dbName = process.env.DB_NAME || 'paymint';

export let usingMemoryStore = false;

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: dbName,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  decimalNumbers: true,
});

const quoteIdentifier = (identifier: string) => `\`${identifier.replace(/`/g, '``')}\``;

const ensureLocalDatabase = async () => {
  if (process.env.NODE_ENV === 'production' || process.env.AUTO_SYNC_DB === 'false') {
    return;
  }

  const bootstrap = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  await bootstrap.query(
    `CREATE DATABASE IF NOT EXISTS ${quoteIdentifier(dbName)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await bootstrap.end();

  await sequelize.sync();
  await pool.execute(
    `INSERT INTO users (id, name, email, password, business_name, phone)
     VALUES (1, 'Demo User', ?, ?, 'Paymint Studio', '+1 555 0101')
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       email = VALUES(email),
       password = VALUES(password),
       business_name = VALUES(business_name),
       phone = VALUES(phone)`,
    [DEMO_EMAIL, DEMO_PASSWORD_HASH]
  );
};

const connectDB = async () => {
  try {
    await ensureLocalDatabase();
    await sequelize.authenticate();
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log(`MySQL connected: ${process.env.DB_HOST || 'localhost'}/${dbName}`);
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') {
      usingMemoryStore = true;
      console.warn(`MySQL unavailable (${error?.code || error?.message}). Using in-memory development store.`);
      return;
    }

    const details = [
      error?.code,
      error?.errno ? `errno ${error.errno}` : '',
      error?.sqlState ? `sqlState ${error.sqlState}` : '',
      error?.message,
    ].filter(Boolean).join(' | ');

    console.error(`Database connection failed: ${details || String(error)}`);
    process.exit(1);
  }
};

export default connectDB;
