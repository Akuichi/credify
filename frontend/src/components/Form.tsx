import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FieldValidation } from '../utils/validation';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  validation?: FieldValidation;
  showValidation?: boolean;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  validation,
  showValidation = false,
  className = '', 
  ...props 
}) => {
  const hasError = error || (showValidation && validation && !validation.isValid && validation.error);
  const hasSuccess = showValidation && validation?.isValid && validation.success;
  const hasWarning = showValidation && validation?.warning;
  
  const errorMessage = error || validation?.error;
  const successMessage = validation?.success;
  const warningMessage = validation?.warning;
  
  // Generate unique IDs for ARIA
  const errorId = props.id ? `${props.id}-error` : undefined;
  const descriptionId = props.id ? `${props.id}-description` : undefined;

  return (
    <div className="mb-6">
      <label 
        className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2" 
        htmlFor={props.id}
      >
        {label}
        {props.required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      <div className="relative">
        <input
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={
            hasError ? errorId : 
            hasSuccess ? descriptionId : 
            hasWarning ? descriptionId : 
            undefined
          }
          aria-required={props.required}
          className={`w-full px-4 py-3 rounded-lg border ${
            hasError
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500 pr-10' 
              : hasSuccess
              ? 'border-green-500 focus:ring-green-500 focus:border-green-500 pr-10'
              : hasWarning
              ? 'border-yellow-500 focus:ring-yellow-500 focus:border-yellow-500 pr-10'
              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
          } focus:ring-2 focus:ring-offset-2 focus:outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${className}`}
          {...props}
        />
        
        {/* Validation Icon */}
        <AnimatePresence>
          {showValidation && validation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
              aria-hidden="true"
            >
              {validation.isValid && validation.success && (
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-label="Valid">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {!validation.isValid && validation.error && (
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20" aria-label="Invalid">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              {validation.warning && (
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" aria-label="Warning">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Validation Messages */}
      <AnimatePresence mode="wait">
        {hasError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center mt-2"
            id={errorId}
            role="alert"
            aria-live="polite"
          >
            <svg className="w-4 h-4 text-red-500 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-red-600 dark:text-red-400 text-sm">
              {errorMessage}
            </p>
          </motion.div>
        )}
        {hasSuccess && !hasError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center mt-2"
            id={descriptionId}
            role="status"
            aria-live="polite"
          >
            <svg className="w-4 h-4 text-green-500 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-green-600 dark:text-green-400 text-sm">{successMessage}</p>
          </motion.div>
        )}
        {hasWarning && !hasError && !hasSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center mt-2"
            id={descriptionId}
            role="status"
            aria-live="polite"
          >
            <svg className="w-4 h-4 text-yellow-500 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-yellow-600 dark:text-yellow-400 text-sm">{warningMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  loadingText?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  isLoading, 
  variant = 'primary',
  loadingText = 'Processing...',
  className = '', 
  ...props 
}) => {
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 focus:ring-gray-500 text-gray-800 dark:text-white',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:ring-red-500 text-white shadow-lg hover:shadow-xl',
  };

  return (
    <button
      aria-busy={isLoading}
      aria-disabled={isLoading || props.disabled}
      className={`w-full min-h-[44px] py-3 px-6 rounded-lg font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${variantClasses[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg 
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span aria-live="polite">{loadingText}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit: (e: React.FormEvent) => void;
  error?: string;
}

export const Form: React.FC<FormProps> = ({ children, error, className = '', ...props }) => {
  return (
    <form 
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl px-8 sm:px-12 py-10 ${className}`} 
      noValidate
      {...props}
    >
      {error && (
        <div 
          className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-700 p-4 rounded-lg mb-6 flex items-start" 
          role="alert"
          aria-live="assertive"
        >
          <svg 
            className="w-5 h-5 text-red-500 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-semibold text-red-800 dark:text-red-400">Error</p>
            <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}
      {children}
    </form>
  );
};