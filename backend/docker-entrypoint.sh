#!/bin/sh
set -e
cd /var/www/html

# Ensure storage and bootstrap/cache directories exist and are writable by both www-data and host user
mkdir -p storage/framework/views storage/framework/sessions storage/framework/cache/data storage/logs bootstrap/cache
chmod -R 777 storage bootstrap/cache

php artisan storage:link --force 2>/dev/null || true
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisor.conf
