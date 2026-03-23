import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../../stores/useSessionStore';
import { useCartStore } from '../../stores/useCartStore';
import { createCart } from '../../services/cartService';
import { playScanBeep } from '../../utils/beep';
import { format } from 'date-fns';

const MAX_DIGITS = 8;
const VALID_DOCUMENT_LENGTH = 8;

export function IdInputPage() {
  const navigate = useNavigate();
  const { startSession } = useSessionStore();
  const { clearCart } = useCartStore();
  const [documentId, setDocumentId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const isValid = documentId.length === VALID_DOCUMENT_LENGTH && /^\d+$/.test(documentId);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, MAX_DIGITS);
    setDocumentId(value);
    setError(null);
  };

  const handleContinue = async () => {
    if (!isValid || isStarting) return;
    if (documentId.length !== VALID_DOCUMENT_LENGTH) {
      setError('Ingrese los 8 dígitos de su cédula de identidad');
      return;
    }

    setIsStarting(true);
    setError(null);
    try {
      playScanBeep();
      const { id: cartId } = await createCart();
      clearCart();
      startSession(cartId, documentId);
      navigate('/kiosk/scan');
    } catch {
      setError('Error al iniciar la compra. Intente de nuevo.');
      setIsStarting(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background">
      <header className="w-full top-0 bg-background z-50">
        <div className="flex justify-between items-center w-full px-8 py-6 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-secondary font-bold hover:bg-surface-container-low transition-colors p-3 rounded-xl"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Volver
            </button>
            <h1 className="font-black tracking-tighter uppercase text-2xl text-on-background">
              Autopago
            </h1>
          </div>
          <div className="text-secondary font-medium">
            {format(new Date(), "EEEE d 'de' MMMM, HH:mm")}
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center max-w-screen-2xl mx-auto w-full px-8 pb-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10">
              <span
                className="material-symbols-outlined text-primary text-5xl"
                style={{ fontVariationSettings: "'wght' 400" }}
              >
                badge
              </span>
            </div>
            <h2 className="text-3xl font-black text-on-background tracking-tight">
              Ingrese su documento de identidad
            </h2>
            <p className="text-on-surface-variant">
              Cédula de identidad venezolana (8 dígitos)
            </p>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={MAX_DIGITS}
              value={documentId}
              onChange={handleInputChange}
              placeholder="Ej: 26754321"
              className="w-full px-6 py-5 text-2xl font-bold text-center bg-white border-2 border-surface-container-high rounded-2xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              aria-label="Documento de identidad"
              autoFocus
            />
            <p className="text-sm text-on-surface-variant text-center">
              {documentId.length}/{MAX_DIGITS} dígitos
            </p>
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-100 text-red-800 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <button
              onClick={handleContinue}
              disabled={!isValid || isStarting}
              className="w-full py-5 bg-primary hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed text-white text-xl font-bold rounded-2xl transition-colors flex items-center justify-center gap-3"
            >
              {isStarting ? (
                'Creando carrito...'
              ) : (
                <>
                  Continuar
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </button>
            <button
              onClick={handleBack}
              className="w-full py-3 text-on-surface-variant font-medium hover:bg-surface-container-low rounded-xl transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
