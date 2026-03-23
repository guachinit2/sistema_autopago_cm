/**
 * Tipos de Product (Producto)
 * Adaptado de backend-plan §3.1 al esquema database-plan (init-db.sql)
 *
 * Campos del plan original no en DB actual: pricePerKg, stock, minStock, isActive
 * (Fase 4 inventario / productos por peso)
 */
export interface Product {
  id: string;
  barcode: string;
  sku: string;
  name: string;
  price: number;
  category: string | null;
  imageUrl: string | null;
  weightBased: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductRow {
  id: string;
  barcode: string;
  sku: string;
  name: string;
  price: string;
  category: string | null;
  image_url: string | null;
  weight_based: boolean;
  created_at?: string;
  updated_at?: string;
}

export function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    barcode: row.barcode,
    sku: row.sku,
    name: row.name,
    price: parseFloat(row.price),
    category: row.category,
    imageUrl: row.image_url,
    weightBased: row.weight_based,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
