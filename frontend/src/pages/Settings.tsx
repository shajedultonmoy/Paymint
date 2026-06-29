import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { Button, Input } from '../components/ui/components';
import api, { API_BASE_URL } from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Settings as SettingsIcon, UploadCloud, Check } from 'lucide-react';

const Settings = () => {
  const { isDark, toggleTheme } = useThemeStore();
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'appearance'>('profile');

  // Form states
  const [profileData, setProfileData] = useState({
    name: '',
    businessName: '',
    phone: '',
    avatar: '',
  });
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        businessName: user.businessName || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('image', file);
    setUploading(true);
    setError('');

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await api.post('/api/upload', formDataUpload, config);
      setProfileData({ ...profileData, avatar: data });
      setMessage('Avatar uploaded successfully!');
    } catch (err) {
      setError('Avatar upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { data } = await api.put('/api/auth/profile', profileData);
      setUser({ ...user, ...data });
      setMessage('Profile updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (passwordData.password !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.put('/api/auth/profile', { password: passwordData.password });
      setUser({ ...user, ...data });
      setPasswordData({ password: '', confirmPassword: '' });
      setMessage('Password updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile Settings', icon: User },
    { id: 'security' as const, label: 'Security', icon: Lock },
    { id: 'appearance' as const, label: 'Preferences', icon: SettingsIcon },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account, business, and preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Tabs sidebar */}
        <div className="w-full lg:w-64 bg-white dark:bg-dark-800 rounded-xl p-2 shadow-sm border border-gray-100 dark:border-dark-700 flex flex-row lg:flex-col gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setError('');
                  setMessage('');
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap lg:w-full ${
                  active
                    ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-dark-700/50'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content panel */}
        <div className="flex-1 w-full bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700 p-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mb-6">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl text-sm mb-6 flex items-center gap-2">
              <Check size={18} />
              {message}
            </div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Profile Settings</h3>
                <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-xl">
                  <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100 dark:border-dark-700">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-50 dark:bg-dark-700 border border-gray-100 dark:border-dark-600">
                      {profileData.avatar ? (
                        <img
                          src={`${API_BASE_URL}${profileData.avatar}`}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-2xl">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col items-center sm:items-start">
                      <label className="cursor-pointer bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/40 dark:hover:bg-primary-950/60 text-primary-600 dark:text-primary-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-primary-200 dark:border-primary-900 flex items-center gap-2">
                        <UploadCloud size={16} />
                        {uploading ? 'Uploading...' : 'Upload Avatar'}
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileUpload}
                          accept="image/*"
                          disabled={uploading}
                        />
                      </label>
                      <span className="text-xs text-gray-400 mt-2 text-center sm:text-left">
                        JPG, JPEG or PNG. Max size of 2MB.
                      </span>
                    </div>
                  </div>

                  <Input
                    label="Full Name *"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    placeholder="John Doe"
                    required
                  />

                  <Input
                    label="Business / Company Name"
                    name="businessName"
                    value={profileData.businessName}
                    onChange={handleProfileChange}
                    placeholder="Acme Corp"
                  />

                  <Input
                    label="Phone Number"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    placeholder="+1 (555) 000-0000"
                  />

                  <Input
                    label="Email address"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    placeholder="email@example.com"
                  />

                  <div className="pt-4">
                    <Button type="submit" disabled={loading || uploading}>
                      {loading ? 'Saving changes...' : 'Save Settings'}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Security Settings</h3>
                <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-xl">
                  <Input
                    label="New Password"
                    type="password"
                    name="password"
                    value={passwordData.password}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    required
                  />

                  <Input
                    label="Confirm New Password"
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    required
                  />

                  <div className="pt-4">
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Updating password...' : 'Update Password'}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'appearance' && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Preferences</h3>
                <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-dark-700 max-w-xl">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Dark Theme</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark visual themes</p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isDark ? 'bg-primary-500' : 'bg-gray-200 dark:bg-dark-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isDark ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
