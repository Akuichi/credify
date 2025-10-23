import React, { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

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
    <div className="bg-white p-4 rounded-md shadow">
      <h4 className="font-medium text-lg mb-2">Disable Two-Factor Authentication</h4>
      
      <p className="text-sm text-gray-600 mb-4">
        To disable two-factor authentication, please enter the current verification code from your authenticator app.
      </p>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
            Verification Code
          </label>
          <input
            type="text"
            id="code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="Enter 6-digit code"
            maxLength={6}
            pattern="[0-9]*"
            inputMode="numeric"
            required
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Disable 2FA'}
          </button>
        </div>
      </form>
    </div>
  );
}