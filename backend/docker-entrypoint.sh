#!/bin/bash
set -e

cd /var/www

if [ ! -f artisan ]; then
  echo "artisan not found — creating Laravel 12 project into /tmp/laravel"
  composer create-project laravel/laravel /tmp/laravel "12.*" --no-interaction --prefer-dist
  echo "Copying fresh Laravel files into /var/www (preserving existing files)"
  cp -a /tmp/laravel/. /var/www/
fi

# Ensure composer dependencies are installed (best-effort)
if [ -f composer.json ]; then
  composer install --no-interaction || true
fi

# Ensure storage and cache directories exist
mkdir -p storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache || true

echo "Starting Laravel dev server"
exec php artisan serve --host=0.0.0.0 --port=8000
