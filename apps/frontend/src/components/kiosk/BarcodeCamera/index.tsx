/**
 * Componente de cámara para escanear códigos de barras (html5-qrcode).
 * Por ahora requiere que el usuario active manualmente.
 * En producción futuro: auto-iniciar al montar.
 */
import { useEffect, useRef, useState } from 'react';

const SCANNER_ID = 'barcode-scanner-instance';

interface BarcodeCameraProps {
  onScan: (code: string) => void;
  onClose: () => void;
  onError?: (message: string) => void;
}

export function BarcodeCamera({ onScan, onClose, onError }: BarcodeCameraProps) {
  const [status, setStatus] = useState<'loading' | 'active' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);
  const scannerRunningRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const initCamera = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');

        const el = document.getElementById(SCANNER_ID);
        if (!el || !mountedRef.current) return;

        const scanner = new Html5Qrcode(SCANNER_ID);
        scannerRef.current = scanner;

        const cameras = await Html5Qrcode.getCameras();
        if (!mountedRef.current) return;

        if (cameras.length === 0) {
          setErrorMessage('No se detectó ninguna cámara');
          setStatus('error');
          onError?.('No se detectó ninguna cámara');
          scannerRef.current = null;
          return;
        }

        await scanner.start(
          cameras[0].id,
          {
            fps: 10,
            qrbox: { width: 280, height: 120 },
            aspectRatio: 1.777778,
          },
          (decodedText) => onScan(decodedText),
          () => {}
        );

        if (!mountedRef.current) return;
        scannerRunningRef.current = true;
        setStatus('active');
      } catch (err) {
        if (!mountedRef.current) return;
        const msg = err instanceof Error ? err.message : 'Error al acceder a la cámara';
        setErrorMessage(msg);
        setStatus('error');
        onError?.(msg);
        scannerRef.current = null;
      }
    };

    initCamera();

    return () => {
      mountedRef.current = false;
      const scanner = scannerRef.current;
      scannerRef.current = null;

      if (!scanner) return;
      if (!scannerRunningRef.current) return;

      scannerRunningRef.current = false;
      try {
        scanner.stop().catch(() => {});
      } catch {
        // Ignorar: "Cannot stop, scanner is not running"
      }
    };
  }, [onScan, onError]);

  return (
    <div className="absolute inset-0">
      {/* El div debe existir antes de que Html5Qrcode lo use */}
      <div id={SCANNER_ID} className="w-full h-full min-h-[200px]" />

      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#e8e8e8]">
          <span className="material-symbols-outlined animate-pulse text-[#3a5f94] text-5xl">videocam</span>
          <p className="text-[#5e3f3b] font-medium">Activando cámara...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#e8e8e8] p-4">
          <span className="material-symbols-outlined text-[#b5000b] text-5xl">videocam_off</span>
          <p className="text-[#5e3f3b] font-medium text-center">{errorMessage}</p>
          <p className="text-sm text-[#5e3f3b]/80 text-center">Use el ingreso manual de código abajo</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#3a5f94] text-white font-bold rounded-xl"
          >
            Cerrar
          </button>
        </div>
      )}

      {status === 'active' && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 px-3 py-1.5 bg-black/60 text-white text-sm font-bold rounded-lg hover:bg-black/80"
        >
          Cerrar cámara
        </button>
      )}
    </div>
  );
}
