import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../stores/useCartStore';
import { format } from 'date-fns';

export function CartPage() {
  const navigate = useNavigate();
  const { items, subtotal, tax, total, updateQuantity, removeItem } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-8">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Carrito vacío</h2>
        <p className="text-slate-600 mb-8">Agregue productos escaneándolos</p>
        <button
          onClick={() => navigate('/kiosk/scan')}
          className="px-8 py-4 bg-emerald-600 text-white rounded-xl text-lg font-medium"
        >
          AGREGAR PRODUCTOS
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="p-4 bg-white shadow">
        <div className="flex justify-between items-center">
          <button onClick={() => navigate('/kiosk/scan')} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">
            ← Agregar más
          </button>
          <h2 className="text-xl font-bold">
            {items.length} {items.length === 1 ? 'producto' : 'productos'}
          </h2>
          <div />
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4"
            >
              <div className="flex-1">
                <div className="font-medium text-slate-800">{item.product.name}</div>
                <div className="text-slate-500">${item.product.price.toFixed(2)} c/u</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-10 h-10 rounded-lg bg-slate-200 hover:bg-slate-300 font-bold"
                >
                  −
                </button>
                <span className="w-12 text-center font-bold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-10 h-10 rounded-lg bg-slate-200 hover:bg-slate-300 font-bold"
                >
                  +
                </button>
              </div>
              <div className="w-24 text-right font-bold">${(item.price * item.quantity).toFixed(2)}</div>
              <button
                onClick={() => removeItem(item.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
                aria-label="Eliminar"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto mt-8 bg-white rounded-xl p-6 shadow-sm">
          <div className="space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>IVA (16%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-4 border-t">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/kiosk/payment')}
            className="w-full mt-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xl font-bold rounded-xl"
          >
            IR A PAGO
          </button>
        </div>
      </main>

      <footer className="p-4 text-center text-slate-500 text-sm">
        {format(new Date(), 'EEEE d MMMM • HH:mm')}
      </footer>
    </div>
  );
}
