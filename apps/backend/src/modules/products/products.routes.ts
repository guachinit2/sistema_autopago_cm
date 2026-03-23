import { Router, Request, Response } from 'express';
import { productsService } from './products.service';

const router = Router();

router.get('/barcode/:barcode', async (req: Request, res: Response) => {
  const { barcode } = req.params;
  if (!barcode?.trim()) {
    res.status(400).json({ error: 'Barcode is required' });
    return;
  }

  try {
    const product = await productsService.findByBarcode(barcode);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (err) {
    console.error('Error fetching product by barcode:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ error: 'Product ID is required' });
    return;
  }

  try {
    const product = await productsService.findById(id);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (err) {
    console.error('Error fetching product by ID:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
