import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface EmailVerificationBannerProps {
  className?: string;
}

const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({ className }) => {
  const { user, sendVerificationEmail } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If email is verified or no user, don't show the banner
  if (!user || user.email_verified_at) {
    return null;
  }

  const handleSendVerification = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await sendVerificationEmail();
      setMessageSent(true);
      setTimeout(() => {
        setMessageSent(false);
      }, 10000); // Reset message after 10 seconds
    } catch (err: any) {
      setError(err.message || 'Failed to send verification email');
    } finally {
      setIsLoading(false);
    }
  };

  // Success state has been removed

  return (
    <div className={`bg-yellow-50 border-l-4 border-yellow-400 p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            Your email address has not been verified. 
            {!messageSent ? (
              <button
                onClick={handleSendVerification}
                disabled={isLoading}
                className="ml-2 font-medium text-yellow-700 underline hover:text-yellow-600"
              >
                {isLoading ? 'Sending...' : 'Send verification email'}
              </button>
            ) : (
              <span className="ml-2 font-medium text-green-600">Verification email sent! Please check your inbox.</span>
            )}
          </p>
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;