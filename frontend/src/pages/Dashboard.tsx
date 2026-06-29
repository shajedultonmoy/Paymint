import { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, DollarSign, Clock, CheckCircle, Package } from 'lucide-react';
import api from '../api/axios';

const data = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 2000 },
  { name: 'Apr', revenue: 2780 },
  { name: 'May', revenue: 1890 },
  { name: 'Jun', revenue: 2390 },
  { name: 'Jul', revenue: 3490 },
];

const StatCard = ({ title, value, icon: Icon, trend }: { title: string, value: string, icon: any, trend?: string }) => (
  <div className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-dark-700">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
      </div>
      <div className="w-12 h-12 bg-primary-50 dark:bg-dark-700 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400">
        <Icon size={24} />
      </div>
    </div>
    {trend && (
      <div className="mt-4 text-sm">
        <span className="text-emerald-500 font-medium">{trend}</span>
        <span className="text-gray-500 dark:text-gray-400 ml-2">vs last month</span>
      </div>
    )}
  </div>
);

const Dashboard = () => {
  const [summary, setSummary] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    pendingAmount: 0,
    paidInvoices: 0,
    totalProducts: 0,
    recentInvoices: [] as Array<{
      id: number;
      invoiceNumber: string;
      clientName: string;
      total: number;
      status: string;
    }>,
    monthlyRevenue: [] as Array<{ name: string; revenue: number }>,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await api.get('/api/dashboard/summary');
        setSummary(data);
      } catch (error) {
        console.error('Failed to load dashboard summary', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const money = (value: number) => `$${Number(value || 0).toFixed(2)}`;

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Here's what's happening with your business today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Revenue" value={loading ? '...' : money(summary.totalRevenue)} icon={DollarSign} />
          <StatCard title="Invoices Sent" value={loading ? '...' : String(summary.totalInvoices)} icon={FileText} />
          <StatCard title="Pending Payment" value={loading ? '...' : money(summary.pendingAmount)} icon={Clock} />
          <StatCard title="Products" value={loading ? '...' : String(summary.totalProducts)} icon={Package} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-dark-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-dark-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Revenue Overview</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary.monthlyRevenue} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-dark-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
            <div className="space-y-6">
              {summary.recentInvoices.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No recent invoices yet.</p>
              ) : summary.recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{invoice.invoiceNumber}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{invoice.clientName} - {invoice.status}</p>
                  </div>
                  <div className="ml-auto text-sm font-bold text-gray-900 dark:text-white">
                    {money(invoice.total)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
