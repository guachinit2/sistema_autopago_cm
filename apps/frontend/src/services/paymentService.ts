const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface PaymentMethodFromApi {
  id: string;
  code: string;
  name: string;
}

export interface PaymentFromApi {
  id: string;
  orderId: string;
  methodId: string;
  amount: number;
  status: string;
  reference: string | null;
  createdAt: string;
}

export async function getPaymentMethods(): Promise<PaymentMethodFromApi[]> {
  const res = await fetch(`${API_URL}/api/payment-methods`);
  if (!res.ok) throw new Error('Error al obtener métodos de pago');
  return res.json();
}

export async function createPayment(
  orderId: string,
  methodId: string,
  amount: number,
  reference?: string
): Promise<PaymentFromApi> {
  const res = await fetch(`${API_URL}/api/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, methodId, amount, reference }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al procesar pago');
  }
  return res.json();
}
