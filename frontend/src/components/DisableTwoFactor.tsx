import React, { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from './Form';
import { LoadingOverlay } from './LoadingOverlay';

interface DisableTwoFactorProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DisableTwoFactor({ onSuccess, onCancel }: DisableTwoFactorProps) {
  const { getUser } = useAuth();
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode) {
      setError('Please enter your verification code');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await api.post('/api/2fa/disable', { code: verificationCode });
      
      // Update the user data immediately to reflect 2FA status change
      await getUser();
      
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to disable 2FA');
      console.error('Error disabling 2FA:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay isVisible={isLoading} message="Disabling 2FA..." />
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-xl mb-3 text-gray-900 dark:text-gray-100">Disable Two-Factor Authentication</h4>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          To disable two-factor authentication, please enter the current verification code from your authenticator app.
        </p>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-600 p-4 mb-6 rounded-lg">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="text"
            id="code"
            label="Verification Code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter 6-digit code"
            maxLength={6}
            pattern="[0-9]*"
            inputMode="numeric"
            required
            autoFocus
          />
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={onCancel}
              variant="secondary"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <button
              type="submit"
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={isLoading}
            >
              Disable 2FA
            </button>
          </div>
        </form>
      </div>
    </>
  );
}