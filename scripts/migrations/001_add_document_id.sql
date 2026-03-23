-- Migración 3.2 + 3.3: document_id y cart_items (weight_kg, created_at)
-- Ejecutar en DB existente: docker exec -i autopago-db psql -U postgres -d autopago < scripts/migrations/001_add_document_id.sql

ALTER TABLE carts ADD COLUMN IF NOT EXISTS document_id VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS document_id VARCHAR(20);
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(10,3);
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
