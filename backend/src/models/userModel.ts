import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool, usingMemoryStore } from '../config/db';
import { memoryIds, memoryStore } from '../config/memoryStore';

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
    if (usingMemoryStore) {
      return memoryStore.users.find((user) => user.email === email) || null;
    }

    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    return rows[0] ? mapUser(rows[0]) : null;
  },

  async findById(id: string | number) {
    if (usingMemoryStore) {
      return memoryStore.users.find((user) => user.id === Number(id)) || null;
    }

    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
    return rows[0] ? mapUser(rows[0]) : null;
  },

  async updatePassword(id: number, passwordHash: string) {
    if (usingMemoryStore) {
      const index = memoryStore.users.findIndex((u) => u.id === id);
      if (index !== -1) memoryStore.users[index].password = passwordHash;
      return;
    }
    await pool.execute('UPDATE users SET password = ? WHERE id = ?', [passwordHash, id]);
  },

  async create(userData: { name: string; email: string; password: string }) {
    if (usingMemoryStore) {
      const newId = Math.max(...memoryStore.users.map((u) => u.id), 0) + 1;
      const newUser = {
        _id: newId,
        id: newId,
        name: userData.name,
        email: userData.email,
        password: userData.password,
        avatar: '',
        businessName: '',
        phone: '',
        role: 'user' as const,
        createdAt: new Date(),
      };
      (memoryStore.users as typeof newUser[]).push(newUser);
      return newUser as User;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())',
      [userData.name, userData.email, userData.password, 'user']
    );

    const user = await this.findById(result.insertId);
    if (!user) {
      throw new Error('Failed to create user');
    }
    return user;
  },
};