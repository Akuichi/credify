import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Form, Input, Button } from '../components/Form';
import type { RegisterData } from '../types/auth';
import { validatePassword, getPasswordStrength } from '../utils/validation';

export default function Register() {
  const { register } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({ valid: true, message: '' });
  const [passwordStrength, setPasswordStrength] = useState('');
  const [formData, setFormData] = useState<RegisterData>({
    full_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    mobile_number: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate password before submission
    if (formData.password) {
      const validation = validatePassword(formData.password);
      setPasswordValidation(validation);
      
      if (!validation.valid) {
        setError('Please fix the password issues before submitting.');
        return;
      }
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
    
    // Validate password in real-time
    if (name === 'password' && value) {
      const result = validatePassword(value);
      setPasswordValidation(result);
      setPasswordStrength(getPasswordStrength(value));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
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
            value={formData.full_name}
            onChange={handleChange}
          />

          <Input
            label="Email Address"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
          />

          <Input
            label="Mobile Number (Optional)"
            id="mobile_number"
            name="mobile_number"
            type="tel"
            autoComplete="tel"
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
            value={formData.password}
            onChange={handleChange}
            error={formData.password && !passwordValidation.valid ? passwordValidation.message : ''}
          />
          <div className={`text-xs ${passwordStrength === 'weak' ? 'text-red-500' : 
            passwordStrength === 'medium' ? 'text-yellow-500' : 
            passwordStrength === 'strong' ? 'text-green-500' : 'text-gray-600'} -mt-3 mb-3`}>
            {formData.password ? (
              passwordStrength ? `Password strength: ${passwordStrength}` : ''
            ) : (
              'Password must be at least 8 characters and include uppercase, lowercase, numbers, and special characters.'
            )}
          </div>

          <Input
            label="Confirm Password"
            id="password_confirmation"
            name="password_confirmation"
            type="password"
            autoComplete="new-password"
            required
            value={formData.password_confirmation}
            onChange={handleChange}
          />

          <Button type="submit" isLoading={isLoading} className="w-full mt-6">
            Create Account
          </Button>
        </Form>
      </div>
    </div>
  );
}
