# Sistema de Autopago

## Descripción

Sistema de autopago para mercados, inspirado en el modelo de Farmatodo.

## Requisitos

- Docker y Docker Compose
- Node.js 20+
- npm o yarn

## Instalación

1. Clonar el repositorio
2. Copiar `.env.example` a `.env` y configurar variables
3. Ejecutar `./scripts/setup.sh`

## Uso

```bash
# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

## Servicios

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Docs: http://localhost:3001/api
- Socket.io: ws://localhost:3002

## Estructura del Proyecto

```
sistema_autopago_cm/
├── apps/
│   ├── backend/     # API NestJS
│   └── frontend/    # React
├── packages/        # Paquetes compartidos
├── libs/            # Librerías de integración
├── infrastructure/  # Docker, K8s, Terraform
└── scripts/         # Scripts de utilidad
```

## Licencia

MIT
