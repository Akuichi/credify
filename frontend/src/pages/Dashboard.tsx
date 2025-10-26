import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import SessionManager from '../components/SessionManager'
import DisableTwoFactor from '../components/DisableTwoFactor'
import EmailVerificationBanner from '../components/EmailVerificationBanner'
import ConfirmDialog from '../components/ConfirmDialog'
import { StatCard } from '../components/StatCard'
import { QuickActions } from '../components/QuickActions'
import { ActivityTimeline, ActivityItem } from '../components/ActivityTimeline'
import { ProfileUpdateModal } from '../components/ProfileUpdateModal'
import { PasswordConfirmModal } from '../components/PasswordConfirmModal'
import { TwoFactorSetupModal } from '../components/TwoFactorSetupModal'

export default function Dashboard() {
  const { user, getUser } = useAuth();
  const [showDisable2FA, setShowDisable2FA] = useState(false);
  const [showConfirmDisable, setShowConfirmDisable] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [currentSessionIp, setCurrentSessionIp] = useState<string | null>(null);

  // Fetch current session IP if last_login_ip is not available
  useEffect(() => {
    const fetchCurrentSession = async () => {
      if (!user?.last_login_ip) {
        try {
          const response = await api.get('/api/sessions');
          const currentSession = response.data.sessions.find((s: any) => s.is_current);
          if (currentSession) {
            setCurrentSessionIp(currentSession.ip_address);
          }
        } catch (error) {
          console.error('Failed to fetch current session:', error);
        }
      }
    };
    fetchCurrentSession();
  }, [user?.last_login_ip]);

  // Mock activity data - in real app, fetch from API
  const recentActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'login',
      title: 'Successful Login',
      description: `Signed in from ${user?.last_login_ip || 'Unknown IP'}`,
      timestamp: user?.last_login_at || new Date().toISOString(),
    },
    {
      id: '2',
      type: 'security',
      title: 'Security Check',
      description: user?.two_factor_enabled ? '2FA is enabled' : '2FA is disabled',
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    },
    {
      id: '3',
      type: 'email',
      title: 'Email Verification',
      description: user?.email_verified_at ? 'Email verified successfully' : 'Email not verified',
      timestamp: user?.email_verified_at || new Date(Date.now() - 172800000).toISOString(),
    },
  ];

  // Handlers for 2FA setup
  const handle2FASetup = () => {
    setShowPasswordConfirm(true);
  };

  const handlePasswordConfirmed = () => {
    setShowPasswordConfirm(false);
    setShow2FAModal(true);
  };

  // Quick actions
  const quickActions = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      label: 'Enable 2FA',
      description: 'Add an extra layer of security to your account',
      onClick: handle2FASetup,
      color: 'purple' as const,
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      label: 'Update Profile',
      description: 'Edit your personal information',
      onClick: () => setShowProfileModal(true),
      color: 'green' as const,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-3 sm:space-y-4">
      <EmailVerificationBanner className="mb-3 sm:mb-4" />
      
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              Welcome back, {user?.full_name}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">Manage your account and security settings</p>
          </div>
          <div className="hidden sm:block">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl sm:text-2xl font-bold text-white">
                {user?.full_name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
          label="Account Status"
          value={user?.email_verified_at ? 'Verified' : 'Unverified'}
          color="green"
        />
        
        <StatCard
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
          label="2FA Status"
          value={user?.two_factor_enabled ? 'Enabled' : 'Disabled'}
          color={user?.two_factor_enabled ? 'blue' : 'orange'}
        />
        
        <StatCard
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          label="Last Login"
          value={user?.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Not tracked yet'}
          color="purple"
        />
        
        <StatCard
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          }
          label="Login IP"
          value={user?.last_login_ip || currentSessionIp || 'Not available'}
          color="blue"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Quick Actions</h2>
        <QuickActions actions={quickActions.filter(action => {
          // Hide 2FA action if already enabled
          if (action.label === 'Enable 2FA' && user?.two_factor_enabled) return false;
          return true;
        })} />
      </div>

      {/* Activity Timeline */}
      <div id="activity">
        <ActivityTimeline activities={recentActivities} maxItems={5} />
      </div>

      {/* Profile & Security Grid */}
      <div id="profile" className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Profile Information Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-2">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Profile Information</h2>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Email Address</p>
              <p className="text-sm text-gray-900 dark:text-gray-100 font-medium break-all mt-0.5">{user?.email}</p>
            </div>
            
            {user?.mobile_number && (
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Mobile Number</p>
                <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mt-0.5">{user?.mobile_number}</p>
              </div>
            )}
            
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Email Verification</p>
              <div className="flex flex-wrap items-center gap-2">
                {user?.email_verified_at ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                    <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                    Not Verified
                  </span>
                )}
              </div>
            </div>
            
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Two-Factor Authentication</p>
              {user?.two_factor_enabled ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                  <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Enabled
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                  Disabled
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Security Settings Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mr-2">
              <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Security Settings</h2>
          </div>
          
          <div className="space-y-3">
            {/* Last Login Info */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Recent Activity</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Last Login</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                    {user?.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'First time logging in'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">IP Address</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5 break-all">
                    {user?.last_login_ip || currentSessionIp || 'Not available'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* 2FA Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Two-Factor Authentication</h3>
              {user?.two_factor_enabled ? (
                <>
                  {!showDisable2FA ? (
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-green-900 dark:text-green-100">Protection Active</p>
                          <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">Your account is secured with 2FA.</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowConfirmDisable(true)}
                        className="min-h-[44px] px-4 py-2 border-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 text-sm font-semibold rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400 dark:hover:border-red-600 transition-all"
                      >
                        Disable 2FA
                      </button>
                    </div>
                  ) : (
                    <DisableTwoFactor 
                      onSuccess={() => {
                        getUser();
                        setShowDisable2FA(false);
                      }}
                      onCancel={() => setShowDisable2FA(false)}
                    />
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <Link 
                    to="/2fa-setup"
                    className="flex items-start space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Security Recommended</p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-0.5">Enable 2FA for extra security. Click to set up.</p>
                    </div>
                    <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link 
                    to="/2fa-setup"
                    className="inline-flex items-center min-h-[44px] px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all"
                  >
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Enable Two-Factor Authentication
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Session Manager */}
      <div id="sessions">
        <SessionManager />
      </div>
      
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDisable}
        onClose={() => setShowConfirmDisable(false)}
        onConfirm={() => {
          setShowConfirmDisable(false);
          setShowDisable2FA(true);
        }}
        title="Disable Two-Factor Authentication?"
        message="This will make your account less secure. You'll need to enter your 2FA code to confirm this action."
        confirmText="Proceed"
        cancelText="Keep Enabled"
        variant="danger"
      />

      {/* Profile Update Modal */}
      <ProfileUpdateModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Password Confirmation Modal */}
      <PasswordConfirmModal
        isOpen={showPasswordConfirm}
        onClose={() => setShowPasswordConfirm(false)}
        onSuccess={handlePasswordConfirmed}
        title="Verify Your Password"
        message="Please enter your password to proceed with enabling Two-Factor Authentication."
      />

      {/* 2FA Setup Modal */}
      <TwoFactorSetupModal
        isOpen={show2FAModal}
        onClose={() => setShow2FAModal(false)}
      />
    </div>
  )
}
