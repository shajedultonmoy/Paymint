import type { InvoiceItemInput } from '../models/invoiceModel';

export const calculateInvoiceTotals = (input: {
  items: InvoiceItemInput[];
  subtotal?: number;
  tax?: number;
  discount?: number;
  total?: number;
}) => {
  const subtotal = Number(
    input.subtotal ?? input.items.reduce((sum, item) => {
      const quantity = Number(item.quantity || 1);
      const price = Number(item.unitPrice ?? item.price ?? 0);
      return sum + Number(item.total ?? item.subtotal ?? quantity * price);
    }, 0)
  );
  const tax = Number(input.tax || 0);
  const discount = Number(input.discount || 0);
  const total = Number(input.total ?? subtotal + tax - discount);

  return { subtotal, tax, discount, total };
};
