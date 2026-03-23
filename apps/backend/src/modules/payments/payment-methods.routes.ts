import { Router, Request, Response } from 'express';
import { pool } from '../../db';

const router = Router();

interface PaymentMethodRow {
  id: string;
  code: string;
  name: string;
}

router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query<PaymentMethodRow>(
      'SELECT id, code, name FROM payment_methods ORDER BY code'
    );
    res.json(
      result.rows.map((row) => ({
        id: row.id,
        code: row.code,
        name: row.name,
      }))
    );
  } catch (err) {
    console.error('Error fetching payment methods:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
