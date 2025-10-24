/**
 * Frontend validation utilities with real-time feedback
 * (complementing the backend Laravel validation)
 */

export interface ValidationResult {
  valid: boolean;
  message: string;
  severity?: 'error' | 'warning' | 'success';
}

export interface FieldValidation {
  isValid: boolean;
  error?: string;
  warning?: string;
  success?: string;
}

// Email validation
export const validateEmail = (email: string): FieldValidation => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true, success: 'Valid email' };
};

/**
 * Validates a password according to the requirements:
 * - At least 8 characters
 * - Contains uppercase letters
 * - Contains lowercase letters
 * - Contains numbers
 * - Contains symbols
 * 
 * @param {string} password - The password to validate
 * @returns {object} - { valid: boolean, message: string }
 */
export const validatePassword = (password: string) => {
  // Check for minimum length
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  // Check for uppercase letters
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  // Check for lowercase letters
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  // Check for numbers
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  // Check for special characters
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one symbol' };
  }
  
  return { valid: true, message: 'Password is valid' };
};

// Enhanced password validation with field validation format
export const validatePasswordField = (password: string): FieldValidation => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  const result = validatePassword(password);
  if (!result.valid) {
    return { isValid: false, error: result.message };
  }
  
  return { isValid: true, success: 'Strong password' };
};

// Password confirmation validation
export const validatePasswordConfirmation = (password: string, confirmation: string): FieldValidation => {
  if (!confirmation) {
    return { isValid: false, error: 'Please confirm your password' };
  }
  
  if (password !== confirmation) {
    return { isValid: false, error: 'Passwords do not match' };
  }
  
  return { isValid: true, success: 'Passwords match' };
};

// Name validation
export const validateName = (name: string): FieldValidation => {
  if (!name) {
    return { isValid: false, error: 'Name is required' };
  }
  
  if (name.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }
  
  if (name.length > 50) {
    return { isValid: false, error: 'Name must be less than 50 characters' };
  }
  
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(name)) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }
  
  return { isValid: true, success: 'Valid name' };
};

// 2FA code validation
export const validate2FACode = (code: string): FieldValidation => {
  if (!code) {
    return { isValid: false, error: '2FA code is required' };
  }
  
  const codeRegex = /^\d{6}$/;
  if (!codeRegex.test(code)) {
    return { isValid: false, error: '2FA code must be 6 digits' };
  }
  
  return { isValid: true, success: 'Valid code format' };
};

/**
 * Check password strength and return visual indicator
 * @param {string} password - The password to check
 * @returns {string} - 'weak', 'medium', or 'strong'
 */
export const getPasswordStrength = (password: string) => {
  const validation = validatePassword(password);
  
  if (!validation.valid) {
    return 'weak';
  }
  
  // If it passes basic validation, check length for medium vs strong
  if (password.length >= 12) {
    return 'strong';
  }
  
  return 'medium';
};

// Enhanced password strength calculator
export const getPasswordStrengthDetailed = (password: string): {
  score: number; // 0-4
  label: string;
  color: string;
  suggestions: string[];
} => {
  let score = 0;
  const suggestions: string[] = [];
  
  if (password.length === 0) {
    return { score: 0, label: 'No password', color: 'gray', suggestions: ['Enter a password'] };
  }
  
  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  else suggestions.push('Use at least 12 characters for better security');
  
  // Character variety
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  else suggestions.push('Mix uppercase and lowercase letters');
  
  if (/[0-9]/.test(password)) score++;
  else suggestions.push('Add numbers');
  
  if (/[^A-Za-z0-9]/.test(password)) score++;
  else suggestions.push('Add special characters');
  
  // Avoid common patterns
  if (/(.)\1{2,}/.test(password)) {
    score = Math.max(0, score - 1);
    suggestions.push('Avoid repeating characters');
  }
  
  const strength = [
    { label: 'Very Weak', color: 'red' },
    { label: 'Weak', color: 'orange' },
    { label: 'Fair', color: 'yellow' },
    { label: 'Good', color: 'blue' },
    { label: 'Strong', color: 'green' }
  ];
  
  const result = strength[Math.min(score, 4)];
  return { score, label: result.label, color: result.color, suggestions };
};