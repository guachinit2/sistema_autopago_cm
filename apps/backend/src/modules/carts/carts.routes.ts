import { Router, Request, Response } from 'express';
import { pool } from '../../db';

const router = Router();

interface CartRow {
  id: string;
  kiosk_id: string | null;
  document_id: string | null;
  status: string;
}

interface CartItemRow {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  weight_kg: string | null;
  unit_price: string;
  created_at: string | null;
}

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

router.post('/', async (req: Request, res: Response) => {
  const { documentId } = req.body as { documentId?: string };
  const docId = typeof documentId === 'string' && documentId.trim() ? documentId.trim() : null;
  try {
    const result = await pool.query<CartRow>(
      `INSERT INTO carts (status, document_id) VALUES ('active', $1) RETURNING id, kiosk_id, document_id, status`,
      [docId]
    );
    const cart = result.rows[0];
    res.status(201).json({ id: cart.id, status: cart.status });
  } catch (err) {
    console.error('Error creating cart:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:cartId', async (req: Request, res: Response) => {
  const { cartId } = req.params;
  try {
    const cartResult = await pool.query<CartRow>(
      'SELECT id, kiosk_id, document_id, status FROM carts WHERE id = $1',
      [cartId]
    );
    if (cartResult.rows.length === 0) {
      res.status(404).json({ error: 'Cart not found' });
      return;
    }
    const cart = cartResult.rows[0];
    if (cart.status !== 'active') {
      res.status(400).json({ error: 'Cart is not active' });
      return;
    }
    const itemsResult = await pool.query<CartItemRow & ProductRow>(
      `SELECT ci.id, ci.cart_id, ci.product_id, ci.quantity, ci.weight_kg, ci.unit_price, ci.created_at,
              p.barcode, p.sku, p.name, p.price, p.category, p.image_url, p.weight_based
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.cart_id = $1`,
      [cartId]
    );
    const items = itemsResult.rows.map((row) => ({
      id: row.id,
      productId: row.product_id,
      quantity: row.quantity,
      weightKg: row.weight_kg != null ? parseFloat(row.weight_kg) : null,
      unitPrice: parseFloat(row.unit_price),
      product: {
        id: row.product_id,
        barcode: row.barcode,
        sku: row.sku,
        name: row.name,
        price: parseFloat(row.price),
        category: row.category,
        imageUrl: row.image_url,
        weightBased: row.weight_based,
      },
    }));
    res.json({ id: cart.id, status: cart.status, documentId: cart.document_id, items });
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:cartId/items', async (req: Request, res: Response) => {
  const { cartId } = req.params;
  const { productId, quantity = 1, weightKg } = req.body as {
    productId?: string;
    quantity?: number;
    weightKg?: number;
  };
  if (!productId) {
    res.status(400).json({ error: 'productId is required' });
    return;
  }
  const qty = weightKg != null && weightKg > 0 ? 1 : Math.max(1, Math.floor(quantity));
  const wKg = weightKg != null && weightKg > 0 ? Math.round(weightKg * 1000) / 1000 : null;

  try {
    const cartResult = await pool.query('SELECT id, status FROM carts WHERE id = $1', [cartId]);
    if (cartResult.rows.length === 0) {
      res.status(404).json({ error: 'Cart not found' });
      return;
    }
    if (cartResult.rows[0].status !== 'active') {
      res.status(400).json({ error: 'Cart is not active' });
      return;
    }

    const priceResult = await pool.query('SELECT price FROM products WHERE id = $1', [productId]);
    if (priceResult.rows.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    const unitPrice = parseFloat(priceResult.rows[0].price);

    await pool.query(
      `INSERT INTO cart_items (cart_id, product_id, quantity, weight_kg, unit_price)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (cart_id, product_id)
       DO UPDATE SET quantity = CASE WHEN $4 IS NOT NULL THEN 1 ELSE cart_items.quantity + $3 END,
                     weight_kg = COALESCE($4, cart_items.weight_kg),
                     unit_price = $5`,
      [cartId, productId, qty, wKg, unitPrice]
    );

    const row = await pool.query<CartItemRow & ProductRow>(
      `SELECT ci.id, ci.quantity, ci.weight_kg, ci.unit_price, ci.created_at,
              p.id as product_id, p.barcode, p.sku, p.name, p.price, p.category, p.image_url, p.weight_based
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.cart_id = $1 AND ci.product_id = $2`,
      [cartId, productId]
    );

    const r = row.rows[0];
    res.status(201).json({
      id: r.id,
      quantity: r.quantity,
      weightKg: r.weight_kg != null ? parseFloat(r.weight_kg) : null,
      unitPrice: parseFloat(r.unit_price),
      product: {
        id: r.product_id,
        barcode: r.barcode,
        sku: r.sku,
        name: r.name,
        price: parseFloat(r.price),
        category: r.category,
        imageUrl: r.image_url,
        weightBased: r.weight_based,
      },
    });
  } catch (err) {
    console.error('Error adding item to cart:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:cartId/items/:itemId', async (req: Request, res: Response) => {
  const { cartId, itemId } = req.params;
  const { quantity, weightKg } = req.body as { quantity?: number; weightKg?: number };
  if (quantity !== undefined && quantity < 0) {
    res.status(400).json({ error: 'quantity must be non-negative' });
    return;
  }
  if (weightKg !== undefined && weightKg < 0) {
    res.status(400).json({ error: 'weightKg must be non-negative' });
    return;
  }

  try {
    if (quantity === 0) {
      await pool.query('DELETE FROM cart_items WHERE id = $1 AND cart_id = $2', [itemId, cartId]);
      res.json({ deleted: true });
      return;
    }

    const qty = quantity !== undefined ? Math.floor(quantity) : undefined;
    const wKg = weightKg != null && weightKg >= 0 ? Math.round(weightKg * 1000) / 1000 : undefined;

    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;
    if (qty !== undefined) {
      setClauses.push(`quantity = $${paramIndex++}`);
      values.push(qty);
    }
    if (wKg !== undefined) {
      setClauses.push(`weight_kg = $${paramIndex++}`);
      values.push(wKg);
    }
    if (setClauses.length === 0) {
      res.status(400).json({ error: 'quantity or weightKg is required' });
      return;
    }
    values.push(itemId, cartId);
    const updateResult = await pool.query(
      `UPDATE cart_items SET ${setClauses.join(', ')} WHERE id = $${paramIndex++} AND cart_id = $${paramIndex} RETURNING id`,
      values
    );

    if (updateResult.rows.length === 0) {
      res.status(404).json({ error: 'Cart item not found' });
      return;
    }

    const row = await pool.query<CartItemRow & ProductRow>(
      `SELECT ci.id, ci.quantity, ci.weight_kg, ci.unit_price, ci.created_at,
              p.id as product_id, p.barcode, p.sku, p.name, p.price, p.category, p.image_url, p.weight_based
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.id = $1`,
      [itemId]
    );
    const r = row.rows[0];
    res.json({
      id: r.id,
      quantity: r.quantity,
      weightKg: r.weight_kg != null ? parseFloat(r.weight_kg) : null,
      unitPrice: parseFloat(r.unit_price),
      product: {
        id: r.product_id,
        barcode: r.barcode,
        sku: r.sku,
        name: r.name,
        price: parseFloat(r.price),
        category: r.category,
        imageUrl: r.image_url,
        weightBased: r.weight_based,
      },
    });
  } catch (err) {
    console.error('Error updating cart item:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:cartId/items/:itemId', async (req: Request, res: Response) => {
  const { cartId, itemId } = req.params;
  try {
    const result = await pool.query('DELETE FROM cart_items WHERE id = $1 AND cart_id = $2 RETURNING id', [
      itemId,
      cartId,
    ]);
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Cart item not found' });
      return;
    }
    res.json({ deleted: true });
  } catch (err) {
    console.error('Error removing cart item:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
