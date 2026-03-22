#!/bin/bash
# scripts/seed.sh - Ejecutar seed de datos iniciales

set -e

cd "$(dirname "$0")/../apps/backend"

echo "🌱 Ejecutando seed de datos..."
npm run seed
