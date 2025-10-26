import React, { Suspense, lazy } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute'
import { Sidebar } from './components/Sidebar'
import MobileMenu from './components/MobileMenu'
import { UserDropdown } from './components/UserDropdown'
import { NotificationCenter, Notification } from './components/NotificationCenter'
import { Breadcrumbs } from './components/Breadcrumbs'
import { ThemeToggle } from './components/ThemeToggle'
import { PageTransition } from './components/PageTransition'
import { ProfileUpdateModal } from './components/ProfileUpdateModal'
import ErrorBoundary from './components/ErrorBoundary'

// Lazy load page components for better performance
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Settings = lazy(() => import('./pages/Settings'))
const TwoFactorSetup = lazy(() => import('./pages/TwoFactorSetup'))
const TwoFactorVerify = lazy(() => import('./pages/TwoFactorVerify'))
const EmailVerified = lazy(() => import('./pages/EmailVerified'))
const AdminEmailSettings = lazy(() => import('./pages/AdminEmailSettings'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
)

export default function App() {
  const { isAuthenticated, logout, user, isLoading, isLoggingOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [showProfileModal, setShowProfileModal] = React.useState(false);
  
  // Load notifications from localStorage or use defaults - user-specific
  const getInitialNotifications = (): Notification[] => {
    if (!user?.id) return [];
    
    const storageKey = `credify_notifications_${user.id}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Default notifications for new users
    return [
      {
        id: '1',
        type: 'success',
        title: 'Welcome to Credify!',
        message: 'Your account has been created successfully.',
        timestamp: new Date().toISOString(),
        read: false,
      },
      {
        id: '2',
        type: 'warning',
        title: 'Enable Two-Factor Authentication',
        message: 'Secure your account by enabling 2FA.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: !user?.two_factor_enabled,
      },
    ];
  };

  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  // Initialize notifications when user changes
  React.useEffect(() => {
    if (user?.id) {
      setNotifications(getInitialNotifications());
    } else {
      setNotifications([]);
    }
  }, [user?.id]);

  // Save notifications to localStorage whenever they change - user-specific
  React.useEffect(() => {
    if (user?.id && notifications.length > 0) {
      const storageKey = `credify_notifications_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(notifications));
    }
  }, [notifications, user?.id]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleClearNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <ErrorBoundary>
      {/* Logout Overlay */}
      {isLoggingOut && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center max-w-sm mx-4">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">Logging out...</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Please wait</p>
          </div>
        </div>
      )}
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50" role="navigation" aria-label="Main navigation">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              {/* Sidebar Toggle Button (Mobile Only) */}
              {isAuthenticated && (
                <button
                  onClick={() => {
                    // This will trigger the sidebar to open
                    const event = new CustomEvent('toggleSidebar');
                    window.dispatchEvent(event);
                  }}
                  className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Open sidebar"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
                aria-label="Credify home"
              >
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Credify</span>
              </Link>
            </div>
            
            {/* Mobile & Desktop Navigation */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile Navigation (show when authenticated) */}
              {isAuthenticated && (
                <div className="flex md:hidden items-center space-x-2">
                  <NotificationCenter
                    notifications={notifications}
                    onMarkAsRead={handleMarkAsRead}
                    onMarkAllAsRead={handleMarkAllAsRead}
                    onClear={handleClearNotification}
                  />
                  <ThemeToggle />
                </div>
              )}
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-4">
                <ThemeToggle />
              {isAuthenticated ? (
                <>
                  <NotificationCenter
                    notifications={notifications}
                    onMarkAsRead={handleMarkAsRead}
                    onMarkAllAsRead={handleMarkAllAsRead}
                    onClear={handleClearNotification}
                  />
                  <UserDropdown />
                </>
              ) : !isLoading ? (
                <>
                  <Link 
                    to="/login" 
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label="Login to your account"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label="Sign up for an account"
                  >
                    Sign Up
                  </Link>
                </>
              ) : null}
              </div>
              
              {/* Mobile Menu Button (Only for non-authenticated users) */}
              {!isAuthenticated && (
                <div className="md:hidden flex items-center space-x-2">
                  <ThemeToggle />
                  <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Open menu"
                    aria-expanded={isMobileMenuOpen}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        isLoading={isLoading}
      />
      
      {/* Main Layout with Sidebar */}
      <div className="flex">
        {/* Sidebar - Only show when authenticated */}
        {isAuthenticated && <Sidebar onProfileClick={() => setShowProfileModal(true)} />}
        
        {/* Main Content */}
        <main className={`flex-1 ${isAuthenticated ? 'lg:ml-0' : ''} overflow-x-hidden`} role="main">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumbs - Only show when authenticated */}
            {isAuthenticated && <Breadcrumbs />}
            
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            <Route path="/2fa-setup" element={
              <ProtectedRoute>
                <TwoFactorSetup />
              </ProtectedRoute>
            } />
            <Route path="/2fa-verify" element={
              <PublicRoute>
                <TwoFactorVerify />
              </PublicRoute>
            } />
            <Route path="/email/verified" element={
              <ProtectedRoute>
                <EmailVerified />
              </ProtectedRoute>
            } />
            <Route path="/email-verified" element={
              <ProtectedRoute>
                <EmailVerified />
              </ProtectedRoute>
            } />
            <Route path="/admin/email-settings" element={
              <ProtectedRoute>
                <AdminEmailSettings />
              </ProtectedRoute>
            } />
            <Route path="/forgot-password" element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            } />
            <Route path="/reset-password" element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            } />
          </Routes>
        </Suspense>
          </div>
        </main>
      </div>

      {/* Profile Update Modal */}
      <ProfileUpdateModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
    </ErrorBoundary>
  );
}
