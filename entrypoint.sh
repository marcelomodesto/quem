#!/bin/sh
set -e

echo "Running Prisma migrations..."
npx prisma@6.19.3 db push --accept-data-loss --skip-generate

echo "Starting Next.js..."
exec node server.js
