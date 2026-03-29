#!/bin/sh
set -e
cd /var/www/html
php artisan storage:link --force 2>/dev/null || true
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisor.conf
