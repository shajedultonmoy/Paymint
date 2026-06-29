import { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Button } from '../components/ui/components';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, FileText, Download, Send } from 'lucide-react';
import api from '../api/axios';
import { motion } from 'framer-motion';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  clientId: { clientName: string };
  date: string;
  dueDate: string;
  total: number;
  status: string;
}

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/invoices');
      setInvoices(data);
    } catch (error) {
      console.error('Failed to fetch invoices', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'Pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Overdue': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await api.delete(`/api/invoices/${id}`);
        fetchInvoices();
      } catch (error) {
        console.error('Failed to delete invoice', error);
      }
    }
  };

  const handleDownloadPdf = async (id: string, invoiceNumber: string) => {
    try {
      const response = await api.get(`/api/invoices/${id}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download PDF', error);
    }
  };

  const handleSendEmail = async (id: string, invoiceNumber: string) => {
    if (window.confirm(`Are you sure you want to send invoice ${invoiceNumber} to the client's email?`)) {
      setSendingId(id);
      try {
        const { data } = await api.post(`/api/invoices/${id}/send`);
        alert(data.message || 'Invoice sent successfully!');
      } catch (error: any) {
        console.error('Failed to send email', error);
        alert(error.response?.data?.message || 'Failed to send email.');
      } finally {
        setSendingId(null);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage, create, and send invoices to your clients.</p>
        </div>
        <Button 
          onClick={() => navigate('/invoices/new')}
          className="flex items-center gap-2"
        >
          <Plus size={18} /> Create Invoice
        </Button>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-dark-900/50 border-b border-gray-100 dark:border-dark-700 text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">Invoice Number</th>
                <th className="px-6 py-4 font-medium">Client</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Loading invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-50 dark:bg-dark-700 rounded-full flex items-center justify-center mb-4 text-gray-400">
                        <FileText size={32} />
                      </div>
                      <p className="text-gray-900 dark:text-white font-medium mb-1">No invoices found</p>
                      <p className="text-gray-500 dark:text-gray-400">Get started by creating your first invoice.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={invoice._id} 
                    className="hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{invoice.invoiceNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{invoice.clientId?.clientName || '-'}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{new Date(invoice.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">${invoice.total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleDownloadPdf(invoice._id, invoice.invoiceNumber)}
                        className="text-gray-400 hover:text-primary-600 transition-colors p-1" 
                        title="Download PDF"
                      >
                        <Download size={16} />
                      </button>
                      <button 
                        onClick={() => handleSendEmail(invoice._id, invoice.invoiceNumber)}
                        className={`text-gray-400 hover:text-primary-600 transition-colors p-1 ${sendingId === invoice._id ? 'animate-pulse text-primary-500' : ''}`}
                        title={sendingId === invoice._id ? 'Sending...' : 'Send Email'}
                        disabled={sendingId !== null}
                      >
                        <Send size={16} />
                      </button>
                      <button 
                        onClick={() => navigate(`/invoices/edit/${invoice._id}`)}
                        className="text-gray-400 hover:text-primary-600 transition-colors p-1" 
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(invoice._id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1 ml-2" 
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Invoices;
