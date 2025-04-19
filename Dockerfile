FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    unzip \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    curl \
    git \
    libzip-dev \
    default-mysql-client \
    && docker-php-ext-install pdo_mysql

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /app

COPY . /app/

RUN composer install

EXPOSE 10000

CMD [ "php", "-S", "0.0.0.0:10000", "-t", "backend/public" ]