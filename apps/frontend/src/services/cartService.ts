const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

import type { Product } from '../types';

export interface CartItemFromApi {
  id: string;
  quantity: number;
  weightKg?: number | null;
  unitPrice: number;
  product: Product;
}

export interface CartFromApi {
  id: string;
  status: string;
  items: CartItemFromApi[];
}

export async function createCart(documentId?: string): Promise<{ id: string }> {
  const res = await fetch(`${API_URL}/api/carts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId: documentId || undefined }),
  });
  if (!res.ok) throw new Error('Error al crear carrito');
  return res.json();
}

export async function getCart(cartId: string): Promise<CartFromApi> {
  const res = await fetch(`${API_URL}/api/carts/${cartId}`);
  if (res.status === 404) throw new Error('Carrito no encontrado');
  if (!res.ok) throw new Error('Error al obtener carrito');
  return res.json();
}

export async function addCartItem(
  cartId: string,
  productId: string,
  quantity: number,
  weightKg?: number
): Promise<CartItemFromApi> {
  const body: { productId: string; quantity: number; weightKg?: number } = {
    productId,
    quantity,
  };
  if (weightKg != null && weightKg > 0) body.weightKg = weightKg;
  const res = await fetch(`${API_URL}/api/carts/${cartId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Error al agregar producto');
  return res.json();
}

export async function updateCartItem(
  cartId: string,
  itemId: string,
  quantity: number,
  weightKg?: number
): Promise<CartItemFromApi | null> {
  const body: { quantity?: number; weightKg?: number } = {};
  if (quantity >= 0) body.quantity = quantity;
  if (weightKg != null && weightKg >= 0) body.weightKg = weightKg;
  const res = await fetch(`${API_URL}/api/carts/${cartId}/items/${itemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Error al actualizar cantidad');
  const data = await res.json();
  return data.deleted ? null : data;
}

export async function removeCartItem(cartId: string, itemId: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/carts/${cartId}/items/${itemId}`, {
    method: 'DELETE',
  });
  if (res.status === 404) return;
  if (!res.ok) throw new Error('Error al eliminar producto');
}
