import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool, usingMemoryStore } from '../config/db';
import { buildMemoryInvoice, memoryStore } from '../config/memoryStore';
import { calculateInvoiceTotals } from '../services/invoiceService';

export interface InvoiceItemInput {
  productId?: number | null;
  name: string;
  quantity: number;
  unitPrice: number;
  price?: number;
  total?: number;
  subtotal?: number;
}

const mapInvoiceSummary = (row: any) => ({
  _id: row.id,
  id: row.id,
  userId: row.user_id,
  clientId: row.client_id
    ? {
        _id: row.client_id,
        id: row.client_id,
        clientName: row.client_name,
        name: row.client_name,
        companyName: row.company_name || '',
        email: row.client_email || '',
        phone: row.client_phone || '',
        address: row.client_address || '',
      }
    : row.client_id,
  invoiceNumber: row.invoice_number,
  date: row.invoice_date,
  dueDate: row.due_date,
  subtotal: Number(row.subtotal || 0),
  tax: Number(row.tax || 0),
  discount: Number(row.discount || 0),
  total: Number(row.total_amount || 0),
  totalAmount: Number(row.total_amount || 0),
  status: row.status,
  currency: row.currency || 'USD',
  notes: row.notes || '',
  createdAt: row.created_at,
});

const mapItem = (row: any) => ({
  _id: row.id,
  id: row.id,
  productId: row.product_id,
  name: row.item_name || row.product_name || 'Custom item',
  quantity: Number(row.quantity || 0),
  unitPrice: Number(row.price || 0),
  price: Number(row.price || 0),
  total: Number(row.subtotal || 0),
  subtotal: Number(row.subtotal || 0),
});

const insertItems = async (invoiceId: number, items: InvoiceItemInput[]) => {
  for (const item of items) {
    const quantity = Number(item.quantity || 1);
    const price = Number(item.unitPrice ?? item.price ?? 0);
    const subtotal = Number(item.total ?? item.subtotal ?? quantity * price);
    await pool.execute(
      'INSERT INTO invoice_items (invoice_id, product_id, item_name, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
      [invoiceId, item.productId || null, item.name, quantity, price, subtotal]
    );
  }
};

export const InvoiceModel = {
  async generateInvoiceNumber() {
    const year = new Date().getFullYear();
    if (usingMemoryStore) {
      return `PMT-${year}-${String(memoryStore.invoices.length + 1).padStart(4, '0')}`;
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) AS count FROM invoices WHERE YEAR(created_at) = ?',
      [year]
    );
    return `PMT-${year}-${String(Number(rows[0]?.count || 0) + 1).padStart(4, '0')}`;
  },

  async findByUser(userId: number) {
    if (usingMemoryStore) {
      return memoryStore.invoices.filter((invoice) => invoice.userId === userId);
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT i.*, c.name AS client_name, c.company_name, c.email AS client_email, c.phone AS client_phone, c.address AS client_address
       FROM invoices i
       INNER JOIN clients c ON c.id = i.client_id
       WHERE i.user_id = ?
       ORDER BY i.created_at DESC`,
      [userId]
    );
    return rows.map(mapInvoiceSummary);
  },

  async findOwnedById(id: string | number, userId: number) {
    if (usingMemoryStore) {
      return memoryStore.invoices.find((invoice) => invoice.id === Number(id) && invoice.userId === userId) || null;
    }

    const [invoiceRows] = await pool.execute<RowDataPacket[]>(
      `SELECT i.*, c.name AS client_name, c.company_name, c.email AS client_email, c.phone AS client_phone, c.address AS client_address
       FROM invoices i
       INNER JOIN clients c ON c.id = i.client_id
       WHERE i.id = ? AND i.user_id = ?
       LIMIT 1`,
      [id, userId]
    );

    if (!invoiceRows[0]) return null;

    const invoice = mapInvoiceSummary(invoiceRows[0]);
    const [itemRows] = await pool.execute<RowDataPacket[]>(
      `SELECT ii.*, p.name AS product_name
       FROM invoice_items ii
       LEFT JOIN products p ON p.id = ii.product_id
       WHERE ii.invoice_id = ?
       ORDER BY ii.id`,
      [id]
    );

    return { ...invoice, items: itemRows.map(mapItem) };
  },

  async create(userId: number, input: any) {
    if (usingMemoryStore) {
      const invoice = buildMemoryInvoice(userId, input);
      memoryStore.invoices.unshift(invoice);
      return invoice;
    }

    const items = input.items || [];
    const { subtotal, tax, discount, total } = calculateInvoiceTotals({ ...input, items });
    const invoiceNumber = input.invoiceNumber || await this.generateInvoiceNumber();

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO invoices
       (user_id, client_id, invoice_number, status, subtotal, tax, discount, total_amount, invoice_date, due_date, currency, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, input.clientId, invoiceNumber, input.status || 'Pending', subtotal, tax, discount, total, input.date, input.dueDate, input.currency || 'USD', input.notes || null]
    );

    await insertItems(result.insertId, items);
    return this.findOwnedById(result.insertId, userId);
  },

  async update(id: string | number, userId: number, input: any) {
    const existing = await this.findOwnedById(id, userId);
    if (!existing) return null;

    if (usingMemoryStore) {
      const index = memoryStore.invoices.findIndex((invoice) => invoice.id === Number(id) && invoice.userId === userId);
      const invoice = buildMemoryInvoice(userId, input, existing);
      if (index !== -1) memoryStore.invoices[index] = invoice;
      return invoice;
    }

    const items = input.items || existing.items || [];
    const { subtotal, tax, discount, total } = calculateInvoiceTotals({
      ...input,
      items,
      tax: input.tax ?? existing.tax,
      discount: input.discount ?? existing.discount,
    });

    await pool.execute(
      `UPDATE invoices
       SET client_id = ?, invoice_number = ?, status = ?, subtotal = ?, tax = ?, discount = ?, total_amount = ?, invoice_date = ?, due_date = ?, currency = ?, notes = ?
       WHERE id = ? AND user_id = ?`,
      [
        input.clientId || (typeof existing.clientId === 'object' ? existing.clientId._id : existing.clientId),
        input.invoiceNumber || existing.invoiceNumber,
        input.status || existing.status,
        subtotal,
        tax,
        discount,
        total,
        input.date || existing.date,
        input.dueDate || existing.dueDate,
        input.currency || existing.currency,
        input.notes || null,
        id,
        userId,
      ]
    );

    await pool.execute('DELETE FROM invoice_items WHERE invoice_id = ?', [id]);
    await insertItems(Number(id), items);
    return this.findOwnedById(id, userId);
  },

  async remove(id: string | number, userId: number) {
    if (usingMemoryStore) {
      const index = memoryStore.invoices.findIndex((invoice) => invoice.id === Number(id) && invoice.userId === userId);
      if (index === -1) return false;
      memoryStore.invoices.splice(index, 1);
      return true;
    }

    const [result] = await pool.execute<ResultSetHeader>('DELETE FROM invoices WHERE id = ? AND user_id = ?', [id, userId]);
    return result.affectedRows > 0;
  },
};
