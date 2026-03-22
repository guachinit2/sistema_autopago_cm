# Sistema de Autopago

## Descripción

Sistema de autopago para mercados, inspirado en el modelo de Farmatodo.

## Requisitos

- Docker y Docker Compose
- Node.js 20+
- npm o yarn

## Instalación

1. Clonar el repositorio
2. Copiar `config/env.example` a `.env` y configurar variables
3. Ejecutar `./scripts/setup.sh`

## Uso

```bash
# Levantar servicios
npm run docker:up
# o: docker compose up -d

# Ver logs
docker compose logs -f
```

## Servicios

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Docs: http://localhost:3001/api
- Socket.io: ws://localhost:3002

## Estructura del Proyecto

```
sistema_autopago_cm/
├── apps/            # Backend API, Frontend React
├── config/          # ESLint, Prettier, TypeScript, env.example
├── docker/          # README de Docker (compose en raíz)
├── Guias/           # Documentación del proyecto
├── infrastructure/  # Docker, K8s, Terraform
├── libs/            # Librerías de integración
├── packages/        # Paquetes compartidos
└── scripts/         # Scripts de utilidad
```

## Licencia

MIT
