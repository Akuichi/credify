import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { User, AuthState, LoginCredentials, RegisterData, TwoFactorVerifyData } from '../types/auth';
import { showToast } from '../utils/toast.tsx';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  verifyTwoFactor: (data: TwoFactorVerifyData) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  checkVerificationStatus: () => Promise<boolean>;
  logout: () => Promise<void>;
  getUser: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: { email: string; token: string; password: string; password_confirmation: string }) => Promise<void>;
  isLoggingOut: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    needsTwoFactor: false,
    temporaryToken: undefined,
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Get CSRF cookie and check auth status on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setState(prev => ({ ...prev, isLoading: true }));
      try {
        console.log('Getting CSRF cookie...');
        // Make sure to get CSRF token first
        const csrfResponse = await api.get('/sanctum/csrf-cookie');
        console.log('CSRF cookie response:', csrfResponse.status);
        
        // Small delay to ensure cookie is set
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Check for stored token
        const storedToken = localStorage.getItem('auth_token');
        console.log('Stored token exists:', !!storedToken);
        
        console.log('Cookies after CSRF:', document.cookie);
        await getUser();
      } catch (error) {
        console.error('Auth initialization error:', error);
        setState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false,
        }));
        
        // Clear invalid token if authentication fails
        localStorage.removeItem('auth_token');
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  // Re-check authentication when navigating (e.g., when using browser back button)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      // When page becomes visible again (e.g., back button), verify auth state
      if (document.visibilityState === 'visible' && state.isAuthenticated) {
        try {
          await getUser();
        } catch (error) {
          // If user fetch fails, they're not authenticated
          setState(prev => ({
            ...prev,
            user: null,
            isAuthenticated: false,
          }));
          localStorage.removeItem('auth_token');
          delete api.defaults.headers.common['Authorization'];
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [state.isAuthenticated]);

    const getUser = async () => {
    try {
      console.log('Fetching user data...');
      const { data } = await api.get<User>('/api/user');
      console.log('User data received:', data);
      setState(prev => ({
        ...prev,
        user: data,
        isAuthenticated: true,
        needsTwoFactor: false,
        temporaryToken: undefined,
      }));
    } catch (error) {
      console.error('Error fetching user data:', error);
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
      }));
    }
  };  const login = async (credentials: LoginCredentials) => {
    try {
      // First get CSRF cookie
      await api.get('/sanctum/csrf-cookie');
      
      // Then attempt login
      const { data } = await api.post('/api/login', credentials);
      
      // If backend indicates 2FA is required
      if (data.two_factor_required) {
        setState(prev => ({
          ...prev,
          needsTwoFactor: true,
          temporaryToken: data.temp_token,
        }));
        showToast.success('Please enter your 2FA code');
        navigate('/2fa-verify');
        return;
      }

      await getUser();
      showToast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed';
      
      // Don't show toast for rate limit errors - let the component handle it
      if (error.response?.status !== 429) {
        showToast.error(errorMessage);
      }
      
      // Re-throw the original error to preserve headers (especially retry-after for rate limiting)
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await api.post('/api/register', data);
      await getUser();
      showToast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      showToast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const verifyTwoFactor = async (data: TwoFactorVerifyData) => {
    try {
      // During login flow verification (temp token provided from login response)
      if (state.needsTwoFactor && state.temporaryToken) {
        const response = await api.post('/api/login/verify', { code: data.code }, {
          headers: { Authorization: `Bearer ${state.temporaryToken}` }
        });
        
        console.log('2FA verification response:', response.data);
        
        // Store the permanent token from the response
        if (response.data.token) {
          // Store the token in local storage or in a more secure way if needed
          localStorage.setItem('auth_token', response.data.token);
          
          // Update the axios default headers to include the token for future requests
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        }
      } 
      // Regular 2FA verification for an already authenticated user
      else {
        await api.post('/api/2fa/verify', { code: data.code });
      }
      
      await getUser();
      navigate('/dashboard');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '2FA verification failed');
    }
  };

  const sendVerificationEmail = async () => {
    try {
      await api.post('/api/email/verify/send');
      return;
    } catch (error: any) {
      console.error('Failed to send verification email:', error);
      throw new Error(error.response?.data?.message || 'Failed to send verification email');
    }
  };

  // Dev verification method has been removed

  const checkVerificationStatus = async (): Promise<boolean> => {
    try {
      const response = await api.get('/api/email/verify');
      return response.data.verified;
    } catch (error: any) {
      console.error('Failed to check verification status:', error);
      return false;
    }
  };

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await api.post('/api/logout');
      
      // Clear auth token from storage and axios headers
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
      
      // Clear all cookies (session cookies from Sanctum)
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        needsTwoFactor: false,
        temporaryToken: undefined,
      });
      showToast.success('Logged out successfully');
      
      // Use replace to prevent back button from returning to protected routes
      navigate('/login', { replace: true });
    } catch (error: any) {
      console.error('Logout failed:', error);
      
      // Even if the logout API call fails, clear state and tokens
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
      
      // Clear all cookies even on error
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        needsTwoFactor: false,
        temporaryToken: undefined,
      });
      
      // Use replace to prevent back button from returning to protected routes
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      await api.post('/api/forgot-password', { email });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send password reset email');
    }
  };

  const resetPassword = async (data: { 
    email: string; 
    token: string; 
    password: string; 
    password_confirmation: string 
  }): Promise<void> => {
    try {
      await api.post('/api/reset-password', data);
      
      // Immediately clear authentication state after password reset
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
      
      // Update authentication state to ensure user needs to log in again
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        needsTwoFactor: false,
        temporaryToken: undefined,
      }));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        verifyTwoFactor,
        sendVerificationEmail,
        checkVerificationStatus,
        logout,
        getUser,
        forgotPassword,
        resetPassword,
        isLoggingOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
