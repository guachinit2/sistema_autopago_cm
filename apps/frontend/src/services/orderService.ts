const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface OrderFromApi {
  id: string;
  cartId: string;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  createdAt: string;
}

export async function createOrder(cartId: string): Promise<OrderFromApi> {
  const res = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cartId }),
  });
  if (!res.ok) throw new Error('Error al crear orden');
  return res.json();
}
