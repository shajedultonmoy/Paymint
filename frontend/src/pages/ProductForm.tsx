import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Button, Input } from '../components/ui/components';
import { useNavigate, useParams } from 'react-router-dom';
import api, { API_BASE_URL } from '../api/axios';
import { ArrowLeft, Save, UploadCloud } from 'lucide-react';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    sku: '',
    price: 0,
    quantity: 0,
    image: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          const { data } = await api.get(`/api/products/${id}`);
          setFormData({
            productName: data.productName,
            description: data.description || '',
            sku: data.sku || '',
            price: data.price || 0,
            quantity: data.quantity || 0,
            image: data.image || '',
          });
        } catch (err) {
          setError('Failed to load product');
        }
      };
      fetchProduct();
    }
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('image', file);
    setUploading(true);

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await api.post('/api/upload', formDataUpload, config);
      setFormData({ ...formData, image: data });
    } catch (err) {
      setError('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        await api.put(`/api/products/${id}`, formData);
      } else {
        await api.post('/api/products', formData);
      }
      navigate('/products');
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
            onClick={() => navigate('/products')}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Enter product or service details below.
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
            label="Product Name *"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            placeholder="Consulting Session"
            required
          />
          
          <div className="flex flex-col space-y-1.5 w-full">
            <label className="text-sm font-medium leading-none dark:text-gray-300">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="flex w-full rounded-md border border-gray-300 dark:border-dark-700 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white"
              placeholder="Detailed description of the product or service"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="SKU"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="PRD-001"
            />
            <Input
              label="Price *"
              type="number"
              step="0.01"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
            <Input
              label="Stock Quantity *"
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium leading-none dark:text-gray-300 mb-2 block">Product Image</label>
            <div className="flex items-center gap-4">
              {formData.image && (
                <img src={`${API_BASE_URL}${formData.image}`} alt="Product" className="w-16 h-16 object-cover rounded-lg" />
              )}
              <label className="cursor-pointer border-2 border-dashed border-gray-300 dark:border-dark-700 hover:border-primary-500 dark:hover:border-primary-500 rounded-lg p-4 flex flex-col items-center justify-center transition-colors">
                <UploadCloud size={24} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-500 font-medium">
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </span>
                <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" disabled={uploading} />
              </label>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-dark-700 flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => navigate('/products')}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || uploading} className="flex items-center gap-2">
            <Save size={18} /> {loading ? 'Saving...' : 'Save Product'}
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default ProductForm;
