-- Inicialización de PostgreSQL para Autopago
-- Ejecutado automáticamente por el contenedor en primer arranque

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Fase 1: Productos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barcode VARCHAR(20) UNIQUE NOT NULL,
  sku VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  image_url VARCHAR(500),
  weight_based BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);

-- Seed mínimo para pruebas
INSERT INTO products (barcode, sku, name, price) VALUES
  ('12345678', 'SKU001', 'Producto prueba 1', 2.50),
  ('87654321', 'SKU002', 'Producto prueba 2', 5.99),
  ('11111111', 'SKU003', 'Leche 1L', 1.20),
  ('22222222', 'SKU004', 'Pan integral', 0.85)
ON CONFLICT (barcode) DO NOTHING;
