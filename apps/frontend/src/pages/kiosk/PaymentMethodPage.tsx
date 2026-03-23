import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../../stores/useSessionStore';
import { useCartStore } from '../../stores/useCartStore';
import { getPaymentMethods, type PaymentMethodFromApi } from '../../services/paymentService';
import { playScanBeep } from '../../utils/beep';
import type { CartItem } from '../../types';

const METHOD_CONFIG: Record<string, { icon: string; subtitle: string }> = {
  TARJETA: {
    icon: 'credit_card',
    subtitle: 'Punto de Venta Nacional e Internacional',
  },
  PAGO_MOVIL: {
    icon: 'smartphone',
    subtitle: 'Transferencia inmediata interbancaria',
  },
  ZELLE: {
    icon: 'account_balance_wallet',
    subtitle: 'Pagos en Divisas (USD)',
  },
};

function CartSummaryItem({ item }: { item: CartItem }) {
  const amt = item.weightKg ?? item.quantity;
  const detail = item.product.weightBased
    ? `${amt} kg`
    : item.quantity === 1
      ? '1 Unidad'
      : `${item.quantity} Unidades`;
  const lineTotal = item.price * amt;

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

export function PaymentMethodPage() {
  const navigate = useNavigate();
  const orderId = useSessionStore((s) => s.orderId);
  const { items, subtotal, tax, total } = useCartStore();
  const [methods, setMethods] = useState<PaymentMethodFromApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPaymentMethods()
      .then((data) => data.filter((m) => m.code !== 'EFECTIVO'))
      .then(setMethods)
      .catch(() => setError('Error al cargar métodos'))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (method: PaymentMethodFromApi) => {
    if (!orderId) return;
    playScanBeep();
    const config = METHOD_CONFIG[method.code] ?? { icon: 'payments', subtitle: method.name };
    navigate('/kiosk/confirm', {
      state: { methodId: method.id, methodName: method.name, methodIcon: config.icon },
    });
  };

  const handleCancel = () => {
    navigate('/kiosk/scan');
  };

  if (!orderId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface p-8">
        <p className="text-on-surface-variant mb-4">No hay orden activa</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90"
        >
          Iniciar compra
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface font-sans text-on-surface overflow-hidden min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-white shadow-sm">
        <div className="flex items-center justify-between px-8 h-20 w-full">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/kiosk/scan')}
              className="material-symbols-outlined text-[#5e3f3b] hover:bg-surface-container-low transition-colors active:scale-95 duration-150 p-2 rounded-full disabled:opacity-50"
            >
              arrow_back
            </button>
            <h1 className="text-2xl font-black text-primary tracking-tight">Autopago</h1>
          </div>
          <div className="flex items-center gap-2">
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
                <span className="material-symbols-outlined text-primary">shopping_cart</span>
              </div>
              <div>
                <p className="font-medium text-primary font-semibold">Resumen de Compra</p>
                <p className="text-xs text-on-surface-variant">Total a pagar</p>
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

        {/* Main: Selección de método de pago */}
        <section className="ml-80 w-[calc(100%-20rem)] p-12 bg-surface flex-1">
          <div className="max-w-5xl mx-auto h-full flex flex-col">
            <div className="mb-12">
              <h2 className="text-4xl font-black text-on-surface mb-2 tracking-tight">
                Método de Pago
              </h2>
              <p className="text-secondary font-medium">
                Seleccione su forma de pago preferida para completar la transacción.
              </p>
            </div>

            {error && (
              <div className="mb-6 px-6 py-3 bg-red-100 text-red-800 rounded-xl font-medium">
                {error}
              </div>
            )}

            {loading ? (
              <p className="text-on-surface-variant">Cargando métodos...</p>
            ) : (
              <div className="grid grid-cols-2 gap-8 flex-grow content-start">
                {methods.map((method) => {
                  const config = METHOD_CONFIG[method.code] ?? {
                    icon: 'payments',
                    subtitle: method.name,
                  };
                  return (
                    <button
                      key={method.id}
                      onClick={() => handleSelect(method)}
                      className="group bg-surface-container-lowest p-10 rounded-[2rem] flex flex-col items-center justify-center gap-6 shadow-sm border border-transparent hover:border-primary/20 hover:shadow-xl transition-all duration-300 active:scale-95"
                    >
                      <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                        <span
                          className="material-symbols-outlined text-primary group-hover:text-white text-5xl"
                          style={{ fontVariationSettings: "'wght' 400" }}
                        >
                          {config.icon}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="block text-xl font-bold text-on-surface">
                          {method.name}
                        </span>
                        <span className="text-sm text-on-surface-variant font-medium">
                          {config.subtitle}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="fixed bottom-0 right-0 w-[calc(100%-20rem)] flex justify-end items-center px-12 gap-6 h-24 bg-white border-t border-surface-container-high shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] z-50"
      >
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 bg-surface-container-low text-on-surface rounded-xl px-8 py-4 font-semibold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-50"
        >
          <span className="material-symbols-outlined">close</span>
          Cancelar Transacción
        </button>
        <button
          type="button"
          className="flex items-center gap-2 bg-primary text-white rounded-xl px-12 py-4 font-semibold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity active:scale-95 shadow-md"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            notifications_active
          </span>
          Llamar Asistente
        </button>
      </footer>
    </div>
  );
}
