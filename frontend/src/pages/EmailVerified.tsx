import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EmailVerified: React.FC = () => {
  const [redirectSeconds, setRedirectSeconds] = useState(5);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (redirectSeconds <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setRedirectSeconds(redirectSeconds - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [redirectSeconds]);

  if (redirectSeconds <= 0) {
    return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div>
          <h2 className="mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Email Verified!
          </h2>
          <div className="mt-6 bg-white dark:bg-gray-800 py-6 sm:py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                Thank you! Your email address has been verified successfully.
              </p>
              <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                You will be redirected to {isAuthenticated ? "dashboard" : "login"} in <span className="font-semibold text-gray-900 dark:text-gray-100">{redirectSeconds}</span> seconds.
              </p>
              <div className="mt-6">
                <a
                  href={isAuthenticated ? "/dashboard" : "/login"}
                  className="inline-flex items-center min-h-[44px] px-6 py-3 border border-transparent text-sm font-semibold rounded-lg shadow-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-all"
                >
                  Go to {isAuthenticated ? "Dashboard" : "Login"} Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerified;