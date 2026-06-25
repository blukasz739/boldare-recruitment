#!/bin/sh
set -e

cd /app

echo "Installing PHP dependencies..."
composer install --no-interaction --no-blocking

if [ ! -f config/jwt/private.pem ]; then
  echo "Generating JWT key pair..."
  php bin/console lexik:jwt:generate-keypair --overwrite --no-interaction
fi

echo "Running database migrations..."
php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration

echo "Starting application..."
exec "$@"
