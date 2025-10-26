import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

interface NavItem {
  label: string;
  path?: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeColor?: 'red' | 'blue' | 'green';
  tooltip?: string;
  onClick?: () => void;
}

interface NavSection {
  title?: string;
  items: NavItem[];
  collapsible?: boolean;
}

interface SidebarProps {
  onProfileClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onProfileClick }) => {
  // Start collapsed on mobile, open on desktop
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return window.innerWidth < 1024; // lg breakpoint
  });
  const [isCompactMode, setIsCompactMode] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [activeSessions, setActiveSessions] = useState(0);
  const [hasNewActivity, setHasNewActivity] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  // Fetch active sessions count
  useEffect(() => {
    const fetchSessionsCount = async () => {
      try {
        const response = await api.get('/api/auth/sessions');
        setActiveSessions(response.data.sessions?.length || 0);
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
      }
    };

    if (user) {
      fetchSessionsCount();
      // Refresh every 30 seconds
      const interval = setInterval(fetchSessionsCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Handle window resize - open sidebar on desktop, close on mobile
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 1024;
      if (!isMobile && isCollapsed) {
        // If transitioning to desktop and sidebar is collapsed, open it
        setIsCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isCollapsed]);

  // Listen for toggle event from navbar
  useEffect(() => {
    const handleToggleSidebar = () => {
      setIsCollapsed(false);
    };

    window.addEventListener('toggleSidebar', handleToggleSidebar);
    return () => window.removeEventListener('toggleSidebar', handleToggleSidebar);
  }, []);

  // Check for new activity (simplified - you can enhance this)
  useEffect(() => {
    // This would check if there's activity since last visit
    const lastVisit = localStorage.getItem('lastActivityCheck');
    const now = new Date().toISOString();
    
    if (lastVisit) {
      const lastVisitTime = new Date(lastVisit).getTime();
      const nowTime = new Date(now).getTime();
      const hoursSinceLastVisit = (nowTime - lastVisitTime) / (1000 * 60 * 60);
      
      // Show indicator if more than 1 hour since last check
      setHasNewActivity(hoursSinceLastVisit > 1);
    }
  }, []);

  const handleActivityClick = () => {
    // Mark activity as checked
    localStorage.setItem('lastActivityCheck', new Date().toISOString());
    setHasNewActivity(false);
  };

  const toggleSection = (title: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(title)) {
      newCollapsed.delete(title);
    } else {
      newCollapsed.add(title);
    }
    setCollapsedSections(newCollapsed);
  };

  const navSections: NavSection[] = [
    {
      items: [
        {
          label: 'Dashboard',
          path: '/dashboard',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          ),
        },
      ],
    },
    {
      title: 'Settings',
      collapsible: true,
      items: [
        {
          label: 'Account & Security',
          path: '/settings',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
          badge: (!user?.email_verified_at || !user?.two_factor_enabled) ? '!' : undefined,
          badgeColor: 'red',
          tooltip: (!user?.email_verified_at || !user?.two_factor_enabled) 
            ? `Action required: ${!user?.two_factor_enabled ? 'Enable 2FA' : ''}${!user?.email_verified_at && !user?.two_factor_enabled ? ' & ' : ''}${!user?.email_verified_at ? 'Verify email' : ''}`
            : undefined,
        },
      ],
    },
  ];

  const handleNavClick = (path: string) => {
    // Auto-close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      setIsCollapsed(true);
    }
    
    if (path.includes('#')) {
      const [route, hash] = path.split('#');
      if (location.pathname === route) {
        // Same page, just scroll to section
        const element = document.getElementById(hash);
        element?.scrollIntoView({ behavior: 'smooth' });
      }
      
      // Mark activity as checked if clicking on activity
      if (hash === 'activity') {
        handleActivityClick();
      }
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCollapsed(true)}
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? '0px' : (isCompactMode ? '80px' : '280px'),
        }}
        className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 lg:sticky lg:top-[65px] lg:h-[calc(100vh-65px)] lg:z-40 overflow-hidden transition-all duration-300 ${
          isCollapsed ? 'lg:w-0' : (isCompactMode ? 'lg:w-[80px]' : 'lg:w-[280px]')
        }`}
      >
        <div className={`flex flex-col h-full ${isCompactMode ? 'w-[80px]' : 'w-[280px]'}`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            {!isCompactMode && <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Navigation</h2>}
            <button
              onClick={() => setIsCollapsed(true)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Info */}
          {!isCompactMode && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">
                    {user?.full_name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {user?.full_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {isCompactMode && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user?.full_name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-4">
            {navSections.map((section, sectionIndex) => {
              const isSectionCollapsed = section.title && collapsedSections.has(section.title);
              
              return (
                <div key={sectionIndex}>
                  {section.title && !isCompactMode && (
                    <button
                      onClick={() => section.collapsible && section.title && toggleSection(section.title)}
                      className={`w-full flex items-center justify-between px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                        section.collapsible ? 'hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer' : ''
                      }`}
                    >
                      <span>{section.title}</span>
                      {section.collapsible && (
                        <svg
                          className={`w-4 h-4 transition-transform ${isSectionCollapsed ? '-rotate-90' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>
                  )}
                  <AnimatePresence>
                    {!isSectionCollapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-1 overflow-hidden"
                      >
                        {section.items.map((item) => {
                          const isActive = item.path ? (location.pathname === item.path || 
                                          (item.path.includes('#') && location.pathname === item.path.split('#')[0])) : false;
                          
                          const content = (
                            <>
                              {isCompactMode ? (
                                <div className="relative">
                                  <span className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'}>
                                    {item.icon}
                                  </span>
                                  {item.badge && (
                                    <span className={`absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 text-xs font-bold text-white rounded-full ${
                                      item.badgeColor === 'red' ? 'bg-red-500' :
                                      item.badgeColor === 'blue' ? 'bg-blue-500' :
                                      item.badgeColor === 'green' ? 'bg-green-500' : 'bg-red-500'
                                    }`}>
                                      {typeof item.badge === 'number' ? item.badge : ''}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center space-x-3">
                                    <span className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'}>
                                      {item.icon}
                                    </span>
                                    <span className="text-sm font-medium">{item.label}</span>
                                  </div>
                                  {item.badge && (
                                    <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white rounded-full ${
                                      item.badgeColor === 'red' ? 'bg-red-500' :
                                      item.badgeColor === 'blue' ? 'bg-blue-500' :
                                      item.badgeColor === 'green' ? 'bg-green-500' : 'bg-red-500'
                                    }`}>
                                      {typeof item.badge === 'number' ? item.badge : item.badge}
                                    </span>
                                  )}
                                </>
                              )}
                            </>
                          );

                          const className = `flex items-center ${isCompactMode ? 'justify-center' : 'justify-between'} px-3 py-2 rounded-lg transition-all group relative ${
                            isActive
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`;
                          
                          return item.path ? (
                            <Link
                              key={item.label}
                              to={item.path}
                              onClick={() => handleNavClick(item.path!)}
                              title={item.tooltip || (isCompactMode ? item.label : undefined)}
                              className={className}
                            >
                              {content}
                            </Link>
                          ) : (
                            <button
                              key={item.label}
                              onClick={item.onClick}
                              title={item.tooltip || (isCompactMode ? item.label : undefined)}
                              className={`${className} w-full text-left`}
                            >
                              {content}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>

          {/* Compact Mode Toggle & Help */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            {!isCompactMode ? (
              <>
                <button
                  onClick={() => setIsCompactMode(!isCompactMode)}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    <span>Compact Mode</span>
                  </div>
                  <div className={`w-10 h-5 rounded-full transition-colors ${isCompactMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <div className={`w-4 h-4 mt-0.5 rounded-full bg-white transition-transform ${isCompactMode ? 'ml-5' : 'ml-0.5'}`} />
                  </div>
                </button>
                
                <a
                  href="https://github.com/Akuichi/credify"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Help & Support</span>
                </a>
              </>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <button
                  onClick={() => setIsCompactMode(!isCompactMode)}
                  title="Expand Sidebar"
                  className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                
                <a
                  href="https://github.com/Akuichi/credify"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Help & Support"
                  className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </a>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              title={isCompactMode ? "Logout" : undefined}
              className={`flex items-center ${isCompactMode ? 'justify-center' : 'space-x-3'} w-full px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {!isCompactMode && <span>Logout</span>}
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};
