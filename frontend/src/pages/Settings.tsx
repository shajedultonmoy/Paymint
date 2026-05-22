import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useThemeStore } from '../store/themeStore';

const Settings = () => {
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account preferences.</p>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700 p-6 max-w-2xl">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Appearance</h3>
        <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-dark-700">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Theme</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark mode</p>
          </div>
          <button
            onClick={toggleTheme}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-primary-600 transition-colors"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isDark ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
