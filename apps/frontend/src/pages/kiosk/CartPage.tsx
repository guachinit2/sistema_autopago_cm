import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../../stores/useSessionStore';
import { useCartStore } from '../../stores/useCartStore';
import { updateCartItem, removeCartItem } from '../../services/cartService';
import { createOrder } from '../../services/orderService';
import { format } from 'date-fns';
import type { CartItem } from '../../types';

function CartItemRow({ item, onUpdateQuantity, onRemove }: {
  item: CartItem;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}) {
  const lineTotal = item.price * item.quantity;

  return (
    <div
      className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4 border border-[#e8e8e8] transition-all duration-300 hover:shadow-md"
    >
      <div className="w-16 h-16 rounded-lg bg-[#f3f3f3] flex items-center justify-center overflow-hidden shrink-0">
        {item.product.imageUrl ? (
          <img
            src={item.product.imageUrl}
            alt={item.product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="material-symbols-outlined text-[#b5000b]/40 text-3xl">inventory_2</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-[#1a1c1c] truncate">{item.product.name}</div>
        <div className="text-[#5e3f3b] text-sm">${item.product.price.toFixed(2)} c/u</div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          className="w-10 h-10 rounded-xl bg-[#e8e8e8] hover:bg-[#e9bcb6]/50 font-bold text-[#1a1c1c] transition-colors flex items-center justify-center"
          aria-label="Reducir cantidad"
        >
          −
        </button>
        <span className="w-12 text-center font-bold text-[#1a1c1c]">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          className="w-10 h-10 rounded-xl bg-[#e8e8e8] hover:bg-[#e9bcb6]/50 font-bold text-[#1a1c1c] transition-colors flex items-center justify-center"
          aria-label="Aumentar cantidad"
        >
          +
        </button>
      </div>
      <div className="w-24 text-right font-bold text-[#1a1c1c] shrink-0">
        ${lineTotal.toFixed(2)}
      </div>
      <button
        onClick={() => onRemove(item.id)}
        className="p-2 text-[#b5000b] hover:bg-red-50 rounded-xl transition-colors"
        aria-label="Eliminar"
      >
        <span className="material-symbols-outlined">delete</span>
      </button>
    </div>
  );
}

export function CartPage() {
  const navigate = useNavigate();
  const cartId = useSessionStore((s) => s.cartId);
  const { items, subtotal, tax, total, updateQuantity, removeItem } = useCartStore();
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const handleUpdateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      updateQuantity(itemId, quantity);
      if (cartId) {
        try {
          if (quantity <= 0) {
            await removeCartItem(cartId, itemId);
          } else {
            await updateCartItem(cartId, itemId, quantity);
          }
        } catch {
          // Silently fail for now
        }
      }
    },
    [cartId, updateQuantity]
  );

  const handleRemove = useCallback(
    async (itemId: string) => {
      removeItem(itemId);
      if (cartId) {
        try {
          await removeCartItem(cartId, itemId);
        } catch {
          // Silently fail for now
        }
      }
    },
    [cartId, removeItem]
  );

  const setOrderId = useSessionStore((s) => s.setOrderId);

  const handleGoToPayment = useCallback(async () => {
    if (!cartId || isCreatingOrder) return;
    setIsCreatingOrder(true);
    try {
      const order = await createOrder(cartId);
      setOrderId(order.id);
      navigate('/kiosk/payment');
    } catch {
      setIsCreatingOrder(false);
    }
  }, [cartId, isCreatingOrder, navigate, setOrderId]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9f9f9] p-8">
        <span className="material-symbols-outlined text-[#3a5f94] text-8xl mb-4" style={{ fontVariationSettings: "'wght' 200" }}>
          shopping_cart
        </span>
        <h2 className="text-2xl font-black text-[#1a1c1c] mb-2">Carrito vacío</h2>
        <p className="text-[#5e3f3b] mb-8 text-center">Agregue productos escaneándolos</p>
        <button
          onClick={() => navigate('/kiosk/scan')}
          className="px-8 py-4 bg-[#b5000b] hover:bg-[#930007] text-white rounded-xl text-lg font-bold flex items-center gap-2 transition-colors"
        >
          <span className="material-symbols-outlined">qr_code_scanner</span>
          Agregar productos
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9] text-[#1a1c1c]">
      <header className="w-full bg-white shadow-sm border-b border-[#e8e8e8]">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/kiosk/scan')}
            className="flex items-center gap-2 px-4 py-2 text-[#3a5f94] font-bold hover:bg-[#f3f3f3] rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined">add_circle</span>
            Agregar más
          </button>
          <div className="text-center">
            <div className="font-black text-[#1a1c1c]">
              {items.length} {items.length === 1 ? 'producto' : 'productos'}
            </div>
            <div className="text-[#3a5f94] font-bold text-lg">${total.toFixed(2)}</div>
          </div>
          <div className="w-24" />
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemove}
            />
          ))}
        </div>

        <div className="max-w-2xl mx-auto mt-8 bg-white rounded-2xl p-6 shadow-sm border border-[#e8e8e8]">
          <div className="space-y-3">
            <div className="flex justify-between text-[#5e3f3b]">
              <span>Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#5e3f3b]">
              <span>IVA (16%)</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-black pt-4 border-t-2 border-[#e8e8e8]">
              <span>Total</span>
              <span className="text-[#b5000b]">${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-6">
            <button
              onClick={handleGoToPayment}
              disabled={!cartId || isCreatingOrder}
              className="w-full py-4 bg-[#b5000b] hover:bg-[#930007] disabled:opacity-70 text-white text-xl font-black rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">payment</span>
              {isCreatingOrder ? 'Creando orden...' : 'Ir a pago'}
            </button>
            <button
              onClick={() => navigate('/kiosk/scan')}
              className="w-full py-3 bg-[#3a5f94] hover:opacity-90 text-white font-bold rounded-xl transition-opacity flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">add_shopping_cart</span>
              Agregar más
            </button>
          </div>
        </div>
      </main>

      <footer className="p-4 text-center text-[#5e3f3b]/70 text-sm border-t border-[#e8e8e8] bg-white/50">
        {format(new Date(), 'EEEE d MMMM · HH:mm')}
      </footer>
    </div>
  );
}
