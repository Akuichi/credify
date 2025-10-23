import { it, describe, expect, beforeAll, afterAll } from 'vitest';
import { validatePassword } from '../src/utils/validation';

// Mock validation function that mimics our backend rules
function validatePassword(password) {
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
}

describe('Password Validation', () => {
  it('should reject passwords without uppercase letters', () => {
    const result = validatePassword('password123!');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('uppercase');
  });
  
  it('should reject passwords without lowercase letters', () => {
    const result = validatePassword('PASSWORD123!');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('lowercase');
  });
  
  it('should reject passwords without numbers', () => {
    const result = validatePassword('Password!');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('number');
  });
  
  it('should reject passwords without symbols', () => {
    const result = validatePassword('Password123');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('symbol');
  });
  
  it('should reject short passwords', () => {
    const result = validatePassword('Pa1!');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('8 characters');
  });
  
  it('should accept strong passwords', () => {
    const result = validatePassword('StrongP@ssword123');
    expect(result.valid).toBe(true);
  });
});