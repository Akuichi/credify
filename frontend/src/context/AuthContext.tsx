import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { User, AuthState, LoginCredentials, RegisterData, TwoFactorVerifyData } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  verifyTwoFactor: (data: TwoFactorVerifyData) => Promise<void>;
  logout: () => Promise<void>;
  getUser: () => Promise<void>;
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
        
        console.log('Cookies after CSRF:', document.cookie);
        await getUser();
      } catch (error) {
        console.error('Auth initialization error:', error);
        setState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false,
        }));
      } finally {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

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
        navigate('/2fa-verify');
        return;
      }

      await getUser();
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await api.post('/api/register', data);
      await getUser();
      navigate('/dashboard');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const verifyTwoFactor = async (data: TwoFactorVerifyData) => {
    try {
      // During login flow verification (temp token provided from login response)
      if (state.needsTwoFactor && state.temporaryToken) {
        await api.post('/api/login/verify', { code: data.code }, {
          headers: { Authorization: `Bearer ${state.temporaryToken}` }
        });
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

  const logout = async () => {
    try {
      await api.post('/api/logout');
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        needsTwoFactor: false,
        temporaryToken: undefined,
      });
      navigate('/login');
    } catch (error: any) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        verifyTwoFactor,
        logout,
        getUser,
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
