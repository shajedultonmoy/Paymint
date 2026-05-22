import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../config/db';

const mapClient = (row: any) => ({
  _id: row.id,
  id: row.id,
  userId: row.user_id,
  clientName: row.name,
  name: row.name,
  companyName: row.company_name || '',
  companyInfo: row.company_name || '',
  email: row.email || '',
  phone: row.phone || '',
  address: row.address || '',
  createdAt: row.created_at,
});

export const ClientModel = {
  async findByUser(userId: number) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM clients WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows.map(mapClient);
  },

  async findOwnedById(id: string | number, userId: number) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM clients WHERE id = ? AND user_id = ? LIMIT 1',
      [id, userId]
    );
    return rows[0] ? mapClient(rows[0]) : null;
  },

  async create(userId: number, input: any) {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO clients (user_id, name, company_name, email, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, input.clientName || input.name, input.companyName || null, input.email || null, input.phone || null, input.address || null]
    );
    return this.findOwnedById(result.insertId, userId);
  },

  async update(id: string | number, userId: number, input: any) {
    await pool.execute(
      'UPDATE clients SET name = ?, company_name = ?, email = ?, phone = ?, address = ? WHERE id = ? AND user_id = ?',
      [input.clientName || input.name, input.companyName || null, input.email || null, input.phone || null, input.address || null, id, userId]
    );
    return this.findOwnedById(id, userId);
  },

  async remove(id: string | number, userId: number) {
    const [result] = await pool.execute<ResultSetHeader>('DELETE FROM clients WHERE id = ? AND user_id = ?', [id, userId]);
    return result.affectedRows > 0;
  },
};
