import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Form';

export default function TwoFactorSetup() {
  const { user, isAuthenticated, getUser } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [setupComplete, setSetupComplete] = useState(false);
  
  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Generate QR code
  const generateQRCode = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await api.post('/api/2fa/setup');
      console.log('2FA setup response:', response.data);
      
      setQrCode(response.data.qr_code);
      setSecret(response.data.secret);
      setSuccess('Two-factor authentication setup initiated. Scan the QR code with your authenticator app.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to setup two-factor authentication');
      console.error('2FA setup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Verify and enable 2FA
  const verifyAndEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await api.post('/api/2fa/verify', {
        code: verificationCode
      });
      
      // Update the user data immediately to reflect 2FA status change
      await getUser();
      
      setSuccess('Two-factor authentication has been enabled successfully!');
      setSetupComplete(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed');
      console.error('2FA verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Two-Factor Authentication Setup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Secure your account with two-factor authentication
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {!qrCode && !setupComplete && (
          <div className="mt-8 space-y-4">
            <Button 
              onClick={generateQRCode} 
              isLoading={isLoading}
              className="w-full"
            >
              Set up two-factor authentication
            </Button>
            
            <div className="text-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Cancel and return to Dashboard
              </button>
            </div>
          </div>
        )}

        {qrCode && !setupComplete && (
          <div className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <img src={qrCode} alt="QR Code" className="w-64 h-64" />
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">Scan this QR code with your authenticator app</p>
                <p className="mt-2 text-xs text-gray-500">
                  Secret key: <span className="font-mono bg-gray-100 px-1">{secret}</span>
                </p>
              </div>
            </div>

            <form onSubmit={verifyAndEnable} className="mt-6">
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
                  />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button 
                  type="submit" 
                  isLoading={isLoading}
                  className="w-full"
                >
                  Verify and Enable
                </Button>
                
                <div className="text-center">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                    type="button"
                  >
                    Cancel setup
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {setupComplete && (
          <div className="mt-8">
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Two-factor authentication is now enabled for your account.
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => navigate('/dashboard')} 
              className="w-full"
            >
              Return to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}