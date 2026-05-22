import { RowDataPacket } from 'mysql2';
import { pool } from '../config/db';

export const DashboardModel = {
  async getSummary(userId: number) {
    const [totals] = await pool.execute<RowDataPacket[]>(
      `SELECT
        COUNT(*) AS total_invoices,
        COALESCE(SUM(CASE WHEN status = 'Paid' THEN total_amount ELSE 0 END), 0) AS total_revenue,
        COALESCE(SUM(CASE WHEN status IN ('Pending', 'Unpaid', 'Overdue') THEN total_amount ELSE 0 END), 0) AS pending_amount,
        COALESCE(SUM(CASE WHEN status = 'Paid' THEN 1 ELSE 0 END), 0) AS paid_invoices
       FROM invoices
       WHERE user_id = ?`,
      [userId]
    );

    const [recentInvoices] = await pool.execute<RowDataPacket[]>(
      `SELECT i.id, i.invoice_number, i.status, i.total_amount, i.invoice_date, c.name AS client_name
       FROM invoices i
       INNER JOIN clients c ON c.id = i.client_id
       WHERE i.user_id = ?
       ORDER BY i.created_at DESC
       LIMIT 5`,
      [userId]
    );

    const [products] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total_products, COALESCE(SUM(quantity), 0) AS total_stock
       FROM products
       WHERE user_id = ?`,
      [userId]
    );

    return {
      totalInvoices: Number(totals[0]?.total_invoices || 0),
      totalRevenue: Number(totals[0]?.total_revenue || 0),
      pendingAmount: Number(totals[0]?.pending_amount || 0),
      paidInvoices: Number(totals[0]?.paid_invoices || 0),
      totalProducts: Number(products[0]?.total_products || 0),
      totalStock: Number(products[0]?.total_stock || 0),
      recentInvoices: recentInvoices.map((invoice) => ({
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        status: invoice.status,
        total: Number(invoice.total_amount || 0),
        date: invoice.invoice_date,
        clientName: invoice.client_name,
      })),
    };
  },
};
