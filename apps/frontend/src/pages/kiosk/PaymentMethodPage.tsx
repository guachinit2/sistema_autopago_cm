import { useNavigate } from 'react-router-dom';

const PAYMENT_OPTIONS = [
  { id: 'card', name: 'TARJETA', icon: '💳' },
  { id: 'cash', name: 'EFECTIVO', icon: '💵' },
  { id: 'mobile', name: 'PAGO MÓVIL', icon: '📱' },
  { id: 'other', name: 'OTROS', icon: '⋯' },
];

export function PaymentMethodPage() {
  const navigate = useNavigate();

  const handleSelect = (_id: string) => {
    // Por ahora redirigir a confirmación mock
    navigate('/kiosk/confirm');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="p-4 bg-white shadow">
        <button
          onClick={() => navigate('/kiosk/cart')}
          className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded"
        >
          ← Volver
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-12 text-center">SELECCIONA MÉTODO DE PAGO</h1>

        <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
          {PAYMENT_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className="flex flex-col items-center justify-center h-32 bg-white rounded-xl shadow-md hover:shadow-lg hover:bg-slate-50 transition-all border-2 border-slate-100"
            >
              <span className="text-4xl mb-2">{option.icon}</span>
              <span className="font-bold text-slate-800">{option.name}</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
