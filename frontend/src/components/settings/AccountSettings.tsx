import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { showToast } from '../../utils/toast';
import { PasswordConfirmModal } from '../PasswordConfirmModal';

interface AccountFormData {
  full_name: string;
  email: string;
  mobile_number: string;
}

export const AccountSettings: React.FC = () => {
  const { user, getUser, sendVerificationEmail } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [errors, setErrors] = useState<Partial<AccountFormData>>({});

  const [formData, setFormData] = useState<AccountFormData>({
    full_name: user?.full_name || '',
    email: user?.email || '',
    mobile_number: user?.mobile_number || '',
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        mobile_number: user.mobile_number || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof AccountFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<AccountFormData> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (formData.mobile_number && !/^\+?[\d\s-()]+$/.test(formData.mobile_number)) {
      newErrors.mobile_number = 'Invalid phone number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.put('/api/auth/profile', {
        full_name: formData.full_name,
        email: formData.email,
        mobile_number: formData.mobile_number || null,
      });

      // Show the message from backend (includes email verification notice if email changed)
      showToast.success(response.data.message || 'Profile updated successfully');
      await getUser();
      setIsEditing(false);
    } catch (error: any) {
      console.error('Profile update error:', error);

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        showToast.error(error.response.data.message);
      } else {
        showToast.error('Failed to update profile. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      email: user?.email || '',
      mobile_number: user?.mobile_number || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setShowPasswordConfirm(true);
  };

  const handlePasswordConfirmed = () => {
    setShowPasswordConfirm(false);
    setIsEditing(true);
  };

  const handleResendVerification = async () => {
    setIsSendingEmail(true);
    try {
      await sendVerificationEmail();
      showToast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('Send verification email error:', error);
      showToast.error(error.message || 'Failed to send verification email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Account Information</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Update your personal information and email address
            </p>
          </div>
          {!isEditing && (
            <button
              onClick={handleEditClick}
              className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
          >
            Edit
          </button>
        )}
      </div>

      {/* Content */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.full_name
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:border-transparent transition-all`}
                placeholder="Enter your full name"
              />
            ) : (
              <p className="px-4 py-3 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                {user?.full_name || 'Not set'}
              </p>
            )}
            {errors.full_name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.full_name}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            {isEditing ? (
              <>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.email
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:border-transparent transition-all`}
                  placeholder="Enter your email"
                />
                {formData.email !== user?.email && (
                  <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400 flex items-start space-x-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Changing your email will require re-verification</span>
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <p className="text-gray-900 dark:text-gray-100">{user?.email || 'Not set'}</p>
                  {user?.email_verified_at ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                      <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                      Not Verified
                    </span>
                  )}
                </div>
                {!user?.email_verified_at && (
                  <button
                    onClick={handleResendVerification}
                    disabled={isSendingEmail}
                    className="mt-2 w-full px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isSendingEmail ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>Resend Verification Email</span>
                      </>
                    )}
                  </button>
                )}
              </>
            )}
            {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
          </div>

          {/* Mobile Number */}
          <div>
            <label htmlFor="mobile_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mobile Number <span className="text-gray-400">(Optional)</span>
            </label>
            {isEditing ? (
              <input
                type="tel"
                id="mobile_number"
                name="mobile_number"
                value={formData.mobile_number}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.mobile_number
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:border-transparent transition-all`}
                placeholder="+1 (555) 123-4567"
              />
            ) : (
              <p className="px-4 py-3 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                {user?.mobile_number || 'Not set'}
              </p>
            )}
            {errors.mobile_number && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.mobile_number}</p>
            )}
          </div>

          {/* Account Created */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Account Created
            </label>
            <p className="px-4 py-3 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        )}
      </form>
      </div>

      {/* Password Confirmation Modal */}
      <PasswordConfirmModal
        isOpen={showPasswordConfirm}
        onClose={() => setShowPasswordConfirm(false)}
        onSuccess={handlePasswordConfirmed}
        title="Verify Your Password"
        message="Please confirm your password to edit your account information."
      />
    </>
  );
};
