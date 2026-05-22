import { DEMO_EMAIL, DEMO_PASSWORD_HASH } from './demoUser';
import { calculateInvoiceTotals } from '../services/invoiceService';

const now = () => new Date();

let nextUserId = 2;
let nextClientId = 3;
let nextProductId = 3;
let nextInvoiceId = 1;

export const memoryStore = {
  users: [
    {
      _id: 1,
      id: 1,
      name: 'Demo User',
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD_HASH,
      avatar: '',
      businessName: 'Paymint Studio',
      phone: '+1 555 0101',
      role: 'user' as const,
      createdAt: now(),
    },
  ],
  clients: [
    {
      _id: 1,
      id: 1,
      userId: 1,
      clientName: 'Nora Wilson',
      name: 'Nora Wilson',
      companyName: 'Northstar Labs',
      companyInfo: 'Northstar Labs',
      email: 'nora@northstar.test',
      phone: '+1 555 0134',
      address: '201 Market Street, Austin, TX',
      createdAt: now(),
    },
    {
      _id: 2,
      id: 2,
      userId: 1,
      clientName: 'Ari Khan',
      name: 'Ari Khan',
      companyName: 'Blue Harbor Co.',
      companyInfo: 'Blue Harbor Co.',
      email: 'ari@blueharbor.test',
      phone: '+1 555 0177',
      address: '88 Lake Road, Seattle, WA',
      createdAt: now(),
    },
  ],
  products: [
    {
      _id: 1,
      id: 1,
      userId: 1,
      productName: 'Product Strategy Session',
      name: 'Product Strategy Session',
      description: 'One-hour billing strategy consultation.',
      sku: 'PMT-SVC-001',
      price: 250,
      quantity: 100,
      stockQuantity: 100,
      image: '',
      createdAt: now(),
    },
    {
      _id: 2,
      id: 2,
      userId: 1,
      productName: 'Invoice Automation Setup',
      name: 'Invoice Automation Setup',
      description: 'Workflow setup for recurring invoice operations.',
      sku: 'PMT-SVC-002',
      price: 900,
      quantity: 25,
      stockQuantity: 25,
      image: '',
      createdAt: now(),
    },
  ],
  invoices: [] as any[],
};

export const memoryIds = {
  user: () => nextUserId++,
  client: () => nextClientId++,
  product: () => nextProductId++,
  invoice: () => nextInvoiceId++,
};

export const buildMemoryInvoice = (userId: number, input: any, existing?: any) => {
  const items = input.items || existing?.items || [];
  const totals = calculateInvoiceTotals({
    ...input,
    items,
    tax: input.tax ?? existing?.tax ?? 0,
    discount: input.discount ?? existing?.discount ?? 0,
  });
  const id = existing?.id || memoryIds.invoice();
  const client = memoryStore.clients.find((item) => item.id === Number(input.clientId || existing?.clientId?.id));

  return {
    _id: id,
    id,
    userId,
    clientId: client || input.clientId || existing?.clientId,
    invoiceNumber: input.invoiceNumber || existing?.invoiceNumber || `PMT-${new Date().getFullYear()}-${String(id).padStart(4, '0')}`,
    date: input.date || existing?.date || new Date().toISOString().slice(0, 10),
    dueDate: input.dueDate || existing?.dueDate || new Date().toISOString().slice(0, 10),
    subtotal: totals.subtotal,
    tax: totals.tax,
    discount: totals.discount,
    total: totals.total,
    totalAmount: totals.total,
    status: input.status || existing?.status || 'Pending',
    currency: input.currency || existing?.currency || 'USD',
    notes: input.notes || existing?.notes || '',
    items: items.map((item: any, index: number) => {
      const quantity = Number(item.quantity || 1);
      const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
      return {
        _id: item._id || index + 1,
        id: item.id || index + 1,
        productId: item.productId || null,
        name: item.name || 'Custom item',
        quantity,
        unitPrice,
        price: unitPrice,
        total: Number(item.total ?? item.subtotal ?? quantity * unitPrice),
        subtotal: Number(item.total ?? item.subtotal ?? quantity * unitPrice),
      };
    }),
    createdAt: existing?.createdAt || now(),
  };
};

