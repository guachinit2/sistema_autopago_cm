import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../stores/useCartStore';
import { useSessionStore } from '../../stores/useSessionStore';
import { format } from 'date-fns';

export function ConfirmPage() {
  const navigate = useNavigate();
  const { total, clearCart } = useCartStore();
  const { endSession } = useSessionStore();

  const handleFinish = () => {
    clearCart();
    endSession();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-50 p-8">
      <div className="text-6xl mb-6">✓</div>
      <h1 className="text-3xl font-bold text-emerald-800 mb-2">¡Pago exitoso!</h1>
      <p className="text-slate-600 mb-2">Total pagado: ${total.toFixed(2)}</p>
      <p className="text-sm text-slate-500 mb-12">{format(new Date(), "d 'de' MMMM yyyy, HH:mm")}</p>
      <p className="text-slate-600 mb-8">Gracias por su compra</p>
      <button
        onClick={handleFinish}
        className="px-12 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xl font-bold rounded-xl"
      >
        FINALIZAR
      </button>
    </div>
  );
}
