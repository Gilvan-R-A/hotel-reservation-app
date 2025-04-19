FROM php:8.2-cli

WORKDIR /app

COPY backend /app/

EXPOSE 10000

CMD [ "php", "-S", "0.0.0.0:10000", "-t", "public" ]