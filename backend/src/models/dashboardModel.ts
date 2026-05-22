import { RowDataPacket } from 'mysql2';
import { pool, usingMemoryStore } from '../config/db';
import { memoryStore } from '../config/memoryStore';

export const DashboardModel = {
  async getSummary(userId: number) {
    if (usingMemoryStore) {
      const invoices = memoryStore.invoices.filter((invoice) => invoice.userId === userId);
      const products = memoryStore.products.filter((product) => product.userId === userId);

      return {
        totalInvoices: invoices.length,
        totalRevenue: invoices
          .filter((invoice) => invoice.status === 'Paid')
          .reduce((sum, invoice) => sum + Number(invoice.total || 0), 0),
        pendingAmount: invoices
          .filter((invoice) => ['Pending', 'Unpaid', 'Overdue'].includes(invoice.status))
          .reduce((sum, invoice) => sum + Number(invoice.total || 0), 0),
        paidInvoices: invoices.filter((invoice) => invoice.status === 'Paid').length,
        totalProducts: products.length,
        totalStock: products.reduce((sum, product) => sum + Number(product.quantity || 0), 0),
        recentInvoices: invoices.slice(0, 5).map((invoice) => ({
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          status: invoice.status,
          total: Number(invoice.total || 0),
          date: invoice.date,
          clientName: invoice.clientId?.clientName || invoice.clientId?.name || 'Client',
        })),
      };
    }

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
