
# Use a PHP 8.2 FPM base image
FROM php:8.2-fpm-alpine

# Set working directory
WORKDIR /var/www/html

# Install system dependencies
RUN apk add --no-cache \
    build-base \
    linux-headers \
    pcre-dev \
    libtool \
    autoconf \
    make \
    git \
    zip \
    unzip \
    libzip-dev \
    oniguruma-dev \
    # Extensions for Laravel
    && docker-php-ext-install pdo pdo_mysql exif pcntl bcmath zip \
    && docker-php-ext-install mbstring \
    && docker-php-ext-enable mbstring

# Install PECL extensions
RUN pecl install redis && docker-php-ext-enable redis

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Expose port 9000 for PHP-FPM
EXPOSE 9000

# Set the default command to run PHP-FPM
CMD ["php-fpm"]

