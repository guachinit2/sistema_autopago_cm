#!/bin/bash
# scripts/migrate.sh - Ejecutar migraciones de base de datos

set -e

cd "$(dirname "$0")/../apps/backend"

echo "🗄️ Ejecutando migraciones pendientes..."
npm run migration:run

# Opciones para regenerar base de datos (solo desarrollo, cuidado en producción):
# npm run migration:drop
# npm run migration:run
# npm run seed
