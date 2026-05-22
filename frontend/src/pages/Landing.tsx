import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, ArrowRight, Zap, Shield, Globe } from 'lucide-react';
import { Button } from '../components/ui/components';

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <div className="p-6 bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-700">
    <div className="w-12 h-12 bg-primary-50 dark:bg-dark-700 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
    <p className="text-gray-500 dark:text-gray-400">{description}</p>
  </div>
);

const Landing = () => {
  return (
    <div className="min-h-screen bg-light-50 dark:bg-dark-900 selection:bg-primary-500 selection:text-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white">
            <Wallet size={24} />
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">Paymint</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            Log in
          </Link>
          <Link to="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 lg:py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8">
            Create. Send. <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-emerald-400">Get Paid.</span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
            The advanced invoice generator and billing management platform designed for modern freelancers, agencies, and fast-growing startups.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto flex items-center gap-2">
                Start for free <ArrowRight size={20} />
              </Button>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 sm:mt-0 sm:ml-4">
              No credit card required
            </p>
          </div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-20 mx-auto max-w-5xl rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800"
        >
          <div className="h-8 bg-gray-100 dark:bg-dark-900 flex items-center px-4 gap-2 border-b border-gray-200 dark:border-dark-700">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="aspect-[16/9] bg-gray-50 dark:bg-dark-900 p-8 flex flex-col gap-6">
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700 p-6 flex flex-col justify-between">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-dark-700 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-100 dark:bg-dark-700 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-200 dark:bg-dark-600 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex-1 bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700"></div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 dark:bg-dark-800/50 py-24 border-y border-gray-200 dark:border-dark-800">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Everything you need to manage billing</h2>
            <p className="text-gray-500 dark:text-gray-400">Paymint comes with all the tools required to track clients, manage products, and get paid faster.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard 
              icon={Zap} 
              title="Lightning Fast" 
              description="Create and send professional invoices in seconds. Save templates and reuse products to save time."
            />
            <FeatureCard 
              icon={Shield} 
              title="Secure Platform" 
              description="Enterprise-grade security for your data. Your clients, products, and invoices are safely stored."
            />
            <FeatureCard 
              icon={Globe} 
              title="Access Anywhere" 
              description="Cloud-based platform lets you manage your business from any device, anywhere in the world."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 text-center text-gray-500 dark:text-gray-400">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Wallet size={20} className="text-primary-500" />
          <span className="text-lg font-bold text-gray-900 dark:text-white">Paymint</span>
        </div>
        <p>&copy; {new Date().getFullYear()} Paymint. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
