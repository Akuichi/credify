import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SessionManager from '../components/SessionManager'
import DisableTwoFactor from '../components/DisableTwoFactor'
import EmailVerificationBanner from '../components/EmailVerificationBanner'

export default function Dashboard() {
  const { user, getUser } = useAuth();
  const [showDisable2FA, setShowDisable2FA] = useState(false);

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <EmailVerificationBanner className="mb-4" />
      <h2 className="text-xl font-bold mb-4">Welcome, {user?.full_name}!</h2>
      
      <div className="mt-6 space-y-4">
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-2">Your Profile</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Email:</span> {user?.email}</p>
            {user?.mobile_number && (
              <p><span className="font-medium">Mobile:</span> {user?.mobile_number}</p>
            )}
            <p><span className="font-medium">2FA Status:</span> {user?.two_factor_enabled ? 'Enabled' : 'Disabled'}</p>
            <p>
              <span className="font-medium">Email Status:</span> {user?.email_verified_at ? 'Verified' : 'Not Verified'} 
              <Link to="/admin/email-settings" className="ml-2 text-sm text-blue-600 hover:underline">
                Email Settings
              </Link>
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Security Settings</h3>
          <div className="space-y-4">
            <div>
              <p><span className="font-medium">Last Login:</span> {user?.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}</p>
              <p><span className="font-medium">Last Login IP:</span> {user?.last_login_ip || 'N/A'}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
              {user?.two_factor_enabled ? (
                <>
                  {!showDisable2FA ? (
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                          Enabled
                        </span>
                        <p className="text-sm text-gray-500">Your account is secured with two-factor authentication.</p>
                      </div>
                      <button 
                        onClick={() => setShowDisable2FA(true)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
                <div>
                  <p className="text-sm text-gray-500 mb-2">Two-factor authentication is not enabled for your account.</p>
                  <Link 
                    to="/2fa-setup"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Enable 2FA
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <SessionManager />
      </div>
    </div>
  )
}
