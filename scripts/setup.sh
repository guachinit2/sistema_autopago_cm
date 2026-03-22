#!/bin/bash
# scripts/setup.sh - Configuración del entorno de desarrollo

set -e

cd "$(dirname "$0")/.."

echo "🚀 Configurando entorno de desarrollo..."

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    exit 1
fi

# Verificar Docker Compose (v2: docker compose, v1: docker-compose)
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    echo "❌ Docker Compose no está instalado"
    exit 1
fi

# Crear directorios necesarios
mkdir -p data/postgres data/redis logs backups

# Copiar archivo de entorno si no existe
if [ ! -f .env ]; then
    echo "📄 Creando archivo .env..."
    cp .env.example .env
    echo "   ⚠️  Revisa y edita .env con tus valores"
fi

# Levantar servicios base
echo "🐳 Levantando servicios base (PostgreSQL, Redis)..."
$DOCKER_COMPOSE up -d postgres redis

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a PostgreSQL..."
until docker exec autopago-db pg_isready -U postgres -q 2>/dev/null; do
    sleep 2
done
echo "✅ PostgreSQL listo"

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Ejecutar migraciones
echo "🗄️ Ejecutando migraciones..."
(cd apps/backend && npm run migration:run) || true

# Ejecutar seed
echo "🌱 Ejecutando seed de datos..."
(cd apps/backend && npm run seed) || true

# Levantar todos los servicios
echo "🐳 Levantando todos los servicios..."
$DOCKER_COMPOSE up -d

echo ""
echo "✅ Entorno listo!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo "   Nginx:     http://localhost:80"
echo "   Socket:    ws://localhost:3002"
