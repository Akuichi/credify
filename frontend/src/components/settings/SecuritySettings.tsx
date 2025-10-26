import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { showToast } from '../../utils/toast';
import { TwoFactorSetupModal } from '../TwoFactorSetupModal';
import { PasswordConfirmModal } from '../PasswordConfirmModal';
import { validatePasswordField, validatePasswordConfirmation } from '../../utils/validation';

export const SecuritySettings: React.FC = () => {
  const { user, getUser } = useAuth();
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [disableError, setDisableError] = useState('');
  
  // Change password state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const handle2FASetup = () => {
    setShowPasswordConfirm(true);
  };

  const handlePasswordConfirmed = () => {
    setShowSetupModal(true);
  };

  const handleDisable2FA = async () => {
    if (!verificationCode.trim()) {
      setDisableError('Verification code is required');
      return;
    }

    if (verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
      setDisableError('Please enter a valid 6-digit code');
      return;
    }

    setIsDisabling(true);
    setDisableError('');

    try {
      await api.post('/api/2fa/disable', {
        code: verificationCode,
      });

      showToast.success('Two-factor authentication disabled successfully');
      await getUser();
      setShowDisableConfirm(false);
      setVerificationCode('');
    } catch (error: any) {
      console.error('2FA disable error:', error);
      if (error.response?.data?.message) {
        setDisableError(error.response.data.message);
      } else {
        setDisableError('Failed to disable 2FA. Please try again.');
      }
    } finally {
      setIsDisabling(false);
    }
  };

  const handleCancelDisable = () => {
    setShowDisableConfirm(false);
    setVerificationCode('');
    setDisableError('');
  };

  // Change password handlers
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});

    // Validation
    if (!passwordData.current_password) {
      setPasswordErrors({ current_password: 'Current password is required' });
      return;
    }

    // Check if new password is the same as current password
    if (passwordData.current_password === passwordData.new_password) {
      setPasswordErrors({ new_password: 'New password must be different from current password' });
      return;
    }

    // Validate new password strength
    const newPasswordValidation = validatePasswordField(passwordData.new_password);
    if (!newPasswordValidation.isValid) {
      setPasswordErrors({ new_password: newPasswordValidation.error || 'Invalid password' });
      return;
    }

    // Validate password confirmation
    const confirmValidation = validatePasswordConfirmation(
      passwordData.new_password,
      passwordData.new_password_confirmation
    );
    if (!confirmValidation.isValid) {
      setPasswordErrors({ new_password_confirmation: confirmValidation.error || 'Passwords do not match' });
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.put('/api/auth/change-password', passwordData);
      showToast.success('Password changed successfully');
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
    } catch (error: any) {
      console.error('Change password error:', error);
      if (error.response?.data?.errors) {
        setPasswordErrors(error.response.data.errors);
      } else {
        showToast.error(error.response?.data?.message || 'Failed to change password');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Two-Factor Authentication Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Two-Factor Authentication</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Add an extra layer of security to your account
          </p>
        </div>

        <div className="p-6">
          {/* Status Banner */}
          <div
            className={`flex items-start space-x-3 p-4 rounded-lg ${
              user?.two_factor_enabled
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
            }`}
          >
            <div className="flex-shrink-0">
              {user?.two_factor_enabled ? (
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <h3
                className={`text-sm font-medium ${
                  user?.two_factor_enabled
                    ? 'text-green-800 dark:text-green-300'
                    : 'text-yellow-800 dark:text-yellow-300'
                }`}
              >
                {user?.two_factor_enabled ? 'Two-Factor Authentication Enabled' : 'Two-Factor Authentication Disabled'}
              </h3>
              <p
                className={`text-sm mt-1 ${
                  user?.two_factor_enabled
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-yellow-700 dark:text-yellow-400'
                }`}
              >
                {user?.two_factor_enabled
                  ? 'Your account is protected with 2FA. You will be required to enter a code from your authenticator app when signing in.'
                  : 'Enable 2FA to add an extra layer of security to your account. You will need an authenticator app.'}
              </p>
            </div>
          </div>

          {/* Information */}
          <div className="mt-6 space-y-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">What is Two-Factor Authentication?</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  2FA adds an extra layer of security by requiring a verification code from your authenticator app in
                  addition to your password when signing in.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Recommended Authenticator Apps</p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                  <li>• Google Authenticator (iOS, Android)</li>
                  <li>• Microsoft Authenticator (iOS, Android)</li>
                  <li>• Authy (iOS, Android, Desktop)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            {!user?.two_factor_enabled ? (
              <button
                onClick={handle2FASetup}
                className="w-full px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span>Enable Two-Factor Authentication</span>
              </button>
            ) : (
              <>
                {!showDisableConfirm ? (
                  <button
                    onClick={() => setShowDisableConfirm(true)}
                    className="w-full px-6 py-3 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg transition-all"
                  >
                    Disable Two-Factor Authentication
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm font-medium text-red-900 dark:text-red-300">
                        Are you sure you want to disable 2FA?
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                        This will make your account less secure. Enter the 6-digit code from your authenticator app to confirm.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="verification_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Verification Code
                      </label>
                      <input
                        type="text"
                        id="verification_code"
                        value={verificationCode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setVerificationCode(value);
                          setDisableError('');
                        }}
                        maxLength={6}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          disableError
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:border-transparent transition-all text-center text-2xl tracking-widest font-mono`}
                        placeholder="000000"
                        autoComplete="off"
                      />
                      {disableError && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{disableError}</p>}
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleCancelDisable}
                        disabled={isDisabling}
                        className="flex-1 px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDisable2FA}
                        disabled={isDisabling}
                        className="flex-1 px-6 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {isDisabling ? (
                          <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            <span>Disabling...</span>
                          </>
                        ) : (
                          <span>Confirm Disable</span>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Change Password</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Update your password to keep your account secure
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Password
              </label>
              <input
                type="password"
                id="current_password"
                value={passwordData.current_password}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, current_password: e.target.value });
                  setPasswordErrors({ ...passwordErrors, current_password: '' });
                }}
                className={`w-full px-4 py-3 rounded-lg border ${
                  passwordErrors.current_password
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:border-transparent transition-all`}
                placeholder="Enter your current password"
              />
              {passwordErrors.current_password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{passwordErrors.current_password}</p>
              )}
            </div>

            <div>
              <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                id="new_password"
                value={passwordData.new_password}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, new_password: e.target.value });
                  setPasswordErrors({ ...passwordErrors, new_password: '' });
                }}
                className={`w-full px-4 py-3 rounded-lg border ${
                  passwordErrors.new_password
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:border-transparent transition-all`}
                placeholder="Enter your new password"
              />
              {passwordErrors.new_password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{passwordErrors.new_password}</p>
              )}
              {/* Password Requirements */}
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-600 dark:text-gray-400">Password must contain:</p>
                <div className="grid grid-cols-2 gap-1">
                  <div className={`text-xs flex items-center ${
                    passwordData.new_password.length >= 8 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      {passwordData.new_password.length >= 8 ? (
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 000 2h4a1 1 0 100-2H8z" clipRule="evenodd" />
                      )}
                    </svg>
                    8+ characters
                  </div>
                  <div className={`text-xs flex items-center ${
                    /[A-Z]/.test(passwordData.new_password) 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      {/[A-Z]/.test(passwordData.new_password) ? (
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 000 2h4a1 1 0 100-2H8z" clipRule="evenodd" />
                      )}
                    </svg>
                    Uppercase letter
                  </div>
                  <div className={`text-xs flex items-center ${
                    /[a-z]/.test(passwordData.new_password) 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      {/[a-z]/.test(passwordData.new_password) ? (
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 000 2h4a1 1 0 100-2H8z" clipRule="evenodd" />
                      )}
                    </svg>
                    Lowercase letter
                  </div>
                  <div className={`text-xs flex items-center ${
                    /[0-9]/.test(passwordData.new_password) 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      {/[0-9]/.test(passwordData.new_password) ? (
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 000 2h4a1 1 0 100-2H8z" clipRule="evenodd" />
                      )}
                    </svg>
                    Number
                  </div>
                  <div className={`text-xs flex items-center ${
                    /[^A-Za-z0-9]/.test(passwordData.new_password) 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      {/[^A-Za-z0-9]/.test(passwordData.new_password) ? (
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 000 2h4a1 1 0 100-2H8z" clipRule="evenodd" />
                      )}
                    </svg>
                    Symbol
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="new_password_confirmation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                id="new_password_confirmation"
                value={passwordData.new_password_confirmation}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, new_password_confirmation: e.target.value });
                  setPasswordErrors({ ...passwordErrors, new_password_confirmation: '' });
                }}
                className={`w-full px-4 py-3 rounded-lg border ${
                  passwordErrors.new_password_confirmation
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:border-transparent transition-all`}
                placeholder="Confirm your new password"
              />
              {passwordErrors.new_password_confirmation && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{passwordErrors.new_password_confirmation}</p>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isChangingPassword ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Changing Password...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <span>Change Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Security Tips Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Security Tips</h2>
        </div>
        <div className="p-6">
          <ul className="space-y-3">
            <li className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Use a strong, unique password that you don't use on other websites
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Enable two-factor authentication for maximum security
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Never share your password or 2FA codes with anyone
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Review your active sessions regularly and log out unused devices
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Password Confirmation Modal */}
      <PasswordConfirmModal
        isOpen={showPasswordConfirm}
        onClose={() => setShowPasswordConfirm(false)}
        onSuccess={handlePasswordConfirmed}
        title="Enable Two-Factor Authentication"
        message="Please confirm your password to continue setting up 2FA."
      />

      {/* 2FA Setup Modal */}
      <TwoFactorSetupModal isOpen={showSetupModal} onClose={() => setShowSetupModal(false)} />
    </div>
  );
};
