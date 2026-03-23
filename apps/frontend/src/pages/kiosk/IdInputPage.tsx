import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../../stores/useSessionStore';
import { useCartStore } from '../../stores/useCartStore';
import { createCart } from '../../services/cartService';
import { playScanBeep } from '../../utils/beep';
import { format } from 'date-fns';

const MIN_DIGITS = 7;
const MAX_DIGITS = 8;

function NumKey({ digit, onClick }: { digit: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full aspect-square min-h-[36px] rounded-lg bg-white border border-surface-container-high shadow-sm hover:bg-surface-container-low hover:border-primary/30 active:scale-95 transition-all flex items-center justify-center text-xl font-black text-on-background"
    >
      {digit}
    </button>
  );
}

export function IdInputPage() {
  const navigate = useNavigate();
  const { startSession } = useSessionStore();
  const { clearCart } = useCartStore();
  const [documentId, setDocumentId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const isValid =
    documentId.length >= MIN_DIGITS &&
    documentId.length <= MAX_DIGITS &&
    /^\d+$/.test(documentId);

  const handleKeyPress = (digit: string) => {
    if (documentId.length < MAX_DIGITS) {
      setDocumentId((prev) => prev + digit);
      setError(null);
    }
  };

  const handleBackspace = () => {
    setDocumentId((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleContinue = async () => {
    if (!isValid || isStarting) return;

    setIsStarting(true);
    setError(null);
    try {
      playScanBeep();
      const { id: cartId } = await createCart(documentId);
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
    <div className="h-screen flex flex-col bg-background text-on-background overflow-hidden">
      <header className="flex-shrink-0 px-6 py-3 flex justify-between items-center">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-secondary font-bold hover:bg-surface-container-low transition-colors p-2 rounded-lg text-sm"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          Volver
        </button>
        <h1 className="font-black tracking-tighter uppercase text-lg text-on-background">
          Autopago
        </h1>
        <span className="text-secondary text-sm font-medium">
          {format(new Date(), 'HH:mm')}
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center min-h-0 px-3 py-1">
        <div className="w-full max-w-[280px] space-y-2">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-1">
              <span
                className="material-symbols-outlined text-primary text-2xl"
                style={{ fontVariationSettings: "'wght' 400" }}
              >
                badge
              </span>
            </div>
            <h2 className="text-base font-black text-on-background tracking-tight">
              Documento de identidad
            </h2>
          </div>

          <div className="px-3 py-2 bg-white border border-surface-container-high rounded-lg shadow-inner">
            <p className="text-center text-xl font-black tracking-[0.25em] text-on-background tabular-nums">
              {documentId || '· · · · · · · ·'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <NumKey digit="1" onClick={() => handleKeyPress('1')} />
            <NumKey digit="2" onClick={() => handleKeyPress('2')} />
            <NumKey digit="3" onClick={() => handleKeyPress('3')} />
            <NumKey digit="4" onClick={() => handleKeyPress('4')} />
            <NumKey digit="5" onClick={() => handleKeyPress('5')} />
            <NumKey digit="6" onClick={() => handleKeyPress('6')} />
            <NumKey digit="7" onClick={() => handleKeyPress('7')} />
            <NumKey digit="8" onClick={() => handleKeyPress('8')} />
            <NumKey digit="9" onClick={() => handleKeyPress('9')} />
            <div />
            <NumKey digit="0" onClick={() => handleKeyPress('0')} />
            <button
              type="button"
              onClick={handleBackspace}
              className="w-full aspect-square min-h-[36px] rounded-lg bg-surface-container-high hover:bg-red-100 border border-surface-container-high shadow-sm active:scale-95 transition-all flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-xl text-on-surface">
                backspace
              </span>
            </button>
          </div>

          <button
            onClick={handleContinue}
            disabled={!isValid || isStarting}
            className="w-full py-2.5 bg-primary hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
          >
            {isStarting ? (
              'Creando carrito...'
            ) : (
              <>
                Continuar
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </>
            )}
          </button>

          {error && (
            <div className="px-2 py-1.5 bg-red-100 text-red-800 rounded text-xs font-medium">
              {error}
            </div>
          )}

          <button
            onClick={handleBack}
            className="w-full py-1.5 text-on-surface-variant font-medium hover:bg-surface-container-low rounded-lg transition-colors text-xs"
          >
            Cancelar
          </button>
        </div>
      </main>
    </div>
  );
}
