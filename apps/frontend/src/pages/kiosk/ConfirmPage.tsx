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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0fdf4] p-8">
      <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-white text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          check_circle
        </span>
      </div>
      <h1 className="text-3xl font-black text-emerald-800 mb-2">¡Pago exitoso!</h1>
      <p className="text-[#1a1c1c] font-bold mb-1">Total pagado: ${total.toFixed(2)}</p>
      <p className="text-sm text-[#5e3f3b] mb-12">{format(new Date(), "d 'de' MMMM yyyy, HH:mm")}</p>
      <p className="text-[#5e3f3b] mb-8">Gracias por su compra</p>
      <button
        onClick={handleFinish}
        className="px-12 py-4 bg-[#b5000b] hover:bg-[#930007] text-white text-xl font-bold rounded-xl transition-colors"
      >
        FINALIZAR
      </button>
    </div>
  );
}
