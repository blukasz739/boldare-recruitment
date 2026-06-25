FROM php:8.2-cli-alpine

# Systemowe zależności + rozszerzenia PHP wymagane przez Symfony i PostgreSQL
RUN apk add --no-cache \
    git \
    unzip \
    icu-dev \
    postgresql-dev \
    openssl \
    && docker-php-ext-install \
        intl \
        opcache \
        pdo_pgsql

# Composer — menedżer pakietów PHP (czyta composer.json)
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
