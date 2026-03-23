import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSessionStore } from '../../stores/useSessionStore';
import { useCartStore } from '../../stores/useCartStore';
import { createPayment } from '../../services/paymentService';
import { playProcessingBeep } from '../../utils/beep';
import type { CartItem } from '../../types';

const CONFIRM_TIMEOUT_SEC = 30;

interface ConfirmLocationState {
  methodId: string;
  methodName: string;
  methodIcon: string;
}

function CartSummaryItem({ item }: { item: CartItem }) {
  const detail = item.product.weightBased
    ? `${item.quantity} kg`
    : item.quantity === 1
      ? '1 Unidad'
      : `${item.quantity} Unidades`;
  const lineTotal = item.price * item.quantity;

  return (
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-on-surface font-semibold text-sm">{item.product.name}</h3>
        <p className="text-xs text-[#5e3f3b]/70">{detail}</p>
      </div>
      <span className="font-bold text-sm">${lineTotal.toFixed(2)}</span>
    </div>
  );
}

export function ConfirmPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = useSessionStore((s) => s.orderId);
  const { items, subtotal, tax, total } = useCartStore();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(CONFIRM_TIMEOUT_SEC);

  const state = location.state as ConfirmLocationState | null;
  const methodId = state?.methodId;
  const methodName = state?.methodName;
  const methodIcon = state?.methodIcon ?? 'credit_card';

  useEffect(() => {
    if (!state?.methodId) {
      navigate('/kiosk/payment', { replace: true });
    }
  }, [state, navigate]);

  useEffect(() => {
    if (!orderId || processing || !methodId) return;
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          navigate('/kiosk/payment', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [orderId, processing, methodId, navigate]);

  const handleConfirm = async () => {
    if (!orderId || !methodId || processing) return;
    setProcessing(true);
    setError(null);
    playProcessingBeep();
    try {
      await createPayment(orderId, methodId, total);
      navigate('/kiosk/receipt', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar pago');
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    navigate('/kiosk/payment');
  };

  if (!orderId || !methodId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <p className="text-on-surface-variant">Redirigiendo...</p>
      </div>
    );
  }

  return (
    <div className="bg-surface font-sans text-on-surface overflow-hidden min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-white shadow-sm">
        <div className="flex items-center justify-between px-8 h-20 w-full">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              disabled={processing}
              className="material-symbols-outlined text-[#5e3f3b] hover:bg-surface-container-low transition-colors active:scale-95 duration-150 p-2 rounded-full disabled:opacity-50"
            >
              arrow_back
            </button>
            <h1 className="text-2xl font-black text-primary tracking-tight">
              Confirmar Pago
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-on-surface-variant">
              Confirmar en {timeLeft}s
            </span>
            <button className="material-symbols-outlined text-[#5e3f3b] hover:bg-surface-container-low transition-colors p-2 rounded-full">
              help
            </button>
          </div>
        </div>
        <div className="bg-surface-container-high h-px w-full" />
      </header>

      <main className="pt-20 pb-24 flex min-h-screen">
        {/* Sidebar: Resumen de compra */}
        <aside className="h-full w-80 border-r border-surface-container-high bg-surface-container-low fixed left-0 top-20 bottom-0 flex flex-col pt-4">
          <div className="px-6 py-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">
                  shopping_cart
                </span>
              </div>
              <div>
                <p className="font-medium text-primary font-semibold">
                  Resumen de Compra
                </p>
                <p className="text-xs text-on-surface-variant">Revise antes de pagar</p>
              </div>
            </div>
          </div>
          <nav className="flex-grow px-2 space-y-4 mt-4 overflow-y-auto">
            <div className="bg-surface-container-lowest mx-2 rounded-xl p-4 shadow-sm">
              <div className="space-y-6">
                {items.map((item) => (
                  <CartSummaryItem key={item.id} item={item} />
                ))}
              </div>
            </div>
            <div className="mx-4 mt-8 pt-6 border-t border-surface-container-high">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-on-surface-variant">Subtotal</span>
                <span className="text-sm font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-on-surface-variant">Impuestos (IVA)</span>
                <span className="text-sm font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-base font-bold text-on-surface">Total</span>
                <span className="text-3xl font-black text-primary tracking-tighter">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main: Confirmación */}
        <section className="ml-80 w-[calc(100%-20rem)] p-12 bg-surface flex-1">
          <div className="max-w-2xl mx-auto h-full flex flex-col items-center justify-center">
            <div className="w-full space-y-8">
              {/* Método de pago seleccionado */}
              <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-surface-container-high">
                <p className="text-sm text-on-surface-variant mb-2">
                  Método de pago seleccionado
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span
                      className="material-symbols-outlined text-primary text-4xl"
                      style={{ fontVariationSettings: "'wght' 400" }}
                    >
                      {methodIcon}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-on-surface">{methodName}</h3>
                    <p className="text-sm text-on-surface-variant">Total a pagar</p>
                  </div>
                </div>
              </div>

              {/* Total destacado */}
              <div className="text-center py-6">
                <p className="text-on-surface-variant font-medium mb-2">
                  Total a pagar
                </p>
                <p className="text-5xl font-black text-primary tracking-tight">
                  ${total.toFixed(2)}
                </p>
              </div>

              {error && (
                <div className="px-6 py-3 bg-red-100 text-red-800 rounded-xl font-medium text-center">
                  {error}
                </div>
              )}

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button
                  onClick={handleCancel}
                  disabled={processing}
                  className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-xl px-10 py-5 font-bold text-lg uppercase tracking-wider transition-colors active:scale-95 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">close</span>
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={processing}
                  className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-12 py-5 font-bold text-xl uppercase tracking-wider transition-colors active:scale-95 disabled:opacity-70 shadow-lg"
                >
                  {processing ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">
                        progress_activity
                      </span>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <span
                        className="material-symbols-outlined"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                      Confirmar Pago
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
