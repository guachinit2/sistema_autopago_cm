import { pool } from '../../db';
import { type Product, type ProductRow, rowToProduct } from '../../database/types';

/**
 * Servicio de productos
 * Referencia: backend-plan §6.1 ProductService
 */
export const productsService = {
  async findByBarcode(barcode: string): Promise<Product | null> {
    const trimmed = barcode?.trim();
    if (!trimmed) return null;

    const result = await pool.query<ProductRow>(
      'SELECT id, barcode, sku, name, price, category, image_url, weight_based FROM products WHERE barcode = $1',
      [trimmed]
    );

    if (result.rows.length === 0) return null;
    return rowToProduct(result.rows[0]);
  },

  async findById(id: string): Promise<Product | null> {
    const result = await pool.query<ProductRow>(
      'SELECT id, barcode, sku, name, price, category, image_url, weight_based FROM products WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) return null;
    return rowToProduct(result.rows[0]);
  },
};
