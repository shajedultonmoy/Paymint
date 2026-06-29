import asyncHandler from 'express-async-handler';
import { Response } from 'express';
import { InvoiceModel } from '../models/invoiceModel';
import { AuthRequest } from '../middleware/authMiddleware';
import generatePDF from '../utils/generatePDF';
import sendEmail from '../utils/sendEmail';

export const getInvoices = asyncHandler(async (req: AuthRequest, res: Response) => {
  const invoices = await InvoiceModel.findByUser(req.user!.id);
  res.json(invoices);
});

export const createInvoice = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.body.clientId) {
    res.status(400);
    throw new Error('Client is required');
  }

  if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
    res.status(400);
    throw new Error('At least one invoice item is required');
  }

  const invoice = await InvoiceModel.create(req.user!.id, req.body);
  res.status(201).json(invoice);
});

export const getInvoiceById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const invoice = await InvoiceModel.findOwnedById(String(req.params.id), req.user!.id);
  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found or not authorized');
  }

  res.json(invoice);
});

export const updateInvoice = asyncHandler(async (req: AuthRequest, res: Response) => {
  const invoice = await InvoiceModel.update(String(req.params.id), req.user!.id, req.body);
  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found or not authorized');
  }

  res.json(invoice);
});

export const deleteInvoice = asyncHandler(async (req: AuthRequest, res: Response) => {
  const removed = await InvoiceModel.remove(String(req.params.id), req.user!.id);
  if (!removed) {
    res.status(404);
    throw new Error('Invoice not found or not authorized');
  }

  res.json({ message: 'Invoice removed' });
});

export const downloadInvoicePdf = asyncHandler(async (req: AuthRequest, res: Response) => {
  const invoice = await InvoiceModel.findOwnedById(String(req.params.id), req.user!.id);
  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found or not authorized');
  }

  const client: any = invoice.clientId;
  const user: any = req.user;

  const rows = invoice.items.map((item: any) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>$${Number(item.unitPrice).toFixed(2)}</td>
      <td>$${Number(item.total).toFixed(2)}</td>
    </tr>
  `).join('');

  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #172033; padding: 40px; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #dbe5f1; padding-bottom: 20px; }
          h1 { margin: 0; color: #2563eb; font-size: 36px; }
          .right { text-align: right; }
          .details { margin-top: 36px; }
          table { width: 100%; border-collapse: collapse; margin-top: 32px; }
          th { background: #f8fafc; text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; }
          td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
          .totals { margin-top: 22px; margin-left: auto; width: 260px; }
          .totals div { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .grand-total { font-size: 20px; font-weight: bold; color: #2563eb; border-top: 2px solid #e2e8f0; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>PAYMINT</h1>
            <p><strong>${user?.businessName || user?.name || 'Your Company'}</strong></p>
            <p>${user?.email || ''}</p>
          </div>
          <div class="right">
            <h2>Invoice ${invoice.invoiceNumber}</h2>
            <p>Date: ${new Date(invoice.date).toLocaleDateString()}</p>
            <p>Due: ${new Date(invoice.dueDate).toLocaleDateString()}</p>
            <p>Status: ${invoice.status}</p>
          </div>
        </div>
        <div class="details">
          <h3>Bill To</h3>
          <p><strong>${client?.companyName || client?.clientName || client?.name}</strong></p>
          <p>${client?.email || ''}</p>
          <p>${client?.address || ''}</p>
        </div>
        <table>
          <thead>
            <tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="totals">
          <div><span>Subtotal</span><strong>$${invoice.subtotal.toFixed(2)}</strong></div>
          <div><span>Tax</span><strong>$${invoice.tax.toFixed(2)}</strong></div>
          <div><span>Discount</span><strong>-$${invoice.discount.toFixed(2)}</strong></div>
          <div class="grand-total"><span>Total</span><span>$${invoice.total.toFixed(2)}</span></div>
        </div>
      </body>
    </html>
  `;

  const pdfBuffer = await generatePDF(htmlContent);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
  res.send(pdfBuffer);
});

export const sendInvoiceEmail = asyncHandler(async (req: AuthRequest, res: Response) => {
  const invoice = await InvoiceModel.findOwnedById(String(req.params.id), req.user!.id);
  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found or not authorized');
  }

  const client: any = invoice.clientId;
  if (!client || (!client.email && !client.clientEmail)) {
    res.status(400);
    throw new Error('Client email is required to send invoice');
  }

  const clientEmail = client.email || client.clientEmail;
  const user: any = req.user;

  const rows = invoice.items.map((item: any) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>$${Number(item.unitPrice || item.price).toFixed(2)}</td>
      <td>$${Number(item.subtotal || item.total).toFixed(2)}</td>
    </tr>
  `).join('');

  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #172033; padding: 40px; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #dbe5f1; padding-bottom: 20px; }
          h1 { margin: 0; color: #2563eb; font-size: 36px; }
          .right { text-align: right; }
          .details { margin-top: 36px; }
          table { width: 100%; border-collapse: collapse; margin-top: 32px; }
          th { background: #f8fafc; text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; }
          td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
          .totals { margin-top: 22px; margin-left: auto; width: 260px; }
          .totals div { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .grand-total { font-size: 20px; font-weight: bold; color: #2563eb; border-top: 2px solid #e2e8f0; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>PAYMINT</h1>
            <p><strong>${user?.businessName || user?.name || 'Your Company'}</strong></p>
            <p>${user?.email || ''}</p>
          </div>
          <div class="right">
            <h2>Invoice ${invoice.invoiceNumber}</h2>
            <p>Date: ${new Date(invoice.date).toLocaleDateString()}</p>
            <p>Due: ${new Date(invoice.dueDate).toLocaleDateString()}</p>
            <p>Status: ${invoice.status}</p>
          </div>
        </div>
        <div class="details">
          <h3>Bill To</h3>
          <p><strong>${client?.companyName || client?.clientName || client?.name || 'Client'}</strong></p>
          <p>${clientEmail}</p>
          <p>${client?.address || ''}</p>
        </div>
        <table>
          <thead>
            <tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="totals">
          <div><span>Subtotal</span><strong>$${invoice.subtotal.toFixed(2)}</strong></div>
          <div><span>Tax</span><strong>$${invoice.tax.toFixed(2)}</strong></div>
          <div><span>Discount</span><strong>-$${invoice.discount.toFixed(2)}</strong></div>
          <div class="grand-total"><span>Total</span><span>$${invoice.total.toFixed(2)}</span></div>
        </div>
      </body>
    </html>
  `;

  const pdfBuffer = await generatePDF(htmlContent);
  const message = `Hello ${client.clientName || client.name || 'Customer'},\n\nPlease find attached invoice ${invoice.invoiceNumber} for your review.\n\nBest regards,\n${user?.name || 'Paymint User'}`;

  await sendEmail({
    email: clientEmail,
    subject: `Invoice ${invoice.invoiceNumber} from ${user?.businessName || user?.name || 'Paymint'}`,
    message,
    attachments: [
      {
        filename: `invoice-${invoice.invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });

  res.json({ message: 'Invoice sent successfully' });
});
