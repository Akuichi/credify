#!/bin/bash
set -e

echo "=== Setting up Credify ==="

# Step 1: Copy environment files
echo "=== Creating environment files ==="
cp backend/.env.example backend/.env
echo "=== Environment setup done! ==="

# Step 2: Modify docker-compose.yml to avoid vendor mount issues
echo "=== Creating docker-compose.yml backup ==="
cp docker-compose.yml docker-compose.yml.bak

echo "=== Execute docker compose build... ==="
docker compose build
echo "=== docker compose build is done! ==="

# Step 3: Installing composer dependencies
echo "=== Installing composer dependencies... ==="
docker compose run --rm app composer install
echo "=== Composer install is done! ==="

# Step 4: Generate application key
echo "=== Generating the app key ==="
docker compose run --rm app php artisan key:generate
echo "=== App key generated successfully! ==="

# Step 5: Create storage links
echo "=== Creating storage links ==="
docker compose run --rm app php artisan storage:link
echo "=== Storage links created! ==="

# Step 6: Migrating and seeding database
echo "=== Migrating and seeding database ==="
docker compose run --rm app php artisan migrate:fresh --seed
echo "=== Database setup complete! ==="

# Step 7: Clear cache
echo "=== Clearing cache ==="
docker compose run --rm app php artisan cache:clear
docker compose run --rm app php artisan config:cache
echo "=== Cache cleared! ==="

echo "=== Setup complete! ==="
echo "You can now run 'docker compose up' to start the application."
echo "- Backend API: http://localhost:8000"
echo "- Frontend: http://localhost:3000"