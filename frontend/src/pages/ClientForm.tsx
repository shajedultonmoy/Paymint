import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Button, Input } from '../components/ui/components';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Save } from 'lucide-react';

const ClientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    clientName: '',
    companyName: '',
    email: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      const fetchClient = async () => {
        try {
          const { data } = await api.get(`/api/clients/${id}`);
          setFormData({
            clientName: data.clientName,
            companyName: data.companyName || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
          });
        } catch (err) {
          setError('Failed to load client');
        }
      };
      fetchClient();
    }
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        await api.put(`/api/clients/${id}`, formData);
      } else {
        await api.post('/api/clients', formData);
      }
      navigate('/clients');
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
            onClick={() => navigate('/clients')}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Edit Client' : 'Add New Client'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Enter client details below.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700 p-6 max-w-2xl">
        <div className="space-y-6">
          <Input
            label="Client Name *"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            placeholder="Jane Doe"
            required
          />
          <Input
            label="Company Name"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="Acme Corp"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="jane@acme.com"
            />
            <Input
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <Input
            label="Billing Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="123 Main St, City, Country"
          />
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-dark-700 flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => navigate('/clients')}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex items-center gap-2">
            <Save size={18} /> {loading ? 'Saving...' : 'Save Client'}
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default ClientForm;
