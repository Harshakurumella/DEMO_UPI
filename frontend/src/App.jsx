import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PaymentPage from './pages/PaymentPage';
import PaymentStatus from './components/PaymentStatus';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Routes>
          <Route path="/" element={<PaymentPage />} />
          <Route path="/status/:orderId" element={<PaymentStatus />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
