import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/kiosk/HomePage';
import { ScanPage } from './pages/kiosk/ScanPage';
import { PaymentMethodPage } from './pages/kiosk/PaymentMethodPage';
import { ConfirmPage } from './pages/kiosk/ConfirmPage';
import { IdInputPage } from './pages/kiosk/IdInputPage';
import { ReceiptPage } from './pages/kiosk/ReceiptPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/kiosk/id" element={<IdInputPage />} />
        <Route path="/kiosk/scan" element={<ScanPage />} />
        <Route path="/kiosk/payment" element={<PaymentMethodPage />} />
        <Route path="/kiosk/confirm" element={<ConfirmPage />} />
        <Route path="/kiosk/receipt" element={<ReceiptPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
