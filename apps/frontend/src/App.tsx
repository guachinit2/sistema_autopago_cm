import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/kiosk/HomePage';
import { ScanPage } from './pages/kiosk/ScanPage';
import { CartPage } from './pages/kiosk/CartPage';
import { PaymentMethodPage } from './pages/kiosk/PaymentMethodPage';
import { ConfirmPage } from './pages/kiosk/ConfirmPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/kiosk/scan" element={<ScanPage />} />
        <Route path="/kiosk/cart" element={<CartPage />} />
        <Route path="/kiosk/payment" element={<PaymentMethodPage />} />
        <Route path="/kiosk/confirm" element={<ConfirmPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
