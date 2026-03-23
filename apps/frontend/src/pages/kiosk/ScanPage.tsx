import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSessionStore } from '../../stores/useSessionStore';
import { useCartStore } from '../../stores/useCartStore';
import { playScanBeep } from '../../utils/beep';
import { BarcodeCamera } from '../../components/kiosk/BarcodeCamera';
import { getProductByBarcode } from '../../services/productService';
import {
  addCartItem,
  updateCartItem,
  removeCartItem as removeCartItemApi,
} from '../../services/cartService';
import { createOrder } from '../../services/orderService';
import type { CartItem } from '../../types';

function CartSidebarItem({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}) {
  const amt = item.weightKg ?? item.quantity;
  const lineTotal = item.price * amt;
  const detail = item.product.weightBased
    ? `${amt} kg × $${item.price.toFixed(2)}`
    : item.quantity > 1
      ? `${item.quantity} × $${item.price.toFixed(2)}`
      : `$${item.price.toFixed(2)} c/u`;
  return (
    <div className="bg-white p-4 rounded-xl flex items-center gap-4 shadow-sm border border-[#e8e8e8]">
      <div className="w-16 h-16 rounded-lg bg-[#f3f3f3] flex items-center justify-center shrink-0 overflow-hidden">
        {item.product.imageUrl ? (
          <img src={item.product.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="material-symbols-outlined text-[#b5000b]/40 text-3xl">inventory_2</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-[#1a1c1c] leading-tight truncate">{item.product.name}</h3>
        <p className="text-xs text-[#5e3f3b] mt-0.5">{detail}</p>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="w-8 h-8 rounded-lg bg-[#e8e8e8] hover:bg-[#e9bcb6]/50 font-bold text-[#1a1c1c] flex items-center justify-center text-sm"
            aria-label="Reducir"
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="w-8 h-8 rounded-lg bg-[#e8e8e8] hover:bg-[#e9bcb6]/50 font-bold text-[#1a1c1c] flex items-center justify-center text-sm"
            aria-label="Aumentar"
          >
            +
          </button>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="font-bold text-[#1a1c1c]">${lineTotal.toFixed(2)}</p>
        <button
          onClick={() => onRemove(item.id)}
          className="text-[#b5000b] text-xs font-semibold hover:underline mt-1"
          aria-label="Eliminar"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}

export function ScanPage() {
  const navigate = useNavigate();
  const cartId = useSessionStore((s) => s.cartId);
  const setOrderId = useSessionStore((s) => s.setOrderId);
  const addItem = useCartStore((s) => s.addItem);
  const addItemFromApi = useCartStore((s) => s.addItemFromApi);
  const { items, subtotal, tax, total, updateQuantity, removeItem } = useCartStore();
  const [isConfirming, setIsConfirming] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scanStatus, setScanStatus] = useState<'idle' | 'valid' | 'invalid' | 'partial'>('idle');
  const [cameraActive, setCameraActive] = useState(false);
  const usbBufferRef = useRef({ buffer: '', lastKeyTime: 0 });
  const scanCooldownRef = useRef(false);

  const [toastProduct, setToastProduct] = useState<string | null>(null);

  useEffect(() => {
    if (!cartId) {
      navigate('/kiosk/id', { replace: true });
    }
  }, [cartId, navigate]);

  const processCode = useCallback(
    async (code: string) => {
      const trimmed = code.trim();
      if (trimmed.length >= 8) {
        try {
          const product = await getProductByBarcode(trimmed);
          if (product) {
            if (cartId) {
              const cartItem = await addCartItem(cartId, product.id, 1);
              addItemFromApi(cartItem);
            } else {
              addItem(product);
            }
            setToastProduct(product.name);
            setTimeout(() => setToastProduct(null), 2000);
            setScanStatus('valid');
            playScanBeep();
            if (navigator.vibrate) navigator.vibrate(200);
            scanCooldownRef.current = true;
            setTimeout(() => {
              scanCooldownRef.current = false;
              setScanStatus('idle');
            }, 800);
          } else {
            setScanStatus('invalid');
          }
        } catch {
          setScanStatus('invalid');
        }
      } else if (trimmed.length > 0) {
        setScanStatus('partial');
      } else {
        setScanStatus('invalid');
      }
    },
    [cartId, addItem, addItemFromApi]
  );

  const handleManualSubmit = () => {
    processCode(manualCode);
    setManualCode('');
  };

  const handleUpdateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      updateQuantity(itemId, quantity);
      if (cartId) {
        try {
          if (quantity <= 0) {
            await removeCartItemApi(cartId, itemId);
          } else {
            await updateCartItem(cartId, itemId, quantity);
          }
        } catch {
          // Revert: refetch cart or show error
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
          await removeCartItemApi(cartId, itemId);
        } catch {
          // Revert if needed
        }
      }
    },
    [cartId, removeItem]
  );

  const handleConfirm = useCallback(async () => {
    if (!cartId || items.length === 0 || isConfirming) return;
    setIsConfirming(true);
    try {
      const order = await createOrder(cartId);
      setOrderId(order.id);
      navigate('/kiosk/payment');
    } catch {
      setIsConfirming(false);
    }
  }, [cartId, items.length, isConfirming, navigate, setOrderId]);

  // Fallback USB: escáneres USB emulan teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === 'Enter' && (e.target as HTMLInputElement).id === 'manual-barcode-input') return;
        if ((e.target as HTMLInputElement).id === 'manual-barcode-input') return;
      }

      const now = Date.now();
      const { buffer, lastKeyTime } = usbBufferRef.current;

      if (e.key === 'Enter') {
        e.preventDefault();
        if (buffer.length >= 8 && now - lastKeyTime < 200 && !scanCooldownRef.current) {
          processCode(buffer);
        }
        usbBufferRef.current = { buffer: '', lastKeyTime: 0 };
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const newBuffer = buffer + e.key;
        usbBufferRef.current = {
          buffer: newBuffer.length <= 20 ? newBuffer : buffer,
          lastKeyTime: now,
        };
        if (newBuffer.length > 20) usbBufferRef.current.buffer = '';
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [processCode]);

  return (
    <div className="h-screen flex flex-col bg-[#f9f9f9] text-[#1a1c1c] overflow-hidden">
      <header className="flex-shrink-0 bg-white shadow-sm border-b border-[#e8e8e8] flex justify-between items-center w-full px-8 py-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 text-[#3a5f94] font-bold hover:bg-[#f3f3f3] rounded-xl transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Volver
        </button>
        <h2 className="text-xl font-black text-[#1a1c1c] tracking-tight">Escanear productos</h2>
        <button
          onClick={handleConfirm}
          disabled={items.length === 0 || isConfirming}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#b5000b] hover:bg-[#930007] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#b5000b] text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all"
        >
          <span className="material-symbols-outlined text-xl">check_circle</span>
          {isConfirming ? 'Procesando...' : 'Confirmar'}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar izquierdo: carrito */}
        <aside className="w-96 flex-shrink-0 flex flex-col bg-[#f3f3f3] overflow-hidden border-r border-[#e8e8e8]">
          <div className="px-6 py-5 flex-shrink-0">
            <h2 className="text-xl font-bold tracking-tight text-[#1a1c1c]">Tu carrito</h2>
            <p className="text-sm text-[#5e3f3b]">
              {items.length} {items.length === 1 ? 'producto escaneado' : 'productos escaneados'}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-6">
            {items.length === 0 ? (
              <div className="py-12 text-center text-[#5e3f3b]/70">
                <span className="material-symbols-outlined text-5xl mb-3 block">add_shopping_cart</span>
                <p className="font-medium">Escanee productos para verlos aquí</p>
              </div>
            ) : (
              <>
                {items.map((item) => (
                  <CartSidebarItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemove}
                  />
                ))}
              </>
            )}
          </div>
          {/* Total integrado en la tabla del carrito */}
          {items.length > 0 && (
            <div className="flex-shrink-0 p-6 bg-white border-t border-[#e8e8e8] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
              <div className="space-y-2">
                <div className="flex justify-between text-[#5e3f3b]">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#5e3f3b]">
                  <span className="font-medium">IVA (16%)</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="pt-4 mt-4 border-t-2 border-[#e8e8e8] flex justify-between items-end">
                  <span className="text-sm font-bold text-[#5e3f3b] uppercase tracking-wider">Total</span>
                  <span className="text-2xl font-black text-[#b5000b]">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Área central: escáner */}
        <main className="flex-1 flex flex-col items-center justify-center p-8 overflow-auto">
          <div className="max-w-2xl w-full">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-[#1a1c1c] mb-2 tracking-tight">
                Escanee su siguiente producto
              </h1>
              <p className="text-lg text-[#5e3f3b]">
                Coloque el código de barras dentro del área iluminada
              </p>
            </div>

            {/* Área cámara / escáner */}
            <div className="relative w-full aspect-video max-h-[320px] bg-[#1a1c1c] rounded-[2rem] shadow-2xl overflow-hidden border-8 border-white">
              {cameraActive ? (
                <BarcodeCamera
                  onScan={processCode}
                  onClose={() => setCameraActive(false)}
                  onError={() => setCameraActive(false)}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setCameraActive(true)}
                  className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group"
                >
                  <div className="w-3/4 h-1 bg-[#b5000b]/40 shadow-[0_0_15px_rgba(181,0,11,0.8)] animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-48 border-2 border-dashed border-white/30 rounded-3xl flex flex-col items-center justify-center gap-3 group-hover:border-white/50 transition-colors">
                      <span className="material-symbols-outlined text-white/20 text-6xl group-hover:text-white/40">barcode_scanner</span>
                      <span className="text-white/50 text-sm font-medium">Clic para activar cámara</span>
                    </div>
                  </div>
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-6 py-2 rounded-full text-white/80 text-sm font-medium">
                    Esperando señal del escáner...
                  </div>
                </button>
              )}
            </div>

            {/* Feedback de escaneo */}
            <div
              className={`mt-6 p-4 rounded-xl text-center text-lg font-bold transition-colors ${
                scanStatus === 'valid'
                  ? 'bg-emerald-100 text-emerald-800'
                  : scanStatus === 'invalid'
                    ? 'bg-red-100 text-red-800'
                    : scanStatus === 'partial'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-[#f3f3f3] text-[#5e3f3b]'
              }`}
            >
              {scanStatus === 'idle' && (
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">qr_code_2</span>
                  Ingrese el código manualmente o use escáner USB
                </span>
              )}
              {scanStatus === 'valid' && (
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">check_circle</span>
                  Producto agregado
                </span>
              )}
              {scanStatus === 'invalid' && (
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">error</span>
                  Código no encontrado
                </span>
              )}
              {scanStatus === 'partial' && (
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">schedule</span>
                  Código parcial (mín. 8 dígitos)
                </span>
              )}
            </div>

            {/* Botones: Escribir código / Ayuda */}
            <div className="mt-10 grid grid-cols-2 gap-6 max-w-lg mx-auto">
              <button
                type="button"
                onClick={() => document.getElementById('manual-barcode-input')?.focus()}
                className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl shadow-lg border border-transparent hover:border-[#b5000b]/20 transition-all active:scale-95"
              >
                <div className="w-16 h-16 rounded-full bg-[#ffdad5] mb-4 flex items-center justify-center text-[#b5000b]">
                  <span className="material-symbols-outlined text-3xl">keyboard</span>
                </div>
                <span className="font-bold text-[#1a1c1c]">Escribir código</span>
              </button>
              <button
                type="button"
                className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl shadow-lg border border-transparent hover:border-[#3a5f94]/20 transition-all active:scale-95"
              >
                <div className="w-16 h-16 rounded-full bg-[#d5e3ff] mb-4 flex items-center justify-center text-[#3a5f94]">
                  <span className="material-symbols-outlined text-3xl">contact_support</span>
                </div>
                <span className="font-bold text-[#1a1c1c]">Solicitar ayuda</span>
              </button>
            </div>

            {/* Input manual */}
            <div className="mt-6 max-w-lg mx-auto">
              <label className="block text-[#3a5f94] font-bold mb-2">Código manual</label>
              <div className="flex gap-3">
                <input
                  id="manual-barcode-input"
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (handleManualSubmit(), e.preventDefault())}
                  placeholder="Ej: 12345678, 87654321..."
                  className="flex-1 px-4 py-3 border-2 border-[#e9bcb6] rounded-xl text-lg font-medium focus:border-[#b5000b] focus:ring-2 focus:ring-[#b5000b]/20 outline-none transition-all bg-white"
                />
                <button
                  onClick={handleManualSubmit}
                  className="px-6 py-3 bg-[#3a5f94] text-white rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">search</span>
                  Buscar
                </button>
              </div>
              <p className="mt-2 text-sm text-[#5e3f3b]/70">Escáneres USB: escanee y el producto se agregará automáticamente.</p>
            </div>
          </div>
        </main>
      </div>

      {/* Toast: Producto agregado */}
      {toastProduct && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#1a1c1c]/90 text-white backdrop-blur-xl px-8 py-4 rounded-full flex items-center gap-4 shadow-2xl animate-bounce">
          <span className="material-symbols-outlined text-[#c9a900]" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
          <p className="font-bold">Producto agregado: {toastProduct}</p>
        </div>
      )}
    </div>
  );
}
