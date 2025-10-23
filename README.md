# Credify — Secure PayPal-like Application

A secure PayPal-like application that implements user registration, authentication, and two-factor authentication (2FA). Built with Laravel 12 (backend), React + Vite + Tailwind (frontend), and PostgreSQL, containerized with Docker Compose.

## Features

- **Secure User Authentication**
  - Registration with email & strong password validation
  - Login with rate limiting and CSRF protection
  - Session-based authentication with Laravel Sanctum

- **Two-Factor Authentication (2FA)**
  - QR code setup with Google Authenticator
  - TOTP (Time-based One-Time Password) verification
  - 2FA management (enable/disable)

- **User Dashboard**
  - Account information display
  - Security logs (last login, IP address)
  - 2FA status management
  - Active session management (view and terminate)

## Technology Stack

- **Backend**: Laravel 12 with Sanctum
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Database**: PostgreSQL 15
- **Containerization**: Docker Compose

## Quick Start

1. Clone the repository
```bash
git clone https://github.com/Akuichi/credify.git
cd credify
```

2. Start the Docker containers
```bash
docker compose up --build
```

3. Run migrations
```bash
docker compose exec app php artisan migrate --seed
```

4. Access the application
   - Frontend: http://localhost:3000
   - API: http://localhost:8000/api

## Security Features

- Bcrypt password hashing
- CSRF protection
- Rate limiting on authentication endpoints
- Secure session management
- Two-factor authentication (TOTP)
- Login activity logging
- Multiple session management and control
- Remote session termination