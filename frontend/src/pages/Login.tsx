import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Form, Input, Button } from '../components/Form';
import { validateEmail } from '../utils/validation';
import type { LoginCredentials } from '../types/auth';

export default function Login() {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitRemaining, setRateLimitRemaining] = useState<number | null>(null);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
    remember: false,
  });

  // Countdown timer for rate limit
  useEffect(() => {
    if (rateLimitRemaining !== null && rateLimitRemaining > 0) {
      const timer = setInterval(() => {
        setRateLimitRemaining(prev => {
          if (prev === null || prev <= 1) {
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [rateLimitRemaining]);

  // Real-time validation (only email for login)
  const emailValidation = validateEmail(formData.email);
  
  // Simple password validation - just check if not empty
  const passwordValidation = {
    isValid: formData.password.length > 0,
    error: formData.password.length === 0 ? 'Password is required' : undefined,
    success: formData.password.length > 0 ? 'Password entered' : undefined,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate before submit
    if (!emailValidation.isValid || !passwordValidation.isValid) {
      setTouched({ email: true, password: true });
      return;
    }
    
    setIsLoading(true);

    try {
      await login(formData);
    } catch (err: any) {
      // Check if it's a rate limit error (429)
      if (err.response?.status === 429) {
        const retryAfter = err.response?.headers['retry-after'];
        const seconds = retryAfter ? parseInt(retryAfter) : 30;
        setRateLimitRemaining(seconds);
        setError(`Too many login attempts. Please wait ${seconds} seconds before trying again.`);
      } else {
        // Get error message from response or use the error message
        const errorMessage = err.response?.data?.message || err.message || 'Login failed';
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  
  const handleBlur = (field: 'email' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Sign in to continue to your account
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              Sign up for free
            </Link>
          </p>
        </div>

        <Form onSubmit={handleSubmit} error={error}>
          {rateLimitRemaining !== null && rateLimitRemaining > 0 && (
            <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                    Account temporarily locked
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                    Please wait <span className="font-bold text-lg">{rateLimitRemaining}</span> seconds before trying again
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <Input
            label="Email Address"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            onBlur={() => handleBlur('email')}
            validation={emailValidation}
            showValidation={touched.email && formData.email.length > 0}
          />

          <Input
            label="Password"
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            onBlur={() => handleBlur('password')}
            validation={passwordValidation}
            showValidation={touched.password && formData.password.length > 0}
          />

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                checked={formData.remember}
                onChange={handleChange}
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
                Forgot password?
              </Link>
            </div>
          </div>

          <Button type="submit" isLoading={isLoading} disabled={rateLimitRemaining !== null && rateLimitRemaining > 0}>
            {rateLimitRemaining !== null && rateLimitRemaining > 0 ? `Wait ${rateLimitRemaining}s` : 'Sign in'}
          </Button>
        </Form>
      </div>
    </div>
  );
}
