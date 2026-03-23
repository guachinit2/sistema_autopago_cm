/**
 * Componente de cámara para escanear códigos de barras o QR.
 * Modo barcode: Quagga2 (EAN, EAN-8, UPC). Modo QR: html5-qrcode.
 * Muestra feedback visual: buscando, código detectado o imagen sin código.
 */
import { useEffect, useRef, useState } from 'react';

const SCANNER_ID = 'barcode-scanner-instance';
const ERROR_CALLBACK_THROTTLE_MS = 400;

export type ScanMode = 'barcode' | 'qr';

interface BarcodeCameraProps {
  mode: ScanMode;
  onScan: (code: string) => void;
  onClose: () => void;
  onError?: (message: string) => void;
}

export function BarcodeCamera({ mode, onScan, onClose, onError }: BarcodeCameraProps) {
  const [status, setStatus] = useState<'loading' | 'active' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scanFeedback, setScanFeedback] = useState<'idle' | 'searching' | 'detected'>('idle');
  const [detectedCode, setDetectedCode] = useState<string | null>(null);
  const html5ScannerRef = useRef<{ stop: () => Promise<void> } | null>(null);
  const quaggaRef = useRef<typeof import('@ericblade/quagga2').default | null>(null);
  const onDetectedRef = useRef<((data: { codeResult: { code: string } }) => void) | null>(null);
  const scannerRunningRef = useRef(false);
  const mountedRef = useRef(true);
  const lastErrorUpdateRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;

    const handleScanSuccess = (decodedText: string) => {
      if (!mountedRef.current) return;
      setScanFeedback('detected');
      setDetectedCode(decodedText);
      onScan(decodedText);
      setTimeout(() => {
        if (mountedRef.current) {
          setScanFeedback('searching');
          setDetectedCode(null);
        }
      }, 1500);
    };

    if (mode === 'barcode') {
      const originalWarn = console.warn;
      const suppressQuaggaWarn = (...args: unknown[]) => {
        const msg = String(args[0] ?? '');
        if (msg.includes('InputStreamBrowser') || msg.includes('createLiveStream') || msg.includes('createVideoStream')) return;
        originalWarn.apply(console, args);
      };

      const tryHtml5Fallback = async () => {
        if (!mountedRef.current) return;
        setStatus('loading');
        setErrorMessage(null);
        try {
          const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode');
          const el = document.getElementById(SCANNER_ID);
          if (!el || !mountedRef.current) return;
          const scanner = new Html5Qrcode(SCANNER_ID, {
            formatsToSupport: [
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.EAN_8,
              Html5QrcodeSupportedFormats.UPC_A,
              Html5QrcodeSupportedFormats.UPC_E,
            ],
            useBarCodeDetectorIfSupported: false,
          });
          html5ScannerRef.current = scanner;
          const cameras = await Html5Qrcode.getCameras();
          if (!mountedRef.current || cameras.length === 0) {
            setErrorMessage('No se detectó ninguna cámara');
            setStatus('error');
            html5ScannerRef.current = null;
            return;
          }
          const handleScanError = () => {
            if (!mountedRef.current) return;
            const now = Date.now();
            if (now - lastErrorUpdateRef.current > ERROR_CALLBACK_THROTTLE_MS) {
              lastErrorUpdateRef.current = now;
              setScanFeedback((prev) => (prev === 'detected' ? prev : 'searching'));
            }
          };
          await scanner.start(
            cameras[0].id,
            { fps: 5, qrbox: { width: 400, height: 280 }, aspectRatio: 1.777778 },
            handleScanSuccess,
            handleScanError
          );
          if (!mountedRef.current) return;
          scannerRunningRef.current = true;
          setStatus('active');
          setScanFeedback('searching');
        } catch (fallbackErr) {
          if (!mountedRef.current) return;
          const msg = fallbackErr instanceof Error ? fallbackErr.message : 'Error al acceder a la cámara';
          setErrorMessage(msg);
          setStatus('error');
          onError?.(msg);
          html5ScannerRef.current = null;
        }
      };

      const initQuagga = async () => {
        try {
          console.warn = suppressQuaggaWarn;
          const { default: Quagga } = await import('@ericblade/quagga2');
          quaggaRef.current = Quagga;

          const el = document.getElementById(SCANNER_ID);
          if (!el || !mountedRef.current) return;

          await new Promise((r) => requestAnimationFrame(r));
          if (!mountedRef.current) return;

          const handler = (data: { codeResult: { code: string } }) => {
            if (!mountedRef.current || !data?.codeResult?.code) return;
            handleScanSuccess(data.codeResult.code);
          };
          onDetectedRef.current = handler;

          Quagga.init(
            {
              inputStream: {
                name: 'Live',
                type: 'LiveStream',
                target: el,
                constraints: {
                  width: { min: 320, ideal: 640, max: 1920 },
                  height: { min: 240, ideal: 480, max: 1080 },
                  frameRate: { ideal: 10 },
                },
              },
              locator: { patchSize: 'medium', halfSample: true },
              numOfWorkers: 2,
              locate: true,
              decoder: {
                readers: ['ean_reader', 'ean_8_reader', 'upc_reader'],
              },
            },
            (err: Error | null) => {
              if (!mountedRef.current) return;
              if (err) {
                console.warn = originalWarn;
                quaggaRef.current = null;
                onDetectedRef.current = null;
                tryHtml5Fallback();
                return;
              }
              Quagga.onDetected(handler);
              Quagga.start();
              scannerRunningRef.current = true;
              setStatus('active');
              setScanFeedback('searching');
            }
          );
        } catch {
          if (!mountedRef.current) return;
          console.warn = originalWarn;
          quaggaRef.current = null;
          onDetectedRef.current = null;
          tryHtml5Fallback();
        }
      };

      initQuagga();

      return () => {
        mountedRef.current = false;
        console.warn = originalWarn;
        const Quagga = quaggaRef.current;
        const handler = onDetectedRef.current;
        quaggaRef.current = null;
        onDetectedRef.current = null;

        if (Quagga && handler && scannerRunningRef.current) {
          scannerRunningRef.current = false;
          try {
            Quagga.offDetected(handler);
            Quagga.stop();
          } catch {
            // Ignorar
          }
        }
        const html5Scanner = html5ScannerRef.current;
        html5ScannerRef.current = null;
        if (html5Scanner && scannerRunningRef.current) {
          scannerRunningRef.current = false;
          try {
            html5Scanner.stop().catch(() => {});
          } catch {
            // Ignorar
          }
        }
      };
    }

    const initHtml5Qrcode = async () => {
      try {
        const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode');

        const el = document.getElementById(SCANNER_ID);
        if (!el || !mountedRef.current) return;

        const formats = [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
        ];

        const scanner = new Html5Qrcode(SCANNER_ID, {
          formatsToSupport: formats,
          useBarCodeDetectorIfSupported: false,
        });
        html5ScannerRef.current = scanner;

        const cameras = await Html5Qrcode.getCameras();
        if (!mountedRef.current) return;

        if (cameras.length === 0) {
          setErrorMessage('No se detectó ninguna cámara');
          setStatus('error');
          onError?.('No se detectó ninguna cámara');
          html5ScannerRef.current = null;
          return;
        }

        const handleScanError = () => {
          if (!mountedRef.current) return;
          const now = Date.now();
          if (now - lastErrorUpdateRef.current > ERROR_CALLBACK_THROTTLE_MS) {
            lastErrorUpdateRef.current = now;
            setScanFeedback((prev) => (prev === 'detected' ? prev : 'searching'));
          }
        };

        await scanner.start(
          cameras[0].id,
          {
            fps: 5,
            qrbox: { width: 400, height: 280 },
            aspectRatio: 1.777778,
          },
          handleScanSuccess,
          handleScanError
        );

        if (!mountedRef.current) return;
        scannerRunningRef.current = true;
        setStatus('active');
        setScanFeedback('searching');
      } catch (err) {
        if (!mountedRef.current) return;
        const msg = err instanceof Error ? err.message : 'Error al acceder a la cámara';
        setErrorMessage(msg);
        setStatus('error');
        onError?.(msg);
        html5ScannerRef.current = null;
      }
    };

    initHtml5Qrcode();

    return () => {
      mountedRef.current = false;
      const scanner = html5ScannerRef.current;
      html5ScannerRef.current = null;

      if (!scanner) return;
      if (!scannerRunningRef.current) return;

      scannerRunningRef.current = false;
      try {
        scanner.stop().catch(() => {});
      } catch {
        // Ignorar
      }
    };
  }, [mode, onScan, onError]);

  const modeLabel = mode === 'barcode' ? 'código de barras' : 'QR';
  const searchLabel = mode === 'barcode' ? 'Buscando código de barras...' : 'Buscando código o QR...';
  const alignLabel =
    mode === 'barcode'
      ? 'Alinee el código de barras dentro del recuadro'
      : 'Alinee el código QR dentro del recuadro';

  return (
    <div className="absolute inset-0">
      <div id={SCANNER_ID} className="relative w-full h-full min-h-[200px]" />

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
        <>
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-10 px-3 py-1.5 bg-black/60 text-white text-sm font-bold rounded-lg hover:bg-black/80"
          >
            Cerrar cámara
          </button>
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/70 backdrop-blur-sm px-4 py-3 flex flex-col gap-1">
            <div className="flex items-center justify-center gap-2 text-white font-medium">
              {scanFeedback === 'searching' && (
                <>
                  <span className="material-symbols-outlined animate-pulse">qr_code_scanner</span>
                  <span>{searchLabel}</span>
                </>
              )}
              {scanFeedback === 'detected' && detectedCode && (
                <>
                  <span className="material-symbols-outlined text-[#4ade80]">check_circle</span>
                  <span>¡Código detectado: {detectedCode}</span>
                </>
              )}
              {scanFeedback === 'idle' && (
                <>
                  <span className="material-symbols-outlined">crop_free</span>
                  <span>{alignLabel}</span>
                </>
              )}
            </div>
            <p className="text-white/70 text-xs text-center">
              Modo {modeLabel} · Mantenga el código quieto 2–5 segundos
            </p>
          </div>
        </>
      )}
    </div>
  );
}
