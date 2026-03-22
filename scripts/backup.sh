#!/bin/bash
# scripts/backup.sh - Backup de PostgreSQL y Redis

set -e

cd "$(dirname "$0")/.."

BACKUP_DIR="backups/$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "💾 Creando backup..."

# Backup de PostgreSQL (solo si el contenedor está corriendo)
if docker ps --format '{{.Names}}' | grep -q '^autopago-db$'; then
    docker exec autopago-db pg_dump -U postgres autopago > "$BACKUP_DIR/postgres_$TIMESTAMP.sql"
    gzip "$BACKUP_DIR/postgres_$TIMESTAMP.sql"
    echo "   ✅ PostgreSQL guardado en $BACKUP_DIR/postgres_$TIMESTAMP.sql.gz"
else
    echo "   ⚠️  Contenedor autopago-db no está corriendo, omitiendo backup de PostgreSQL"
fi

# Backup de Redis (solo si el contenedor está corriendo)
if docker ps --format '{{.Names}}' | grep -q '^autopago-redis$'; then
    docker exec autopago-redis redis-cli BGSAVE
    sleep 1
    docker cp autopago-redis:/data/dump.rdb "$BACKUP_DIR/redis_$TIMESTAMP.rdb"
    echo "   ✅ Redis guardado en $BACKUP_DIR/redis_$TIMESTAMP.rdb"
else
    echo "   ⚠️  Contenedor autopago-redis no está corriendo, omitiendo backup de Redis"
fi

echo ""
echo "✅ Backup completado en $BACKUP_DIR"

# Limpiar backups antiguos (más de 7 días)
if command -v find &> /dev/null; then
    find backups -mindepth 1 -maxdepth 1 -type d -mtime +7 -exec rm -rf {} \; 2>/dev/null || true
    echo "   Limpieza: backups >7 días eliminados"
fi
