# Development and Testing Guide

This document provides instructions for developers to work on and test the Credify application.

## Development Setup

### Prerequisites
- Docker and Docker Compose installed
- Git
- A web browser (Chrome recommended for testing)

### Local Development

1. Clone the repository and start containers:
```bash
git clone https://github.com/Akuichi/credify.git
cd credify
docker compose up --build
```

2. Run migrations and seeders:
```bash
docker compose exec app php artisan migrate --seed
```

3. Frontend development:
```bash
# If you want to run frontend separately
cd frontend
npm install
npm run dev
```

4. Access the development environment:
   - Frontend: http://localhost:3000
   - API: http://localhost:8000/api

## Testing

### Backend Testing

Run the Laravel test suite:
```bash
# Run all tests
docker compose exec app php artisan test

# Run specific test
docker compose exec app php artisan test tests/Feature/PasswordValidationTest.php
```

#### Password Validation Tests

We have a dedicated test file for password validation rules:
- `tests/Feature/PasswordValidationTest.php` - Tests that the password requirements enforce:
  - Minimum 8 characters
  - Mixed case (uppercase and lowercase letters)
  - Numbers
  - Special symbols/characters

To run just the password validation tests:
```bash
docker compose exec app php artisan test tests/Feature/PasswordValidationTest.php
```

#### Password Reset Tests

Tests for the password reset functionality:
- `tests/Feature/Auth/PasswordResetTest.php` - Tests for the password reset workflow:
  - Requesting a password reset token
  - Resetting a password with a valid token
  - Token expiration (1 hour)
  - Validation of email and token

To run just the password reset tests:
```bash
docker compose exec app php artisan test tests/Feature/Auth/PasswordResetTest.php
```

### Frontend Testing

Run React component tests:
```bash
cd frontend
npm test
```

### Manual Testing Checklist

#### User Registration
- [ ] Attempt registration with valid details
- [ ] Test validation errors (invalid email)
- [ ] Test password strength requirements:
  - [ ] Verify passwords without uppercase letters are rejected
  - [ ] Verify passwords without numbers are rejected
  - [ ] Verify passwords without special characters are rejected
  - [ ] Verify passwords shorter than 8 characters are rejected
  - [ ] Verify strong passwords meeting all criteria are accepted
- [ ] Verify user is created in the database

#### Password Reset
- [ ] Request password reset with valid email
- [ ] Verify reset link is sent to email
- [ ] Test password reset with valid token
- [ ] Test password reset with expired token (older than 1 hour)
- [ ] Test password reset with invalid token
- [ ] Verify password is updated after successful reset
- [ ] Test login with new password

#### Login
- [ ] Login with valid credentials
- [ ] Test rate limiting by multiple failed attempts
- [ ] Verify CSRF protection works

#### Two-Factor Authentication
- [ ] Enable 2FA by scanning QR code with Google Authenticator
- [ ] Verify code works for 2FA activation
- [ ] Test login flow with 2FA enabled
   - [ ] Enter credentials and verify you're redirected to 2FA verification
   - [ ] Enter correct verification code and verify you're redirected to dashboard
   - [ ] Verify you remain logged in after page refresh
- [ ] Test disabling 2FA from the dashboard
   - [ ] Click "Disable 2FA" button
   - [ ] Enter verification code from authenticator app
   - [ ] Verify 2FA is disabled after successful verification

#### Dashboard & Account Security
- [ ] Verify user information displays correctly
- [ ] Check last login information is accurate
- [ ] Test updating user profile information
- [ ] Verify active sessions are displayed correctly
- [ ] Test terminating individual sessions
- [ ] Test "Sign out other sessions" functionality

#### Logout
- [ ] Verify logout works and invalidates session
- [ ] Test accessing protected routes after logout

## Security Testing

### CSRF Testing
- [ ] Verify CSRF token is required for state-changing requests
- [ ] Test cross-origin requests are properly handled

### Password Security
- [ ] Verify password hashing uses bcrypt
- [ ] Test password validation rules enforce strong passwords
- [ ] Verify password input fields don't show actual characters
- [ ] Test password change functionality requires old password

### Session Security
- [ ] Verify session cookies are HTTP-only
- [ ] Test session expiration works as expected
- [ ] Verify remote session termination works
- [ ] Test that sessions cannot be hijacked

### 2FA Security
- [ ] Verify 2FA cannot be bypassed
- [ ] Test temporary token expiration for 2FA verification

### API Security
- [ ] Test that unauthenticated requests to protected endpoints are rejected
- [ ] Verify rate limiting is working on auth endpoints

## Troubleshooting

### Two-Factor Authentication Issues

If you encounter issues with 2FA setup:

1. Check that the SVG QR code is being generated correctly
2. Ensure your authenticator app supports SVG QR codes
3. If you have issues scanning the QR code, manually enter the secret key in your authenticator app

### Common Issues

- **500 Error on 2FA Setup**: This implementation uses SVG QR codes which don't require the PHP Imagick extension. If you modify the code to use PNG QR codes, make sure the Imagick extension is installed in your Docker container.
- **2FA Code Not Working**: Ensure server and authenticator app time are in sync, as TOTP is time-based.
- **Authentication Issues After 2FA**: The app uses a combination of cookie-based and token-based authentication. Make sure the token is properly stored and included in API requests.
- **Logout Not Working**: If logout fails, try clearing local storage and cookies manually, then refresh the page.