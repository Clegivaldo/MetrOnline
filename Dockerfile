# Dockerfile para Sistema de Certificados Laravel + React
FROM node:20 AS build-frontend
WORKDIR /app
COPY . .
WORKDIR /app/sistema-metrologia-laravel
RUN npm install && npm run build

FROM composer:2.7 AS build-backend
WORKDIR /app
COPY . .
WORKDIR /app/sistema-metrologia-laravel
RUN composer install --no-dev --optimize-autoloader

FROM php:8.2-fpm
WORKDIR /var/www
RUN apt-get update && apt-get install -y \
    libpng-dev libjpeg-dev libfreetype6-dev zip git unzip libonig-dev libxml2-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd

# Instalar Node.js para queue e npm scripts
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

COPY --from=build-backend /app/sistema-metrologia-laravel /var/www
COPY --from=build-frontend /app/sistema-metrologia-laravel/public/build /var/www/public/build

RUN chown -R www-data:www-data /var/www && chmod -R 755 /var/www/storage

# Copiar entrypoint
COPY ./sistema-metrologia-laravel/docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000
ENTRYPOINT ["/entrypoint.sh"] 