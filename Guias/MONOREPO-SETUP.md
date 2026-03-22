# Monorepo Setup - Plan Simple

## 1. Instalar Turborepo

```bash
npm install -D turbo
```

## 2. Configurar package.json raíz

```json
{
  "name": "self-checkout-system",
  "private": true,
  "workspaces": ["apps/*", "packages/*", "libs/*"],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint"
  },
  "devDependencies": {
    "turbo": "^1.13.0"
  }
}
```

## 3. Crear turbo.json en raíz

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "dev": { "cache": false, "persistent": true },
    "test": {},
    "lint": {}
  }
}
```

## 4. Estructura de workspaces

```
apps/
  ├── backend/    (NestJS)
  └── frontend/   (React)
packages/
  ├── ui-components/
  └── utils/
libs/
  ├── scanner/
  ├── printer/
  └── payments/
```

## 5. Comandos útiles

```bash
# Instalar dependencia en todos los workspaces
npm install package-name -w apps/backend

# Ejecutar en todos los workspaces
npm run dev
npm run build

# Ejecutar en un workspace específico
npm run dev --workspace=apps/backend
```

## 6. Listo

El monorepo está configurado. Cada workspace tiene su propio package.json y puede ejecutarse de forma independiente o como parte del monorepo.