import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Form';

export default function TwoFactorVerify() {
  const navigate = useNavigate();
  const { verifyTwoFactor, needsTwoFactor, temporaryToken } = useAuth();
  
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if user doesn't need 2FA verification
  if (!needsTwoFactor) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await verifyTwoFactor({
        code: verificationCode,
        token: temporaryToken,
      });
      // Successful verification will redirect in the auth context
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Two-Factor Verification
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the code from your authenticator app
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <div className="mt-1">
              <input
                id="code"
                name="code"
                type="text"
                required
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter 6-digit code"
                autoComplete="off"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
              />
            </div>
          </div>

          <div>
            <Button 
              type="submit" 
              isLoading={isLoading}
              className="w-full"
            >
              Verify
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}