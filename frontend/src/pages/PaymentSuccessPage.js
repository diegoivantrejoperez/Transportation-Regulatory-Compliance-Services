import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState('checking');
  const [data, setData] = useState(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!sessionId) { navigate('/'); return; }
    pollStatus();
  }, [sessionId]);

  const pollStatus = async (attempt = 0) => {
    if (attempt > 10) { setStatus('timeout'); return; }
    try {
      const res = await axios.get(`${API}/api/payments/status/${sessionId}`);
      const d = res.data;
      setData(d);
      if (d.payment_status === 'paid') {
        setStatus('paid');
        const params = new URLSearchParams({ session_id: sessionId, usdot: d.usdot_number || '', email: d.email || '', amount: d.amount || '', tier: d.tier || '' });
        setTimeout(() => navigate(`/verification?${params}`), 1500);
      } else if (d.status === 'expired') {
        setStatus('expired');
      } else {
        setAttempts(attempt);
        setTimeout(() => pollStatus(attempt + 1), 2500);
      }
    } catch {
      setTimeout(() => pollStatus(attempt + 1), 2500);
    }
  };

  const tierLabel = data?.tier === '4_YEAR' ? '4-Year MCS-150 Premium' : '2-Year MCS-150 Filing';
  const amount = data?.amount ? `$${data.amount.toFixed(2)}` : '';

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 10%, #0D2A4F 0%, #051B35 65%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>

      {status === 'checking' && (
        <div className="animate-fadeIn">
          <div style={{ width: '80px', height: '80px', border: '4px solid rgba(218,165,32,0.3)', borderTop: '4px solid #DAA520', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 24px' }} />
          <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '16px', fontWeight: 700, color: '#DAA520', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            Confirming Payment
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>Please wait while we verify your payment...</p>
          {attempts > 2 && <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginTop: '12px' }}>This may take a few seconds</p>}
        </div>
      )}

      {status === 'paid' && (
        <div className="animate-scaleIn">
          <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 30px rgba(16,185,129,0.4)' }}>
            <i className="fas fa-check" style={{ color: 'white', fontSize: '32px' }} />
          </div>
          <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '18px', fontWeight: 800, color: '#10B981', marginBottom: '8px' }}>Payment Confirmed!</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '6px' }}>{tierLabel} &bull; {amount}</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Redirecting to verification...</p>
        </div>
      )}

      {status === 'expired' && (
        <div className="animate-fadeIn">
          <i className="fas fa-exclamation-circle" style={{ fontSize: '48px', color: '#DC2626', marginBottom: '20px' }} />
          <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '16px', fontWeight: 700, color: '#DC2626', marginBottom: '12px' }}>Payment Session Expired</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '24px' }}>The payment session has expired. Please try again.</p>
          <button className="gold-btn" onClick={() => navigate('/')} style={{ padding: '14px 28px', justifyContent: 'center' }}>
            <i className="fas fa-home" style={{ marginRight: '8px' }} />Return Home
          </button>
        </div>
      )}

      {status === 'timeout' && (
        <div className="animate-fadeIn">
          <i className="fas fa-clock" style={{ fontSize: '48px', color: '#FBBF24', marginBottom: '20px' }} />
          <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '16px', fontWeight: 700, color: '#FBBF24', marginBottom: '12px' }}>Verification Taking Longer</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '8px' }}>Your payment may still be processing. Check your email for confirmation.</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '24px' }}>If you completed payment, contact us at 877-668-2114</p>
          <button className="gold-btn" onClick={() => { setStatus('checking'); setAttempts(0); pollStatus(0); }} style={{ padding: '14px 28px', marginBottom: '12px', justifyContent: 'center' }}>
            <i className="fas fa-sync" style={{ marginRight: '8px' }} />Retry Check
          </button>
          <br />
          <button className="gold-outline-btn" onClick={() => navigate('/')} style={{ padding: '12px 24px', marginTop: '8px', justifyContent: 'center' }}>
            Return Home
          </button>
        </div>
      )}

      <style>{`@keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
