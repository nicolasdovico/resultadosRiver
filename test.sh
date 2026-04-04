#!/bin/bash

# Run backend tests
echo "Running Backend Tests..."
docker compose exec backend php artisan test

# Run frontend tests
# echo "Running Frontend Tests..."
# docker compose exec frontend-web npm run test:ci
