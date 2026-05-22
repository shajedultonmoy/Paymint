import { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Button } from '../components/ui/components';
import { Plus, Edit, Trash2, Box } from 'lucide-react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Product {
  _id: string;
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/products');
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/api/products/${id}`);
    fetchProducts();
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your products and services catalog.</p>
        </div>
        <Button onClick={() => navigate('/products/new')} className="flex items-center gap-2">
          <Plus size={18} /> Add Product
        </Button>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-dark-900/50 border-b border-gray-100 dark:border-dark-700 text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">SKU</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-50 dark:bg-dark-700 rounded-full flex items-center justify-center mb-4 text-gray-400">
                        <Box size={32} />
                      </div>
                      <p className="text-gray-900 dark:text-white font-medium mb-1">No products found</p>
                      <p className="text-gray-500 dark:text-gray-400">Get started by adding your first product.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={product._id} 
                    className="hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{product.sku || '-'}</td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{product.stockQuantity}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => navigate(`/products/edit/${product._id}`)} className="text-gray-400 hover:text-primary-600 transition-colors p-1">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(product._id)} className="text-gray-400 hover:text-red-600 transition-colors p-1 ml-2">
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

export default Products;
