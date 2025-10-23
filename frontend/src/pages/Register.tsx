import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Form, Input, Button } from '../components/Form';
import type { RegisterData } from '../types/auth';

export default function Register() {
  const { register } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
          />
          <div className="text-xs text-gray-600 -mt-3 mb-3">
            Password must be at least 8 characters and include uppercase, lowercase, 
            numbers, and special characters.
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
