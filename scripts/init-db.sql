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

-- Fase 2: Carritos y órdenes
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kiosk_id VARCHAR(50),
  document_id VARCHAR(20),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  weight_kg DECIMAL(10,3),
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cart_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES carts(id),
  document_id VARCHAR(20),
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fase 3: Métodos de pago y pagos
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  method_id UUID NOT NULL REFERENCES payment_methods(id),
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  reference VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);

-- Seed métodos de pago
INSERT INTO payment_methods (code, name) VALUES
  ('TARJETA', 'Tarjeta'),
  ('EFECTIVO', 'Efectivo'),
  ('PAGO_MOVIL', 'Pago móvil')
ON CONFLICT (code) DO NOTHING;

-- Migración 3.2: document_id para sesiones existentes
ALTER TABLE carts ADD COLUMN IF NOT EXISTS document_id VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS document_id VARCHAR(20);

-- Migración 3.3: weight_kg y created_at en cart_items
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(10,3);
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
