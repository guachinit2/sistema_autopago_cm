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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="p-4 bg-white shadow flex justify-between items-center">
        <button onClick={() => navigate('/')} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">
          ← Volver
        </button>
        <h2 className="text-xl font-bold text-slate-800">Escanear productos</h2>
        <button onClick={() => navigate('/kiosk/cart')} className="px-4 py-2 bg-emerald-600 text-white rounded">
          Ver carrito
        </button>
      </header>

      <main className="flex-1 p-6 flex flex-col gap-6">
        <div className="w-full max-w-md mx-auto aspect-video bg-slate-200 rounded-xl flex items-center justify-center text-slate-500">
          <p>Cámara: integrar html5-qrcode en siguiente iteración</p>
        </div>

        <div
          className={`p-4 rounded-lg text-center text-lg font-medium ${
            scanStatus === 'valid'
              ? 'bg-emerald-100 text-emerald-800'
              : scanStatus === 'invalid'
                ? 'bg-red-100 text-red-800'
                : scanStatus === 'partial'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-600'
          }`}
        >
          {scanStatus === 'idle' && 'Coloque el código de barras frente a la cámara'}
          {scanStatus === 'valid' && '✓ Producto encontrado'}
          {scanStatus === 'invalid' && '✗ Código no encontrado'}
          {scanStatus === 'partial' && 'Código parcial'}
        </div>

        <div className="border-t pt-6">
          <label className="block text-slate-600 mb-2">Código manual (fallback)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
              placeholder="Ingrese código de barras"
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg text-lg"
            />
            <button
              onClick={handleManualSubmit}
              className="px-6 py-3 bg-slate-700 text-white rounded-lg font-medium"
            >
              Buscar
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
