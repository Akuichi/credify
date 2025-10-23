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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Email Verified!
          </h2>
          <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-green-100 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="mt-4 text-center text-sm text-gray-600">
                Thank you! Your email address has been verified successfully.
              </p>
              <p className="mt-2 text-center text-sm text-gray-600">
                You will be redirected to {isAuthenticated ? "dashboard" : "login"} in {redirectSeconds} seconds.
              </p>
              <div className="mt-4">
                <a
                  href={isAuthenticated ? "/dashboard" : "/login"}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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