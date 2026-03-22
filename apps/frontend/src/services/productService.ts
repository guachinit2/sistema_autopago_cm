const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

import type { Product } from '../types';

export async function getProductByBarcode(barcode: string): Promise<Product | null> {
  const trimmed = barcode.trim();
  if (!trimmed) return null;

  const res = await fetch(`${API_URL}/api/products/barcode/${encodeURIComponent(trimmed)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Error al buscar producto');

  const data = (await res.json()) as Product;
  return data;
}
