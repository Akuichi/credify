FROM php:8.0-cli

WORKDIR /var/www

COPY . .

RUN apt-get update && apt-get install -y \
	libpng-dev \
	libjpeg-dev \
	libfreetype6-dev \
	&& docker-php-ext-configure gd --with-freetype --with-jpeg \
	&& docker-php-ext-install gd

RUN composer install

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
FROM php:8.3-cli

ARG DEBIAN_FRONTEND=noninteractive

WORKDIR /var/www

# System deps and PHP extensions commonly required by Laravel
RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
		git \
		unzip \
		libpq-dev \
		libzip-dev \
		libpng-dev \
		libonig-dev \
		zlib1g-dev \
	&& docker-php-ext-install pdo pdo_pgsql pgsql mbstring zip exif pcntl bcmath gd \
	&& rm -rf /var/lib/apt/lists/*

# Install Composer
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
	&& php composer-setup.php --install-dir=/usr/local/bin --filename=composer \
	&& php -r "unlink('composer-setup.php');"

# Copy project files
COPY . /var/www

# Install PHP dependencies (best-effort during image build)
RUN if [ -f composer.json ]; then composer install --no-interaction --prefer-dist --optimize-autoloader || true; fi

# Optional: install node if frontend build required in backend image (not required here)

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
