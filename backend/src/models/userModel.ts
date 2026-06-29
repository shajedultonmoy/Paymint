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
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
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
  resetPasswordToken: row.reset_password_token || undefined,
  resetPasswordExpire: row.reset_password_expire ? new Date(row.reset_password_expire) : undefined,
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

  async findByResetToken(hashedToken: string) {
    if (usingMemoryStore) {
      const user = memoryStore.users.find(
        (u: any) =>
          u.resetPasswordToken === hashedToken &&
          u.resetPasswordExpire &&
          new Date(u.resetPasswordExpire).getTime() > Date.now()
      );
      return user || null;
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE reset_password_token = ? AND reset_password_expire > NOW() LIMIT 1',
      [hashedToken]
    );
    return rows[0] ? mapUser(rows[0]) : null;
  },

  async updateResetToken(userId: number, hashedToken: string | null, expire: Date | null) {
    if (usingMemoryStore) {
      const index = memoryStore.users.findIndex((u) => u.id === userId);
      if (index !== -1) {
        (memoryStore.users[index] as any).resetPasswordToken = hashedToken || undefined;
        (memoryStore.users[index] as any).resetPasswordExpire = expire || undefined;
      }
      return;
    }

    await pool.execute(
      'UPDATE users SET reset_password_token = ?, reset_password_expire = ? WHERE id = ?',
      [hashedToken, expire, userId]
    );
  },

  async updatePassword(id: number, passwordHash: string) {
    if (usingMemoryStore) {
      const index = memoryStore.users.findIndex((u) => u.id === id);
      if (index !== -1) memoryStore.users[index].password = passwordHash;
      return;
    }
    await pool.execute('UPDATE users SET password = ? WHERE id = ?', [passwordHash, id]);
  },

  async updateProfile(userId: number, data: { name: string; businessName: string; phone: string; avatar?: string }) {
    if (usingMemoryStore) {
      const index = memoryStore.users.findIndex((u) => u.id === userId);
      if (index !== -1) {
        memoryStore.users[index] = {
          ...memoryStore.users[index],
          name: data.name,
          businessName: data.businessName,
          phone: data.phone,
          avatar: data.avatar !== undefined ? data.avatar : memoryStore.users[index].avatar,
        };
        return memoryStore.users[index] as User;
      }
      return null;
    }

    if (data.avatar !== undefined) {
      await pool.execute(
        'UPDATE users SET name = ?, business_name = ?, phone = ?, avatar = ? WHERE id = ?',
        [data.name, data.businessName, data.phone, data.avatar, userId]
      );
    } else {
      await pool.execute(
        'UPDATE users SET name = ?, business_name = ?, phone = ? WHERE id = ?',
        [data.name, data.businessName, data.phone, userId]
      );
    }

    return this.findById(userId);
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