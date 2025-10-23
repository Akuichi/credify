# Credify — Secure PayPal-like Application

A secure PayPal-like application that implements user registration, authentication, and two-factor authentication (2FA). Built with Laravel 12 (backend), React + Vite + Tailwind (frontend), and PostgreSQL, containerized with Docker Compose.

## Features

- **Secure User Authentication**
  - Registration with email & strong password validation
  - Login with rate limiting and CSRF protection
  - Session-based authentication with Laravel Sanctum

- **Two-Factor Authentication (2FA)**
  - QR code setup with Google Authenticator (SVG-based)
  - TOTP (Time-based One-Time Password) verification
  - 2FA management (enable/disable)
  - Compatible with any TOTP authenticator app

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

### Using Setup Script (Recommended)

We've provided setup scripts to make the installation process easier:

#### Linux/macOS
```bash
git clone https://github.com/Akuichi/credify.git
cd credify
chmod +x setup.sh
./setup.sh
```

#### Windows
```powershell
git clone https://github.com/Akuichi/credify.git
cd credify
.\setup.bat
```

After running the setup script, start the application with:
```bash
docker compose up
```

### Manual Setup

1. Clone the repository
```bash
git clone https://github.com/Akuichi/credify.git
cd credify
```

2. Copy environment files
```bash
cp backend/.env.example backend/.env
```

3. Install composer dependencies (critical step)
```bash
# Option 1: Install locally (recommended)
cd backend
composer install
cd ..

# Option 2: Install via Docker
docker compose run --rm app composer install
```

4. Build and start the Docker containers
```bash
docker compose up --build
```

5. In a new terminal, run the setup commands
```bash
# Generate application key
docker compose exec app php artisan key:generate

# Create storage links
docker compose exec app php artisan storage:link

# Run database migrations
docker compose exec app php artisan migrate --seed

# Clear cache
docker compose exec app php artisan cache:clear
docker compose exec app php artisan config:cache
```

6. Configure email settings in `.env`
```bash
# Edit the backend/.env file and configure email settings
# See "Email Configuration" section below for details
```

7. Access the application
   - Frontend: http://localhost:3000
   - API: http://localhost:8000/api

## Troubleshooting

If you encounter issues with missing vendor directory:
```
Warning: require(/var/www/vendor/autoload.php): Failed to open stream
```

The most common issue is that the vendor directory is being overwritten. Try:
1. Install dependencies locally (see step 3 above)
2. Or remove the vendor mount from docker-compose.yml:
   ```
   # Comment out this line:
   # - ./backend/vendor:/var/www/vendor
   ```

## Email Configuration

The application supports multiple email providers. Choose one of the following options:

### Mailtrap (Recommended for Development)

1. Create a free account at [Mailtrap](https://mailtrap.io/)
2. Go to your Mailtrap inbox
3. Click on "SMTP Settings" and select "Laravel" from the dropdown
4. Copy the provided credentials
5. Update the following values in your `.env` file:
```
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mailtrap_username
MAIL_PASSWORD=your_mailtrap_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@credify.test"
MAIL_FROM_NAME="${APP_NAME}"
```

### Gmail SMTP (For Testing/Production)

1. Create or use an existing Gmail account
2. Enable 2-Factor Authentication for that account at [Google Account Security](https://myaccount.google.com/security)
3. Generate an App Password:
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Other" in the app dropdown
   - Enter "Credify" (or your preferred name)
   - Click "Create"
   - Copy the 16-character password that appears
4. Update the following values in your `.env` file:
```
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_gmail_address@gmail.com
MAIL_PASSWORD=your_16_character_app_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your_gmail_address@gmail.com
MAIL_FROM_NAME="${APP_NAME}"
```
> **Important**: Do not use spaces in the app password. Copy the password exactly as shown.

### SendGrid (For Production)

1. Create a free account at [SendGrid](https://sendgrid.com/)
2. Generate an API key with "Mail Send" permissions
3. Update the following values in your `.env` file:
```
MAIL_MAILER=sendgrid
MAIL_SENDGRID_API_KEY=your_sendgrid_api_key_here
MAIL_FROM_ADDRESS="noreply@yourdomain.com"
MAIL_FROM_NAME="${APP_NAME}"
```

## Security Features

- Bcrypt password hashing
- CSRF protection
- Rate limiting on authentication endpoints
- Secure session management
- Two-factor authentication (TOTP)
- Login activity logging
- Multiple session management and control
- Remote session termination
- Email verification