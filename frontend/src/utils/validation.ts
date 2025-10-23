/**
 * Frontend validation utilities for password strength
 * (complementing the backend Laravel validation)
 */

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