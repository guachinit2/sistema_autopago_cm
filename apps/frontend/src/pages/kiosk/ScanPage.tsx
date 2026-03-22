import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCartStore } from '../../stores/useCartStore';

// Productos mock para pruebas (sin API)
const MOCK_PRODUCTS: Record<string, { name: string; price: number }> = {
  '12345678': { name: 'Producto prueba 1', price: 2.5 },
  '87654321': { name: 'Producto prueba 2', price: 5.99 },
  '11111111': { name: 'Leche 1L', price: 1.2 },
  '22222222': { name: 'Pan integral', price: 0.85 },
};

export function ScanPage() {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const [manualCode, setManualCode] = useState('');
  const [scanStatus, setScanStatus] = useState<'idle' | 'valid' | 'invalid' | 'partial'>('idle');

  const handleManualSubmit = () => {
    const code = manualCode.trim();
    if (code.length >= 8) {
      const product = MOCK_PRODUCTS[code] ?? {
        name: `Producto ${code.slice(0, 6)}`,
        price: Math.random() * 10 + 0.5,
      };
      addItem({
        id: crypto.randomUUID(),
        sku: code,
        barcode: code,
        name: product.name,
        price: product.price,
      });
      setScanStatus('valid');
      setManualCode('');
      setTimeout(() => setScanStatus('idle'), 1500);
    } else if (code.length > 0) {
      setScanStatus('partial');
    } else {
      setScanStatus('invalid');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background">
      <header className="w-full bg-white shadow-sm border-b border-surface-container-high">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-screen-2xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 text-secondary font-bold hover:bg-surface-container-low rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Volver
          </button>
          <h2 className="text-xl font-black text-on-background tracking-tight">Escanear productos</h2>
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
        <div className="w-full aspect-video bg-surface-container-low rounded-2xl flex flex-col items-center justify-center gap-4 border-2 border-dashed border-outline-variant/50">
          <span className="material-symbols-outlined text-primary text-6xl opacity-60" style={{ fontVariationSettings: "'wght' 200" }}>
            qr_code_scanner
          </span>
          <p className="text-on-surface-variant font-medium">Cámara: integrar html5-qrcode en siguiente iteración</p>
        </div>

        <div
          className={`p-4 rounded-xl text-center text-lg font-bold ${
            scanStatus === 'valid'
              ? 'bg-emerald-100 text-emerald-800'
              : scanStatus === 'invalid'
                ? 'bg-red-100 text-red-800'
                : scanStatus === 'partial'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-surface-container-low text-on-surface-variant'
          }`}
        >
          {scanStatus === 'idle' && (
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">qr_code_2</span>
              Coloque el código de barras frente a la cámara
            </span>
          )}
          {scanStatus === 'valid' && (
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">check_circle</span>
              Producto encontrado
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
              Código parcial
            </span>
          )}
        </div>

        <div className="border-t border-surface-container-high pt-6">
          <label className="block text-secondary font-bold mb-2">Código manual (fallback)</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
              placeholder="Ingrese código de barras"
              className="flex-1 px-4 py-3 border-2 border-outline-variant rounded-xl text-lg font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
            <button
              onClick={handleManualSubmit}
              className="px-6 py-3 bg-secondary text-on-secondary rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <span className="material-symbols-outlined">search</span>
              Buscar
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
