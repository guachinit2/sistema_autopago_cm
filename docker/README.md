# Docker

Los archivos de Docker Compose están en la **raíz del proyecto**:

- `docker-compose.yml` - Configuración principal
- `docker-compose.override.yml` - Override para desarrollo local (se aplica automáticamente)
- `docker-compose.prod.yml` - Imágenes de producción

Ejecutar desde la raíz:
```bash
npm run docker:up
# o
docker compose up -d
```
