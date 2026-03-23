/**
 * Tipos para CartItem (3.3) - adaptado a esquema carts + cart_items
 */
export interface CartItemRow {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  weight_kg: string | null;
  unit_price: string;
  created_at: string | null;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  weightKg: number | null;
  unitPrice: number;
  createdAt: string | null;
}

export function rowToCartItem(row: CartItemRow, product: Record<string, unknown>): Record<string, unknown> {
  const weightKg = row.weight_kg != null ? parseFloat(row.weight_kg) : null;
  const qty = typeof row.quantity === 'number' ? row.quantity : parseInt(String(row.quantity), 10);
  const unitPrice = parseFloat(row.unit_price);
  const lineTotal = weightKg != null ? weightKg * unitPrice : qty * unitPrice;

  return {
    id: row.id,
    productId: row.product_id,
    quantity: qty,
    weightKg,
    unitPrice,
    lineTotal: Math.round(lineTotal * 100) / 100,
    createdAt: row.created_at,
    product,
  };
}
