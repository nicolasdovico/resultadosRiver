#!/bin/bash

# Run backend tests
echo "Running Backend Tests..."
docker compose exec backend php artisan test
TEST_EXIT_CODE=$?

# Ensure storage and cache permissions remain accessible for www-data and host user
docker compose exec backend chmod -R 777 storage bootstrap/cache 2>/dev/null || true

exit $TEST_EXIT_CODE

# Run frontend tests
# echo "Running Frontend Tests..."
# docker compose exec frontend-web npm run test:ci
