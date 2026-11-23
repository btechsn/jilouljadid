#!/bin/sh
# entrypoint.sh — Point d'entrée pour les conteneurs PHP Jiloul Jadid

set -e

# Attendre PostgreSQL
if [ -n "$DB_HOST" ]; then
    echo "Waiting for PostgreSQL..."
    until nc -z -w30 "$DB_HOST" "${DB_PORT:-5432}"; do
        sleep 2
    done
    echo "PostgreSQL ready"
fi

# Attendre Redis
if [ -n "$REDIS_HOST" ]; then
    echo "Waiting for Redis..."
    until nc -z -w30 "$REDIS_HOST" "${REDIS_PORT:-6379}"; do
        sleep 2
    done
    echo "Redis ready"
fi

# Composer (une seule fois, sous verrou)
if [ ! -f vendor/autoload.php ]; then
    echo "Installing Composer dependencies..."
    mkdir -p storage/framework bootstrap/cache
    (
        flock -x 200
        if [ ! -f vendor/autoload.php ]; then
            composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist
        fi
    ) 200>storage/framework/.composer-install.lock
fi

# Optimisations Laravel uniquement pour php-fpm (évite les courses avec queue/reverb)
if [ "$1" = "php-fpm" ] && [ "${APP_ENV:-production}" = "production" ] && [ -n "$APP_KEY" ]; then
    echo "Optimizing Laravel..."
    rm -f bootstrap/cache/config.php
    php artisan config:cache || true
    php artisan route:cache || true
    php artisan view:cache || true
fi

if [ ! -L "public/storage" ] && [ -f artisan ]; then
    php artisan storage:link || true
fi

if [ "$1" = "php-fpm" ] && [ -f artisan ]; then
    php artisan filament:assets || true
fi

chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

echo "Starting $*"
exec "$@"
