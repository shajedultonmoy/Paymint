import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Button, Input } from '../components/ui/components';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

interface InvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const InvoiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    clientId: '',
    invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [] as InvoiceItem[],
    tax: 0,
    discount: 0,
    notes: '',
    status: 'Draft',
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data } = await api.get('/api/clients');
        setClients(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchClients();

    if (isEdit) {
      const fetchInvoice = async () => {
        try {
          const { data } = await api.get(`/api/invoices/${id}`);
          setFormData({
            clientId: typeof data.clientId === 'object' ? data.clientId._id : data.clientId,
            invoiceNumber: data.invoiceNumber,
            date: new Date(data.date).toISOString().split('T')[0],
            dueDate: new Date(data.dueDate).toISOString().split('T')[0],
            items: data.items,
            tax: data.tax || 0,
            discount: data.discount || 0,
            notes: data.notes || '',
            status: data.status,
          });
        } catch (err) {
          setError('Failed to load invoice');
        }
      };
      fetchInvoice();
    } else {
      // Add one empty item by default
      setFormData(prev => ({
        ...prev,
        items: [{ name: '', quantity: 1, unitPrice: 0, total: 0 }]
      }));
    }
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...formData.items];
    (newItems[index] as any)[field] = value;
    
    // Auto calculate total
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', quantity: 1, unitPrice: 0, total: 0 }],
    });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
  const totalAmount = subtotal + Number(formData.tax) - Number(formData.discount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      ...formData,
      subtotal,
      total: totalAmount,
    };

    try {
      if (isEdit) {
        await api.put(`/api/invoices/${id}`, payload);
      } else {
        await api.post('/api/invoices', payload);
      }
      navigate('/invoices');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/invoices')}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Edit Invoice' : 'Create New Invoice'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Build your invoice and send it to your client.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Invoice Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col space-y-1.5 w-full">
              <label className="text-sm font-medium leading-none dark:text-gray-300">Client *</label>
              <select
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                required
                className="flex h-10 w-full rounded-md border border-gray-300 dark:border-dark-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white"
              >
                <option value="">Select a client</option>
                {clients.map(client => (
                  <option key={client._id} value={client._id}>{client.clientName} {client.companyName ? `(${client.companyName})` : ''}</option>
                ))}
              </select>
            </div>
            
            <Input
              label="Invoice Number *"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Date *"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
            <Input
              label="Due Date *"
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
            />
            <div className="flex flex-col space-y-1.5 w-full">
              <label className="text-sm font-medium leading-none dark:text-gray-300">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-gray-300 dark:border-dark-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white"
              >
                <option value="Draft">Draft</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Items</h3>
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="flex items-center gap-2">
              <Plus size={16} /> Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Description"
                    value={item.name}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    required
                  />
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                    required
                  />
                </div>
                <div className="w-32">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Price"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                    required
                  />
                </div>
                <div className="w-32 py-2 flex items-center justify-end font-medium dark:text-white">
                  ${item.total.toFixed(2)}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-2 mt-0.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t border-gray-100 dark:border-dark-700 pt-6 flex justify-end">
            <div className="w-full max-w-sm space-y-4">
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-500 dark:text-gray-400">Tax</span>
                <div className="w-32">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    name="tax"
                    value={formData.tax}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-500 dark:text-gray-400">Discount</span>
                <div className="w-32">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="flex justify-between border-t border-gray-100 dark:border-dark-700 pt-4 mt-4">
                <span className="font-bold text-gray-900 dark:text-white text-lg">Total</span>
                <span className="font-bold text-primary-600 dark:text-primary-400 text-xl">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Additional Notes</h3>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="flex w-full rounded-md border border-gray-300 dark:border-dark-700 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white"
            placeholder="Payment terms, thank you message, etc."
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => navigate('/invoices')}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex items-center gap-2">
            <Save size={18} /> {loading ? 'Saving...' : 'Save Invoice'}
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default InvoiceForm;
