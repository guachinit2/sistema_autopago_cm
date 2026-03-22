import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

interface ProductRow {
  id: string;
  barcode: string;
  sku: string;
  name: string;
  price: string;
  category: string | null;
  image_url: string | null;
  weight_based: boolean;
}

router.get('/barcode/:barcode', async (req: Request, res: Response) => {
  const { barcode } = req.params;
  const trimmed = barcode?.trim();
  if (!trimmed) {
    res.status(400).json({ error: 'Barcode is required' });
    return;
  }

  try {
    const result = await pool.query<ProductRow>(
      'SELECT id, barcode, sku, name, price, category, image_url, weight_based FROM products WHERE barcode = $1',
      [trimmed]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const row = result.rows[0];
    res.json({
      id: row.id,
      barcode: row.barcode,
      sku: row.sku,
      name: row.name,
      price: parseFloat(row.price),
      category: row.category,
      imageUrl: row.image_url,
      weightBased: row.weight_based,
    });
  } catch (err) {
    console.error('Error fetching product by barcode:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
