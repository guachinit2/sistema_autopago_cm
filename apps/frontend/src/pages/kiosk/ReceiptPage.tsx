import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../stores/useCartStore';
import { useSessionStore } from '../../stores/useSessionStore';
import { playPrintBeep } from '../../utils/beep';
import { format } from 'date-fns';
import type { CartItem } from '../../types';

const AUTO_NAVIGATE_SEC = 60;

function ReceiptItem({ item }: { item: CartItem }) {
  const amt = item.weightKg ?? item.quantity;
  const lineTotal = item.price * amt;
  const detail = item.product.weightBased
    ? `${amt} kg × $${item.price.toFixed(2)}`
    : item.quantity > 1
      ? `${item.quantity} × $${item.price.toFixed(2)}`
      : `$${item.price.toFixed(2)}`;

  return (
    <div className="flex justify-between items-center py-2 border-b border-surface-container-high last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-on-surface truncate">{item.product.name}</p>
        <p className="text-xs text-on-surface-variant">{detail}</p>
      </div>
      <span className="font-bold text-on-surface ml-3">${lineTotal.toFixed(2)}</span>
    </div>
  );
}

export function ReceiptPage() {
  const navigate = useNavigate();
  const { items, subtotal, tax, total, clearCart } = useCartStore();
  const { orderId, documentId, endSession } = useSessionStore();
  const [countdown, setCountdown] = useState(AUTO_NAVIGATE_SEC);

  useEffect(() => {
    playPrintBeep();
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          clearCart();
          endSession();
          navigate('/', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [clearCart, endSession, navigate]);

  const handleFinish = () => {
    clearCart();
    endSession();
    navigate('/');
  };

  const transactionRef = orderId ? orderId.slice(-8).toUpperCase() : '—';

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <header className="flex-shrink-0 px-6 py-4 border-b border-surface-container-high">
        <h1 className="text-2xl font-black text-primary tracking-tight text-center uppercase">
          Compra completada
        </h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 min-h-0 overflow-auto">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-surface-container-high overflow-hidden animate-[slideUp_0.6s_ease-out]">
          <div className="p-6 space-y-4">
            <div className="text-center pb-4 border-b-2 border-dashed border-surface-container-high">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500 mb-3">
                <span
                  className="material-symbols-outlined text-white text-4xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              </div>
              <p className="text-xl font-black text-emerald-800">¡Gracias por su compra!</p>
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Fecha y hora</span>
                <span className="font-medium">{format(new Date(), "dd/MM/yyyy HH:mm")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Nº transacción</span>
                <span className="font-mono font-bold">{transactionRef}</span>
              </div>
              {documentId && (
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Cédula de identidad</span>
                  <span className="font-mono font-bold">{documentId}</span>
                </div>
              )}
            </div>

            <div className="border-t border-surface-container-high pt-4">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Productos
              </p>
              <div className="max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <ReceiptItem key={item.id} item={item} />
                ))}
              </div>
            </div>

            <div className="border-t-2 border-surface-container-high pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">IVA</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-on-surface">Total</span>
                <span className="text-2xl font-black text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-on-surface-variant text-sm">
          Nueva compra en {countdown} s
        </p>

        <button
          onClick={handleFinish}
          className="mt-4 w-full max-w-md py-5 bg-primary hover:bg-primary-container text-white text-xl font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">add_shopping_cart</span>
          Nueva compra
        </button>

        <button
          type="button"
          className="mt-4 flex items-center justify-center gap-2 text-on-surface-variant hover:text-primary font-medium text-sm"
          disabled
        >
          <span className="material-symbols-outlined text-lg">mail</span>
          Enviar recibo por email
        </button>
      </main>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
