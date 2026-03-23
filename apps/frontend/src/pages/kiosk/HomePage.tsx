import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../../stores/useSessionStore';
import { useCartStore } from '../../stores/useCartStore';
import { createCart } from '../../services/cartService';
import { format } from 'date-fns';

export function HomePage() {
  const navigate = useNavigate();
  const { state, startSession } = useSessionStore();
  const { clearCart } = useCartStore();
  const [isStarting, setIsStarting] = useState(false);

  const handleStartPurchase = async () => {
    if (isStarting) return;
    setIsStarting(true);
    try {
      const { id: cartId } = await createCart();
      clearCart();
      startSession(cartId);
      navigate('/kiosk/scan');
    } catch {
      setIsStarting(false);
    }
  };

  if (state === 'timeout') {
    return (
      <div className="min-h-screen bg-on-background flex flex-col items-center justify-center text-on-primary">
        <p className="text-xl opacity-70">Pantalla de ahorro de energía</p>
        <p className="mt-2 text-sm">Toca para continuar</p>
        <button
          onClick={() => useSessionStore.getState().setState('idle')}
          className="mt-6 px-8 py-3 bg-secondary rounded-xl font-bold"
        >
          Continuar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background">
      <header className="w-full top-0 bg-background z-50">
        <div className="flex justify-between items-center w-full px-8 py-6 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#b5000b] flex items-center justify-center overflow-hidden shadow-sm">
              <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'wght' 400" }}>
                store
              </span>
            </div>
            <h1 className="font-black tracking-tighter uppercase text-2xl text-on-background">Autopago</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-secondary font-medium">{format(new Date(), "EEEE d 'de' MMMM, HH:mm")}</div>
            <button className="flex items-center gap-2 text-secondary font-bold hover:bg-surface-container-low transition-colors p-3 rounded-xl">
              <span className="material-symbols-outlined">help_outline</span>
              <span>Ayuda</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center max-w-screen-2xl mx-auto w-full px-8 pb-12">
        <div className="text-center space-y-10 max-w-2xl">
          <div className="inline-flex items-center justify-center w-48 h-48 rounded-full bg-white shadow-2xl">
            <span className="material-symbols-outlined text-[#b5000b] text-[90px]" style={{ fontVariationSettings: "'wght' 200" }}>
              shopping_basket
            </span>
          </div>
          <div className="space-y-3">
            <h2 className="text-5xl font-black text-on-background tracking-tighter">Bienvenido</h2>
            <p className="text-secondary text-xl font-medium">
              Toque el botón de abajo para comenzar su compra.
            </p>
            <p className="text-on-surface-variant text-sm">
              1. Escanee sus productos · 2. Revise su carrito · 3. Pague y retire
            </p>
          </div>

          <button
            onClick={handleStartPurchase}
            disabled={isStarting}
            className="w-full max-w-xl h-28 bg-[#b5000b] hover:bg-[#930007] disabled:opacity-70 rounded-[2rem] flex items-center justify-center gap-4 shadow-2xl shadow-[#b5000b]/40 hover:scale-[1.02] transition-all active:scale-95 group"
          >
            <span className="text-white text-3xl font-black uppercase tracking-tighter">
              {isStarting ? 'Creando carrito...' : 'Iniciar compra'}
            </span>
            <span className="material-symbols-outlined text-white text-3xl group-hover:translate-x-2 transition-transform">arrow_forward</span>
          </button>
        </div>
      </main>

      <footer className="w-full py-6 border-t border-surface-container-high bg-surface-container-low/50">
        <div className="max-w-screen-2xl mx-auto px-8 flex justify-between items-center">
          <p className="text-secondary opacity-70 font-medium text-sm">
            {format(new Date(), 'EEEE d MMMM yyyy · HH:mm:ss')}
          </p>
        </div>
      </footer>
    </div>
  );
}
