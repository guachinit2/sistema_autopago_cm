import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useCartStore } from '../../stores/useCartStore';
import { playScanBeep } from '../../utils/beep';
import { BarcodeCamera } from '../../components/kiosk/BarcodeCamera';
import { getProductByBarcode } from '../../services/productService';

export function ScanPage() {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const [manualCode, setManualCode] = useState('');
  const [scanStatus, setScanStatus] = useState<'idle' | 'valid' | 'invalid' | 'partial'>('idle');
  const [cameraActive, setCameraActive] = useState(false);
  const usbBufferRef = useRef({ buffer: '', lastKeyTime: 0 });
  const scanCooldownRef = useRef(false);

  const processCode = useCallback(
    async (code: string) => {
      const trimmed = code.trim();
      if (trimmed.length >= 8) {
        try {
          const product = await getProductByBarcode(trimmed);
          if (product) {
            addItem(product);
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
    [addItem]
  );

  const handleManualSubmit = () => {
    processCode(manualCode);
    setManualCode('');
  };

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
    <div className="min-h-screen flex flex-col bg-[#f9f9f9] text-[#1a1c1c]">
      <header className="w-full bg-white shadow-sm border-b border-[#e8e8e8]">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-screen-2xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 text-[#3a5f94] font-bold hover:bg-[#f3f3f3] rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Volver
          </button>
          <h2 className="text-xl font-black text-[#1a1c1c] tracking-tight">Escanear productos</h2>
          <button
            onClick={() => navigate('/kiosk/cart')}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#b5000b] hover:bg-[#930007] text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all"
          >
            <span className="material-symbols-outlined text-xl">shopping_cart</span>
            Ver carrito
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col gap-6 max-w-2xl mx-auto w-full">
        {/* Área cámara - activar manualmente por ahora (en producción: auto-iniciar) */}
        <div className="relative w-full min-h-[200px] aspect-video max-h-[320px] bg-[#e8e8e8] rounded-2xl overflow-hidden border-2 border-[#e9bcb6]/50">
          {cameraActive ? (
            <BarcodeCamera
              onScan={processCode}
              onClose={() => setCameraActive(false)}
              onError={() => setCameraActive(false)}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#e8e8e8]">
              <span className="material-symbols-outlined text-[#3a5f94] text-5xl" style={{ fontVariationSettings: "'wght' 200" }}>
                qr_code_scanner
              </span>
              <p className="text-[#5e3f3b] font-medium text-center px-4">Cámara desactivada</p>
              <button
                onClick={() => setCameraActive(true)}
                className="px-6 py-3 bg-[#3a5f94] text-white font-bold rounded-xl hover:opacity-90 flex items-center gap-2"
              >
                <span className="material-symbols-outlined">videocam</span>
                Activar cámara
              </button>
            </div>
          )}
        </div>

        {/* Feedback de escaneo */}
        <div
          className={`p-4 rounded-xl text-center text-lg font-bold transition-colors ${
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

        {/* Input manual */}
        <div className="border-t border-[#e8e8e8] pt-6">
          <label className="block text-[#3a5f94] font-bold mb-2">Código manual</label>
          <div className="flex gap-3">
            <input
              id="manual-barcode-input"
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (handleManualSubmit(), e.preventDefault())}
              placeholder="Ej: 12345678, 87654321, 11111111, 22222222"
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
          <p className="mt-2 text-sm text-[#5e3f3b]/70">
            Escáneres USB: escanee y el producto se agregará automáticamente.
          </p>
        </div>
      </main>
    </div>
  );
}
