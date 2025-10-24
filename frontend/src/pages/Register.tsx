import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Form, Input, Button } from '../components/Form';
import type { RegisterData } from '../types/auth';
import { 
  validateEmail, 
  validateName, 
  validatePasswordField, 
  validatePasswordConfirmation,
  getPasswordStrength,
  getPasswordStrengthDetailed
} from '../utils/validation';

export default function Register() {
  const { register } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [touched, setTouched] = useState({
    full_name: false,
    email: false,
    password: false,
    password_confirmation: false,
  });
  const [formData, setFormData] = useState<RegisterData>({
    full_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    mobile_number: '',
  });
  
  // Real-time validations
  const nameValidation = validateName(formData.full_name);
  const emailValidation = validateEmail(formData.email);
  const passwordValidation = validatePasswordField(formData.password);
  const confirmValidation = validatePasswordConfirmation(formData.password, formData.password_confirmation);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Mark all fields as touched
    setTouched({
      full_name: true,
      email: true,
      password: true,
      password_confirmation: true,
    });
    
    // Validate all fields before submission
    if (!nameValidation.isValid || !emailValidation.isValid || 
        !passwordValidation.isValid || !confirmValidation.isValid) {
      setError('Please fix all validation errors before submitting.');
      return;
    }
    
    setIsLoading(true);

    try {
      await register(formData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Update password strength in real-time
    if (name === 'password' && value) {
      setPasswordStrength(getPasswordStrength(value));
    }
  };
  
  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Join us and secure your financial future
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              Sign in here
            </Link>
          </p>
        </div>

        <Form onSubmit={handleSubmit} error={error}>
          <Input
            label="Full Name"
            id="full_name"
            name="full_name"
            type="text"
            autoComplete="name"
            required
            placeholder="John Doe"
            value={formData.full_name}
            onChange={handleChange}
            onBlur={() => handleBlur('full_name')}
            validation={nameValidation}
            showValidation={touched.full_name && formData.full_name.length > 0}
          />

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
            label="Mobile Number (Optional)"
            id="mobile_number"
            name="mobile_number"
            type="tel"
            autoComplete="tel"
            placeholder="+1 (555) 000-0000"
            value={formData.mobile_number}
            onChange={handleChange}
          />

          <Input
            label="Password"
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            onBlur={() => handleBlur('password')}
            validation={passwordValidation}
            showValidation={touched.password && formData.password.length > 0}
          />
          
          {formData.password && (
            <div className="-mt-4 mb-4">
              <div className="flex items-center space-x-2">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      passwordStrength === 'weak' ? 'w-1/3 bg-red-500' : 
                      passwordStrength === 'medium' ? 'w-2/3 bg-yellow-500' : 
                      passwordStrength === 'strong' ? 'w-full bg-green-500' : 'w-0'
                    }`}
                  />
                </div>
                <span className={`text-xs font-medium ${
                  passwordStrength === 'weak' ? 'text-red-600 dark:text-red-400' : 
                  passwordStrength === 'medium' ? 'text-yellow-600 dark:text-yellow-400' : 
                  passwordStrength === 'strong' ? 'text-green-600 dark:text-green-400' : 'text-gray-500'
                }`}>
                  {passwordStrength ? passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1) : ''}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Use 8+ characters with uppercase, lowercase, numbers & symbols
              </p>
            </div>
          )}

          <Input
            label="Confirm Password"
            id="password_confirmation"
            name="password_confirmation"
            type="password"
            autoComplete="new-password"
            required
            placeholder="••••••••"
            value={formData.password_confirmation}
            onChange={handleChange}
            onBlur={() => handleBlur('password_confirmation')}
            validation={confirmValidation}
            showValidation={touched.password_confirmation && formData.password_confirmation.length > 0}
          />

          <Button type="submit" isLoading={isLoading} className="mt-6">
            Create Account
          </Button>
          
          <p className="text-xs text-center text-gray-500 mt-4">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </Form>
      </div>
    </div>
  );
}
