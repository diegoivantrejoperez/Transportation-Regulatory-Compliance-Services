import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import HomePage from './pages/HomePage';
import StatusPage from './pages/StatusPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import VerificationPage from './pages/VerificationPage';
import FilingSuccessPage from './pages/FilingSuccessPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import MonitoringSignupPage from './pages/MonitoringSignupPage';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/status/:usdot" element={<StatusPage />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="/verification" element={<VerificationPage />} />
            <Route path="/filing-success" element={<FilingSuccessPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/monitoring" element={<MonitoringSignupPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
