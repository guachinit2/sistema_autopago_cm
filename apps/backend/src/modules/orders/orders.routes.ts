import { Router, Request, Response } from 'express';
import { pool } from '../../db';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { cartId } = req.body as { cartId?: string };
  if (!cartId) {
    res.status(400).json({ error: 'cartId is required' });
    return;
  }

  try {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const cartResult = await client.query(
        'SELECT id, status, document_id FROM carts WHERE id = $1 FOR UPDATE',
        [cartId]
      );
      if (cartResult.rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({ error: 'Cart not found' });
        return;
      }
      if (cartResult.rows[0].status !== 'active') {
        await client.query('ROLLBACK');
        res.status(400).json({ error: 'Cart is not active or already converted to order' });
        return;
      }

      const itemsResult = await client.query(
        'SELECT quantity, weight_kg, unit_price FROM cart_items WHERE cart_id = $1',
        [cartId]
      );
      const items = itemsResult.rows;
      let subtotal = 0;
      for (const item of items) {
        const unitPrice = parseFloat(item.unit_price);
        const weightKg = item.weight_kg != null ? parseFloat(item.weight_kg) : null;
        const qty = item.quantity;
        const lineTotal = weightKg != null ? weightKg * unitPrice : qty * unitPrice;
        subtotal += lineTotal;
      }
      const tax = Math.round(subtotal * 0.16 * 100) / 100;
      const total = Math.round((subtotal + tax) * 100) / 100;

      const documentId = cartResult.rows[0].document_id || null;

      const orderResult = await client.query(
        `INSERT INTO orders (cart_id, document_id, subtotal, tax, total, status)
         VALUES ($1, $2, $3, $4, $5, 'pending')
         RETURNING id, cart_id, document_id, subtotal, tax, total, status, created_at`,
        [cartId, documentId, subtotal, tax, total]
      );
      const order = orderResult.rows[0];

      await client.query(
        "UPDATE carts SET status = 'pending_payment', updated_at = NOW() WHERE id = $1",
        [cartId]
      );

      await client.query('COMMIT');

      res.status(201).json({
        id: order.id,
        cartId: order.cart_id,
        subtotal: parseFloat(order.subtotal),
        tax: parseFloat(order.tax),
        total: parseFloat(order.total),
        status: order.status,
        createdAt: order.created_at,
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
