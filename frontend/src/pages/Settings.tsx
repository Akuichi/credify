import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AccountSettings } from '../components/settings/AccountSettings';
import { SecuritySettings } from '../components/settings/SecuritySettings';
import { useAuth } from '../context/AuthContext';

type SettingsSection = 'account' | 'security';

interface SettingsMenuItem {
  id: SettingsSection;
  label: string;
  icon: React.ReactNode;
  description: string;
  badge?: boolean;
}

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems: SettingsMenuItem[] = [
    {
      id: 'account',
      label: 'Account Information',
      description: 'Manage your personal details',
      badge: !user?.email_verified_at,
      icon: (
        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: 'security',
      label: 'Security',
      description: 'Manage your security settings',
      badge: !user?.two_factor_enabled,
      icon: (
        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'account':
        return <AccountSettings />;
      case 'security':
        return <SecuritySettings />;
      default:
        return <AccountSettings />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account settings and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden flex items-center justify-between w-full px-4 py-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center space-x-3">
            {menuItems.find(item => item.id === activeSection)?.icon}
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {menuItems.find(item => item.id === activeSection)?.label}
            </span>
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Left Sidebar Navigation */}
        <AnimatePresence>
          {(isMobileMenuOpen || true) && (
            <motion.aside
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`lg:block ${isMobileMenuOpen ? 'block' : 'hidden'} lg:w-64 flex-shrink-0`}
            >
              <nav className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Settings Menu
                  </h2>
                </div>
                <ul className="p-2">
                  {menuItems.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setActiveSection(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`relative w-full flex items-start space-x-3 px-4 py-3 rounded-lg transition-all group ${
                          activeSection === item.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`mt-0.5 ${
                            activeSection === item.id
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                          }`}
                        >
                          {item.icon}
                        </span>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{item.label}</p>
                            {item.badge && (
                              <span 
                                className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full"
                                title="Action required: Enable 2FA"
                              >
                                !
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</p>
                        </div>
                        {activeSection === item.id && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute right-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-blue-400 rounded-l-full"
                          />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Right Content Pane */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Settings;
