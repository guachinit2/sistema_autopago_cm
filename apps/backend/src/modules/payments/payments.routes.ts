import { Router, Request, Response } from 'express';
import { pool } from '../../db';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { orderId, methodId, amount, reference } = req.body as {
    orderId?: string;
    methodId?: string;
    amount?: number;
    reference?: string;
  };

  if (!orderId || !methodId || amount == null || amount <= 0) {
    res.status(400).json({ error: 'orderId, methodId and amount (positive) are required' });
    return;
  }

  try {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const orderResult = await client.query(
        'SELECT id, total, status FROM orders WHERE id = $1 FOR UPDATE',
        [orderId]
      );
      if (orderResult.rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      const order = orderResult.rows[0];
      if (order.status !== 'pending') {
        await client.query('ROLLBACK');
        res.status(400).json({ error: 'Order is not pending payment' });
        return;
      }

      const methodResult = await client.query(
        'SELECT id FROM payment_methods WHERE id = $1',
        [methodId]
      );
      if (methodResult.rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({ error: 'Payment method not found' });
        return;
      }

      const total = parseFloat(order.total);
      const paidAmount = parseFloat(amount.toFixed(2));
      if (Math.abs(paidAmount - total) > 0.01) {
        await client.query('ROLLBACK');
        res.status(400).json({ error: `Amount must match order total: $${total.toFixed(2)}` });
        return;
      }

      const paymentResult = await client.query(
        `INSERT INTO payments (order_id, method_id, amount, status, reference)
         VALUES ($1, $2, $3, 'completed', $4)
         RETURNING id, order_id, method_id, amount, status, reference, created_at`,
        [orderId, methodId, paidAmount, reference || null]
      );
      const payment = paymentResult.rows[0];

      await client.query(
        "UPDATE orders SET status = 'completed' WHERE id = $1",
        [orderId]
      );

      await client.query(
        "UPDATE carts SET status = 'completed', updated_at = NOW() WHERE id = (SELECT cart_id FROM orders WHERE id = $1)",
        [orderId]
      );

      await client.query('COMMIT');

      res.status(201).json({
        id: payment.id,
        orderId: payment.order_id,
        methodId: payment.method_id,
        amount: parseFloat(payment.amount),
        status: payment.status,
        reference: payment.reference,
        createdAt: payment.created_at,
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error creating payment:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
