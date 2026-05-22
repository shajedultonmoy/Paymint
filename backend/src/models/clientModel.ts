import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool, usingMemoryStore } from '../config/db';
import { memoryIds, memoryStore } from '../config/memoryStore';

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
    if (usingMemoryStore) {
      return memoryStore.clients.filter((client) => client.userId === userId);
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM clients WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows.map(mapClient);
  },

  async findOwnedById(id: string | number, userId: number) {
    if (usingMemoryStore) {
      return memoryStore.clients.find((client) => client.id === Number(id) && client.userId === userId) || null;
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM clients WHERE id = ? AND user_id = ? LIMIT 1',
      [id, userId]
    );
    return rows[0] ? mapClient(rows[0]) : null;
  },

  async create(userId: number, input: any) {
    if (usingMemoryStore) {
      const id = memoryIds.client();
      const client = {
        _id: id,
        id,
        userId,
        clientName: input.clientName || input.name,
        name: input.clientName || input.name,
        companyName: input.companyName || '',
        companyInfo: input.companyName || '',
        email: input.email || '',
        phone: input.phone || '',
        address: input.address || '',
        createdAt: new Date(),
      };
      memoryStore.clients.unshift(client);
      return client;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO clients (user_id, name, company_name, email, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, input.clientName || input.name, input.companyName || '', input.email || '', input.phone || '', input.address || '']
    );

    return this.findOwnedById(result.insertId, userId);
  },

  async update(id: string | number, userId: number, input: any) {
    if (usingMemoryStore) {
      const index = memoryStore.clients.findIndex((c) => c.id === Number(id) && c.userId === userId);
      if (index === -1) return null;
      memoryStore.clients[index] = {
        ...memoryStore.clients[index],
        ...input,
        name: input.clientName || input.name || memoryStore.clients[index].name
      };
      return memoryStore.clients[index];
    }

    await pool.execute(
      'UPDATE clients SET name = ?, company_name = ?, email = ?, phone = ?, address = ? WHERE id = ? AND user_id = ?',
      [input.clientName || input.name, input.companyName || '', input.email || '', input.phone || '', input.address || '', id, userId]
    );
    return this.findOwnedById(id, userId);
  },

  async remove(id: string | number, userId: number) {
    if (usingMemoryStore) {
      const initialLength = memoryStore.clients.length;
      memoryStore.clients = memoryStore.clients.filter((c) => !(c.id === Number(id) && c.userId === userId));
      return memoryStore.clients.length < initialLength;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM clients WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  },
};