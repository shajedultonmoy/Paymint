import { RowDataPacket } from 'mysql2';
import { pool } from '../config/db';

export interface User {
  _id: number;
  id: number;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  businessName: string;
  phone: string;
  role: 'user' | 'admin';
  createdAt?: Date;
}

const mapUser = (row: any): User => ({
  _id: row.id,
  id: row.id,
  name: row.name,
  email: row.email,
  password: row.password,
  avatar: row.avatar || '',
  businessName: row.business_name || '',
  phone: row.phone || '',
  role: row.role || 'user',
  createdAt: row.created_at,
});

export const UserModel = {
  async findByEmail(email: string) {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    return rows[0] ? mapUser(rows[0]) : null;
  },

  async findById(id: string | number) {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
    return rows[0] ? mapUser(rows[0]) : null;
  },

  async create(input: { name: string; email: string; password: string }) {
    const [result]: any = await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [input.name, input.email, input.password]
    );
    return this.findById(result.insertId);
  },
};
