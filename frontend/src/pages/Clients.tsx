import { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Button } from '../components/ui/components';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  companyInfo: string;
}

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/clients');
      setClients(data);
    } catch (error) {
      console.error('Failed to fetch clients', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this client?')) return;
    await api.delete(`/api/clients/${id}`);
    fetchClients();
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clients</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your clients and their contact information.</p>
        </div>
        <Button onClick={() => navigate('/clients/new')} className="flex items-center gap-2">
          <Plus size={18} /> Add Client
        </Button>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-dark-900/50 border-b border-gray-100 dark:border-dark-700 text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Company</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Phone</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Loading clients...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-50 dark:bg-dark-700 rounded-full flex items-center justify-center mb-4 text-gray-400">
                        <Users size={32} />
                      </div>
                      <p className="text-gray-900 dark:text-white font-medium mb-1">No clients found</p>
                      <p className="text-gray-500 dark:text-gray-400">Get started by adding your first client.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={client._id} 
                    className="hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{client.name}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{client.companyInfo || '-'}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{client.email || '-'}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{client.phone || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => navigate(`/clients/edit/${client._id}`)} className="text-gray-400 hover:text-primary-600 transition-colors p-1">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(client._id)} className="text-gray-400 hover:text-red-600 transition-colors p-1 ml-2">
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

export default Clients;
