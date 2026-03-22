# Config

Configuraciones compartidas del proyecto.

- `eslint.config.cjs` - ESLint (TypeScript, React)
- `prettier.json` - Prettier
- `prettierignore` - Archivos ignorados por Prettier
- `tsconfig.base.json` - TypeScript base
- `env.example` - Plantilla de variables de entorno (copiar a `.env` en raíz)

## Archivos que deben permanecer en la raíz

Los siguientes archivos **no pueden moverse** porque las herramientas los buscan en la raíz del proyecto:

| Archivo | Motivo |
|---------|--------|
| `package.json` | Punto de entrada de npm/Node.js |
| `package-lock.json` | Lockfile de npm, debe estar junto a package.json |
| `pnpm-workspace.yaml` | pnpm busca workspaces en la raíz |
| `pnpm-lock.yaml` | Lockfile de pnpm |
| `turbo.json` | Turborepo solo lee config desde la raíz |
| `tsconfig.json` | TypeScript e IDEs lo buscan en la raíz (extiende a `config/tsconfig.base.json`) |

**Recomendación:** Usa solo un package manager (npm o pnpm) para evitar duplicar lockfiles.
