import { RowDataPacket } from 'mysql2';
import { pool, usingMemoryStore } from '../config/db';
import { memoryStore } from '../config/memoryStore';

const getLast6Months = () => {
  const months = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push({
      name: monthNames[d.getMonth()],
      monthIndex: d.getMonth(),
      year: d.getFullYear(),
      revenue: 0
    });
  }
  return months;
};

export const DashboardModel = {
  async getSummary(userId: number) {
    if (usingMemoryStore) {
      const invoices = memoryStore.invoices.filter((invoice) => invoice.userId === userId);
      const products = memoryStore.products.filter((product) => product.userId === userId);

      const monthlyRevenue = getLast6Months();
      invoices
        .filter((invoice) => invoice.status === 'Paid')
        .forEach((invoice) => {
          const invDate = new Date(invoice.date);
          const monthIndex = invDate.getMonth();
          const year = invDate.getFullYear();
          const bucket = monthlyRevenue.find(
            (b) => b.monthIndex === monthIndex && b.year === year
          );
          if (bucket) {
            bucket.revenue += Number(invoice.total || 0);
          }
        });

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
        monthlyRevenue: monthlyRevenue.map((m) => ({ name: m.name, revenue: m.revenue })),
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

    const [revenueRows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        DATE_FORMAT(invoice_date, '%b') as name,
        MONTH(invoice_date) as month_index,
        YEAR(invoice_date) as year,
        COALESCE(SUM(total_amount), 0) as revenue
       FROM invoices
       WHERE user_id = ? AND status = 'Paid'
       GROUP BY YEAR(invoice_date), MONTH(invoice_date), DATE_FORMAT(invoice_date, '%b')`,
      [userId]
    );

    const monthlyRevenue = getLast6Months();
    monthlyRevenue.forEach((bucket) => {
      const row = revenueRows.find(
        (r) => Number(r.month_index) - 1 === bucket.monthIndex && Number(r.year) === bucket.year
      );
      if (row) {
        bucket.revenue = Number(row.revenue || 0);
      }
    });

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
      monthlyRevenue: monthlyRevenue.map((m) => ({ name: m.name, revenue: m.revenue })),
    };
  },
};
