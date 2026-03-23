# database/

Esquema y datos según `Guias/database-plan.md`.

- **Esquema:** `scripts/init-db.sql` (ejecutado por el contenedor PostgreSQL)
- **Migrations:** No aplica (usamos init-db directo)
- **Seeds:** Incluidos en init-db.sql; datos extra en `scripts/seed/`

Para TypeORM/Prisma en fases posteriores, revisar database-plan.
