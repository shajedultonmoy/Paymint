import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool, usingMemoryStore } from '../config/db';
import { memoryIds, memoryStore } from '../config/memoryStore';

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
    if (usingMemoryStore) {
      return memoryStore.products.filter((product) => product.userId === userId);
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM products WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows.map(mapProduct);
  },

  async findOwnedById(id: string | number, userId: number) {
    if (usingMemoryStore) {
      return memoryStore.products.find((product) => product.id === Number(id) && product.userId === userId) || null;
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM products WHERE id = ? AND user_id = ? LIMIT 1',
      [id, userId]
    );
    return rows[0] ? mapProduct(rows[0]) : null;
  },

  async create(userId: number, input: any) {
    if (usingMemoryStore) {
      const id = memoryIds.product();
      const quantity = Number(input.quantity || 0);
      const product = {
        _id: id,
        id,
        userId,
        productName: input.productName || input.name,
        name: input.productName || input.name,
        description: input.description || '',
        sku: input.sku || '',
        price: Number(input.price || 0),
        quantity,
        stockQuantity: quantity,
        image: input.image || '',
        createdAt: new Date(),
      };
      memoryStore.products.unshift(product);
      return product;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO products (user_id, name, description, sku, price, quantity, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, input.productName || input.name, input.description || '', input.sku || '', Number(input.price || 0), Number(input.quantity || 0), input.image || '']
    );

    return this.findOwnedById(result.insertId, userId);
  },

  async update(id: string | number, userId: number, input: any) {
    if (usingMemoryStore) {
      const index = memoryStore.products.findIndex((p) => p.id === Number(id) && p.userId === userId);
      if (index === -1) return null;
      memoryStore.products[index] = {
        ...memoryStore.products[index],
        ...input,
        name: input.productName || input.name || memoryStore.products[index].name
      };
      return memoryStore.products[index];
    }

    await pool.execute(
      'UPDATE products SET name = ?, description = ?, sku = ?, price = ?, quantity = ?, image = ? WHERE id = ? AND user_id = ?',
      [input.productName || input.name, input.description || '', input.sku || '', Number(input.price || 0), Number(input.quantity || 0), input.image || '', id, userId]
    );
    return this.findOwnedById(id, userId);
  },

  async remove(id: string | number, userId: number) {
    if (usingMemoryStore) {
      const initialLength = memoryStore.products.length;
      memoryStore.products = memoryStore.products.filter((p) => !(p.id === Number(id) && p.userId === userId));
      return memoryStore.products.length < initialLength;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM products WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  },
};