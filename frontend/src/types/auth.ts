export interface User {
  id: number;
  full_name: string;
  email: string;
  mobile_number?: string;
  two_factor_enabled: boolean;
  last_login_at?: string;
  last_login_ip?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  needsTwoFactor: boolean;
  temporaryToken?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  mobile_number?: string;
}

export interface TwoFactorVerifyData {
  code: string;
  token?: string;
}

export interface TwoFactorSetupResponse {
  secret: string;
  qr_code: string;
}