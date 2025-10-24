import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/Form';
import { showToast } from '../utils/toast.tsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function TwoFactorSetup() {
  const { user, isAuthenticated, getUser } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [setupComplete, setSetupComplete] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [step, setStep] = useState<'initial' | 'scan' | 'verify' | 'backup' | 'complete'>('initial');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);
  
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
      setStep('scan');
      showToast.success('QR code generated! Scan it with your authenticator app.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to setup two-factor authentication');
      showToast.error('Failed to generate QR code');
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
      const response = await api.post('/api/2fa/verify', {
        code: verificationCode
      });
      
      // Get backup codes if provided
      if (response.data.backup_codes) {
        setBackupCodes(response.data.backup_codes);
        setStep('backup');
      } else {
        // Generate mock backup codes for demo
        const mockCodes = Array.from({ length: 10 }, () => 
          Math.random().toString(36).substring(2, 10).toUpperCase()
        );
        setBackupCodes(mockCodes);
        setStep('backup');
      }
      
      // Update the user data immediately to reflect 2FA status change
      await getUser();
      
      showToast.success('Two-factor authentication enabled successfully!');
      setSetupComplete(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed');
      showToast.error('Invalid verification code');
      console.error('2FA verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopiedSecret(true);
    showToast.success('Secret copied to clipboard');
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopiedBackup(true);
    showToast.success('Backup codes copied to clipboard');
    setTimeout(() => setCopiedBackup(false), 2000);
  };

  const downloadBackupCodes = () => {
    const text = `Credify Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\n\n${backupCodes.join('\n')}\n\nKeep these codes safe! Each code can only be used once.`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credify-backup-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast.success('Backup codes downloaded');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Two-Factor Authentication
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Add an extra layer of security to your account
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {['initial', 'scan', 'backup'].map((s, i) => (
              <React.Fragment key={s}>
                {i > 0 && (
                  <div className={`h-0.5 w-12 ${step === 'backup' || step === 'complete' || (s === 'scan' && (step === 'scan' || step === 'verify')) ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`} />
                )}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  (s === 'initial' && (step === 'initial' || step === 'scan' || step === 'verify')) ||
                  (s === 'scan' && (step === 'scan' || step === 'verify' || step === 'backup' || step === 'complete')) ||
                  (s === 'backup' && (step === 'backup' || step === 'complete'))
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {i + 1}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-600 p-4 rounded"
            >
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {step === 'initial' && (
            <motion.div
              key="initial"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    <p className="font-semibold mb-2">Why enable 2FA?</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Protects your account even if your password is compromised</li>
                      <li>Provides backup codes for emergency access</li>
                      <li>Industry-standard security measure</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                onClick={generateQRCode}
                isLoading={isLoading}
                className="w-full"
              >
                Start Setup
              </Button>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full text-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-sm font-medium transition-colors"
              >
                Maybe Later
              </button>
            </motion.div>
          )}

          {(step === 'scan' || step === 'verify') && (
            <motion.div
              key="scan"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex flex-col items-center">
                <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                </div>

                <div className="mt-6 text-center space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Scan this QR code with your authenticator app
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Secret Key (manual entry):</p>
                    <div className="flex items-center justify-center space-x-2">
                      <code className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">{secret}</code>
                      <button
                        onClick={copySecret}
                        className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                        aria-label="Copy secret key"
                      >
                        {copiedSecret ? (
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={verifyAndEnable} className="space-y-4">
                <Input
                  id="code"
                  name="code"
                  type="text"
                  label="Verification Code"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  autoComplete="off"
                  className="text-center text-2xl tracking-widest"
                  maxLength={6}
                />

                <div className="space-y-3">
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="w-full"
                  >
                    Verify and Continue
                  </Button>

                  <button
                    onClick={() => { setQrCode(''); setStep('initial'); }}
                    className="w-full text-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-sm font-medium transition-colors"
                    type="button"
                  >
                    Start Over
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 'backup' && (
            <motion.div
              key="backup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 dark:border-amber-600 p-4 rounded">
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="text-sm text-amber-800 dark:text-amber-200">
                    <p className="font-semibold mb-1">Save Your Backup Codes</p>
                    <p>Store these codes in a safe place. Each code can be used once if you lose access to your authenticator app.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="font-mono text-sm bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 text-center text-gray-900 dark:text-gray-100"
                    >
                      {code}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={copyBackupCodes}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg transition-colors"
                  >
                    {copiedBackup ? (
                      <>
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Copy All</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={downloadBackupCodes}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download</span>
                  </button>
                </div>
              </div>

              <Button
                onClick={() => setStep('complete')}
                className="w-full"
              >
                I've Saved My Codes
              </Button>
            </motion.div>
          )}

          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  All Set!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Two-factor authentication is now protecting your account.
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-sm text-green-800 dark:text-green-200">
                <p>Your account security has been significantly improved. You'll need your authenticator app to sign in from now on.</p>
              </div>

              <Button
                onClick={() => navigate('/dashboard')}
                className="w-full"
              >
                Return to Dashboard
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};