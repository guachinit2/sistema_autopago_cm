# Plan DevOps: Sistema de Autopago

## Estado de Implementación

| Fase | Descripción                                                | Estado           |
| ---- | ---------------------------------------------------------- | ---------------- |
| 1    | Estructura de carpetas del proyecto                        | ✅ Completado    |
| 2    | Arquitectura de contenedores (docker-compose, Dockerfiles) | ✅ Completado    |
| 3    | Configuración de Nginx                                     | ✅ Completado    |
| 4    | Scripts de infraestructura                                 | ⚠️ Parcial       |
| 4.1  | Script de inicialización (setup.sh)                        | ⏳ Pendiente     |
| 4.2  | Script de migraciones (migrate.sh)                         | ⏳ Pendiente     |
| 4.3  | Script de backup (backup.sh)                               | ⏳ Pendiente     |
| 5    | Pipeline de CI/CD (GitHub Actions)                         | ⏳ Pendiente     |
| 6    | Checklist y tareas semanales                               | ⏳ Pendiente     |
| 7    | Comandos de uso rápido                                     | 📖 Documentación |

---

## 1. Estructura de Carpetas del Proyecto

```
sistema_autopago_cm/
├── apps/
│   ├── backend/                 # NestJS API
│   │   ├── src/
│   │   │   ├── modules/         # Módulos de negocio
│   │   │   ├── common/          # Utilidades compartidas
│   │   │   ├── config/          # Configuraciones
│   │   │   └── main.ts          # Entry point
│   │   ├── test/                # Tests
│   │   ├── Dockerfile
│   │   ├── docker-compose.override.yml
│   │   └── package.json
│   │
│   └── frontend/                # React + Vite
│       ├── src/
│       │   ├── components/      # Componentes React
│       │   ├── hooks/           # Custom hooks
│       │   ├── services/        # Servicios API
│       │   ├── stores/          # Estado global
│       │   ├── pages/           # Páginas
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── Dockerfile
│       ├── docker-compose.override.yml
│       └── package.json
│
├── packages/
│   ├── ui-components/           # Componentes compartidos
│   ├── utils/                   # Utilidades compartidas
│   └── config/                  # Configuraciones TS/ESLint
│
├── libs/
│   ├── scanner/                 # Wrapper html5-qrcode
│   ├── printer/                 # Wrapper node-escpos
│   └── payments/                # Adaptadores de pago
│
├── infrastructure/
│   ├── docker/
│   │   ├── nginx/
│   │   │   ├── Dockerfile
│   │   │   ├── nginx.conf
│   │   │   └── default.conf
│   │   └── redis/
│   │       └── Dockerfile
│   │
│   ├── kubernetes/
│   │   ├── base/                # K8s manifests base
│   │   ├── staging/
│   │   └── production/
│   │
│   └── terraform/               # Infra as Code (opcional)
│
├── scripts/
│   ├── setup.sh                 # Script de inicialización
│   ├── migrate.sh               # Migraciones DB
│   ├── seed.sh                  # Seed de datos
│   └── backup.sh                # Backup de DB
│
├── docker-compose.yml           # Compose principal
├── docker-compose.override.yml  # Override local
├── turbo.json                   # Turborepo config
├── package.json                 # Root package.json
├── tsconfig.json                # TS config base
└── README.md
```

---

## 2. Arquitectura de Contenedores

### 2.1 Servicios Base (docker-compose.yml)

```yaml
version: '3.8'

services:
  # Base de datos principal
  postgres:
    image: postgres:15-alpine
    container_name: autopago-db
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-autopago}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sh:/docker-entrypoint-initdb.d/init.sh
    ports:
      - '5432:5432'
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - autopago-network

  # Cache y sesiones
  redis:
    image: redis:7-alpine
    container_name: autopago-redis
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - '6379:6379'
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - autopago-network

  # Servidor de tiempo real
  socket-server:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile.socket
    container_name: autopago-socket
    environment:
      - NODE_ENV=development
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - PORT=3002
    ports:
      - '3002:3002'
    depends_on:
      redis:
        condition: service_healthy
    networks:
      - autopago-network
    volumes:
      - ./apps/backend:/app
      - /app/node_modules

  # Backend API
  backend:
    build:
      context: ./apps/backend
      dockerfile: Dockerfile
    container_name: autopago-backend
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/autopago
      - REDIS_URL=redis://redis:6379
      - SOCKET_URL=http://localhost:3002
      - JWT_SECRET=${JWT_SECRET:-dev-secret-key}
      - PORT=3001
    ports:
      - '3001:3001'
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - autopago-network
    volumes:
      - ./apps/backend:/app
      - /app/node_modules

  # Frontend
  frontend:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile
    container_name: autopago-frontend
    environment:
      - VITE_API_URL=http://localhost:3001
      - VITE_SOCKET_URL=http://localhost:3002
    ports:
      - '3000:3000'
    depends_on:
      - backend
    networks:
      - autopago-network
    volumes:
      - ./apps/frontend:/app
      - /app/node_modules

  # Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: autopago-nginx
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./infrastructure/docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./infrastructure/docker/nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - backend
      - frontend
      - socket-server
    networks:
      - autopago-network

volumes:
  postgres_data:
  redis_data:

networks:
  autopago-network:
    driver: bridge
```

### 2.2 Dockerfiles

**Backend Dockerfile:**

```dockerfile
# apps/backend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main.js"]
```

**Frontend Dockerfile:**

```dockerfile
# apps/frontend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY ./infrastructure/docker/nginx/frontend.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Socket Server Dockerfile:**

```dockerfile
# apps/backend/Dockerfile.socket
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY ./dist/socket ./socket

EXPOSE 3002

CMD ["node", "socket/index.js"]
```

---

## 3. Configuración de Nginx

```nginx
# infrastructure/docker/nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    sendfile on;
    keepalive_timeout 65;

    gzip on;
    gzip_types text/plain application/json application/javascript text/css;

    upstream backend {
        server backend:3001;
    }

    upstream frontend {
        server frontend:3000;
    }

    upstream socket {
        server socket-server:3002;
    }

    server {
        listen 80;
        server_name localhost;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_cache_bypass $http_upgrade;
        }

        # API
        location /api {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # Socket.io
        location /socket.io {
            proxy_pass http://socket;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

---

## 4. Scripts de Infraestructura

### 4.1 Script de Inicialización

```bash
#!/bin/bash
# scripts/setup.sh

set -e

echo "🚀 Configurando entorno de desarrollo..."

# Verificar Docker y Docker Compose
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado"
    exit 1
fi

# Crear directorios necesarios
mkdir -p data/postgres data/redis logs

# Copiar archivo de entorno si no existe
if [ ! -f .env ]; then
    echo "📄 Creando archivo .env..."
    cp .env.example .env
fi

# Levantar servicios base
echo "🐳 Levantando servicios base (PostgreSQL, Redis)..."
docker-compose up -d postgres redis

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a PostgreSQL..."
until docker exec autopago-db pg_isready -U postgres -q; do
    sleep 2
done
echo "✅ PostgreSQL listo"

# Instalar dependencias
echo "📦 Instalando dependencias..."
cd apps/backend && npm install && cd ../..
cd apps/frontend && npm install && cd ../..

# Ejecutar migraciones
echo "🗄️ Ejecutando migraciones..."
cd apps/backend && npm run migration:run && cd ../..

# Ejecutar seed
echo "🌱 Ejecutando seed de datos..."
cd apps/backend && npm run seed && cd ../..

# Levantar todos los servicios
echo "🐳 Levantando todos los servicios..."
docker-compose up -d

echo ""
echo "✅ Entorno listo!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo "   API Docs: http://localhost:3001/api"
echo "   Socket:   ws://localhost:3002"
```

### 4.2 Script de Migraciones

```bash
#!/bin/bash
# scripts/migrate.sh

cd apps/backend

# Ejecutar migraciones pendientes
npm run migration:run

# O regenerar base de datos (cuidado en producción)
# npm run migration:drop
# npm run migration:run
# npm run seed
```

### 4.3 Script de Backup

```bash
#!/bin/bash
# scripts/backup.sh

BACKUP_DIR="backups/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "💾 Creando backup..."

# Backup de PostgreSQL
docker exec autopago-db pg_dump -U postgres autopago > "$BACKUP_DIR/postgres_$TIMESTAMP.sql"

# Backup de Redis
docker exec autopago-redis redis-cli BGSAVE
docker cp autopago-redis:/data/dump.rdb "$BACKUP_DIR/redis_$TIMESTAMP.rdb"

# Comprimir
gzip "$BACKUP_DIR/postgres_$TIMESTAMP.sql"

echo "✅ Backup creado en $BACKUP_DIR"

# Limpiar backups antiguos (más de 7 días)
find backups -type d -mtime +7 -exec rm -rf {} \;
```

---

## 5. Pipeline de CI/CD (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: autopago_test
        ports: 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7-alpine
        ports: 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/autopago_test
          REDIS_URL: redis://localhost:6379

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push backend
        uses: docker/build-push-action@v5
        with:
          context: ./apps/backend
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-backend:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build and push frontend
        uses: docker/build-push-action@v5
        with:
          context: ./apps/frontend
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-frontend:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Deploy to staging
        run: |
          echo "Deploying to staging..."
          # kubectl apply -f kubernetes/staging/
          # o docker-compose -f docker-compose.staging.yml up -d

  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to production
        run: |
          echo "Deploying to production..."
          # kubectl apply -f kubernetes/production/
          # o docker-compose -f docker-compose.prod.yml up -d
```

---

## 6. Checklist de Tareas DevOps

### Semana 1-2: Infraestructura Base ✅

- [x] Crear estructura de directorios del proyecto
- [x] Configurar monorepo con Turborepo
- [x, 4.2 y 4.3
  ] Crear docker-compose.yml base
- [x] Configurar PostgreSQL con Docker
- [x] Configurar Redis con Docker
- [x] Crear script setup.sh
- [ ] Documentar requisitos de instalación

### Semana 3-4: Backend y Frontend ✅

- [x] Crear Dockerfile para backend
- [x] Crear Dockerfile para frontend
- [x] Configurar nginx como reverse proxy
- [x] Configurar red entre contenedores
- [x] Crear scripts de migrate.sh y seed.sh
- [x] Configurar variables de entorno
- [ ] Probar entorno completo local

### Semana 5-6: CI/CD y Calidad

- [ ] Configurar GitHub Actions
- [ ] Implementar pipeline de lint
- [ ] Implementar pipeline de tests
- [ ] Configurar Codecov
- [ ] Configurar build de imágenes Docker
- [ ] Configurar deployment a staging
- [ ] Documentar pipeline

### Semana 7-12: Monitoreo y Producción

- [ ] Configurar health checks
- [ ] Configurar logging estructurado
- [ ] Configurar ambiente de staging
- [ ] Configurar backups automáticos
- [ ] Configurar SSL/TLS
- [ ] Configurar balanceo de carga
- [ ] Documentar procedimientos de deployment

### Semana 13-18: Kubernetes (Opcional)

- [ ] Crear Helm charts
- [ ] Configurar K8s manifests
- [ ] Configurar auto-scaling
- [ ] Configurar service mesh
- [ ] Implementar distributed tracing
- [ ] Documentar arquitectura K8s

---

## 7. Comandos de Uso Rápido

```bash
# Inicializar entorno completo
./scripts/setup.sh

# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Reiniciar un servicio
docker-compose restart backend

# Ver estado de servicios
docker-compose ps

# Ejecutar comandos en contenedor
docker-compose exec backend sh

# Backup de base de datos
./scripts/backup.sh

# Ver métricas de contenedores
docker stats
```

---

_Este documento debe ser actualizado conforme avance el proyecto y se agreguen nuevas configuraciones de infraestructura._
