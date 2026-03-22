# Docker

Archivos de Docker Compose.

- `docker-compose.yml` - Configuración principal
- `docker-compose.override.yml` - Override para desarrollo local (se aplica automáticamente)
- `docker-compose.prod.yml` - Imágenes de producción

Ejecutar desde la raíz del proyecto:
```bash
npm run docker:up
# o
docker compose -f docker/docker-compose.yml up -d
```
