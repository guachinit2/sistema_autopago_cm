import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../../stores/useSessionStore';
import { useCartStore } from '../../stores/useCartStore';
import { format } from 'date-fns';

export function HomePage() {
  const navigate = useNavigate();
  const { state, startSession } = useSessionStore();
  const { clearCart } = useCartStore();

  const handleStartPurchase = () => {
    clearCart();
    startSession();
    navigate('/kiosk/scan');
  };

  if (state === 'timeout') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <p className="text-xl opacity-70">Pantalla de ahorro de energía</p>
        <p className="mt-2 text-sm">Toca para continuar</p>
        <button
          onClick={() => useSessionStore.getState().setState('idle')}
          className="mt-6 px-8 py-3 bg-slate-600 rounded-lg"
        >
          Continuar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="p-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-slate-800">Autopago</div>
        <div className="text-slate-600">{format(new Date(), "EEEE d 'de' MMMM, HH:mm")}</div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-4 text-center">Bienvenido</h1>
        <p className="text-slate-600 text-center mb-12 max-w-md">
          1. Escanee sus productos
          <br />
          2. Revise su carrito
          <br />
          3. Pague y retire
        </p>

        <button
          onClick={handleStartPurchase}
          className="w-full max-w-sm h-24 text-2xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-lg transition-colors"
          style={{ minHeight: '120px' }}
        >
          INICIAR COMPRA
        </button>

        <button className="mt-8 text-slate-500 underline text-lg">¿Necesita ayuda?</button>
      </main>

      <footer className="p-4 text-center text-slate-500 text-sm">
        {format(new Date(), 'EEEE d MMMM yyyy • HH:mm:ss')}
      </footer>
    </div>
  );
}
