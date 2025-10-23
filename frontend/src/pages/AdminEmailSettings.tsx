import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Button } from '../components/Form';

// Define types for our email config response
interface EmailConfig {
  driver: string;
  host: string;
  port: number;
  from_address: string;
  from_name: string;
}

interface TestEmailResult {
  message: string;
  config: EmailConfig;
  error?: string;
}

interface VerificationEmailResult {
  message: string;
  user?: {
    id: number;
    email: string;
  };
  error?: string;
}

export default function AdminEmailSettings() {
  const { user } = useAuth();
  const [emailConfig, setEmailConfig] = useState<EmailConfig | null>(null);
  const [testResult, setTestResult] = useState<TestEmailResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationEmailResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testEmailConfig = async () => {
    setLoading(true);
    setError(null);
    setTestResult(null);
    
    try {
      const response = await api.get<TestEmailResult>('/api/admin/email/test-config');
      setTestResult(response.data);
      setEmailConfig(response.data.config);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to test email configuration');
      console.error('Email test error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const sendVerificationEmail = async () => {
    if (!user) return;
    
    setVerificationLoading(true);
    setError(null);
    setVerificationResult(null);
    
    try {
      const response = await api.post<VerificationEmailResult>('/api/admin/email/test-verification', {
        user_id: user.id
      });
      setVerificationResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send verification email');
      console.error('Verification email error:', err);
    } finally {
      setVerificationLoading(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Email Configuration Settings</h2>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Test Email Configuration</h3>
          <p className="text-sm text-gray-600 mb-3">
            Click the button below to test your email configuration. This will attempt to send a test email.
          </p>
          
          <Button onClick={testEmailConfig} isLoading={loading}>
            Test Email Configuration
          </Button>
          
          {testResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <p className="text-green-600 font-medium">{testResult.message}</p>
              
              {emailConfig && (
                <div className="mt-3">
                  <h4 className="font-medium">Current Configuration:</h4>
                  <ul className="list-disc pl-5 mt-2 text-sm">
                    <li><span className="font-medium">Driver:</span> {emailConfig.driver}</li>
                    <li><span className="font-medium">Host:</span> {emailConfig.host}</li>
                    <li><span className="font-medium">Port:</span> {emailConfig.port}</li>
                    <li><span className="font-medium">From Address:</span> {emailConfig.from_address}</li>
                    <li><span className="font-medium">From Name:</span> {emailConfig.from_name}</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-2">Test Verification Email</h3>
          <p className="text-sm text-gray-600 mb-3">
            Send a test verification email to your account.
          </p>
          
          <Button onClick={sendVerificationEmail} isLoading={verificationLoading}>
            Send Verification Email
          </Button>
          
          {verificationResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <p className="text-green-600 font-medium">{verificationResult.message}</p>
              
              {verificationResult.user && (
                <p className="mt-2 text-sm">
                  Email sent to: {verificationResult.user.email}
                </p>
              )}
            </div>
          )}
        </div>
        
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium">Email Configuration Instructions</h3>
          <div className="mt-2 text-sm text-gray-600 space-y-3">
            <p>To configure a real email service:</p>
            <ol className="list-decimal pl-5">
              <li className="mb-2">Open the <code className="bg-gray-100 p-1 rounded">.env</code> file in your backend directory</li>
              <li className="mb-2">Update the following settings with your email provider's information:
                <pre className="bg-gray-100 p-3 rounded mt-2 overflow-x-auto">
                  MAIL_MAILER=smtp<br/>
                  MAIL_HOST=your-mail-host<br/>
                  MAIL_PORT=your-mail-port<br/>
                  MAIL_USERNAME=your-username<br/>
                  MAIL_PASSWORD=your-password<br/>
                  MAIL_ENCRYPTION=tls<br/>
                  MAIL_FROM_ADDRESS=your-from-email<br/>
                  MAIL_FROM_NAME="${"{APP_NAME}"}"
                </pre>
              </li>
              <li>Restart your application for changes to take effect</li>
            </ol>
            
            <p className="mt-3">For development, we recommend using <a href="https://mailtrap.io" target="_blank" className="text-blue-600 hover:underline">Mailtrap</a> as it captures all emails without actually sending them.</p>
          </div>
        </div>
      </div>
    </div>
  );
}