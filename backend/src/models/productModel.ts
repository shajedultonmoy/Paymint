import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../config/db';

const mapProduct = (row: any) => ({
  _id: row.id,
  id: row.id,
  userId: row.user_id,
  productName: row.name,
  name: row.name,
  description: row.description || '',
  sku: row.sku || '',
  price: Number(row.price || 0),
  quantity: Number(row.quantity || 0),
  stockQuantity: Number(row.quantity || 0),
  image: row.image || '',
  createdAt: row.created_at,
});

export const ProductModel = {
  async findByUser(userId: number) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM products WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows.map(mapProduct);
  },

  async findOwnedById(id: string | number, userId: number) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM products WHERE id = ? AND user_id = ? LIMIT 1',
      [id, userId]
    );
    return rows[0] ? mapProduct(rows[0]) : null;
  },

  async create(userId: number, input: any) {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO products (user_id, name, description, sku, price, quantity, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, input.productName || input.name, input.description || null, input.sku || null, Number(input.price || 0), Number(input.quantity || 0), input.image || null]
    );
    return this.findOwnedById(result.insertId, userId);
  },

  async update(id: string | number, userId: number, input: any) {
    await pool.execute(
      'UPDATE products SET name = ?, description = ?, sku = ?, price = ?, quantity = ?, image = ? WHERE id = ? AND user_id = ?',
      [input.productName || input.name, input.description || null, input.sku || null, Number(input.price || 0), Number(input.quantity || 0), input.image || null, id, userId]
    );
    return this.findOwnedById(id, userId);
  },

  async remove(id: string | number, userId: number) {
    const [result] = await pool.execute<ResultSetHeader>('DELETE FROM products WHERE id = ? AND user_id = ?', [id, userId]);
    return result.affectedRows > 0;
  },
};
