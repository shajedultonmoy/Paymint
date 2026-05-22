import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { sequelize } from './sequelize';
import '../models/entities';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'paymint',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  decimalNumbers: true,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log(`MySQL connected: ${process.env.DB_HOST || 'localhost'}/${process.env.DB_NAME || 'paymint'}`);
  } catch (error: any) {
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
