import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

export default function MonitoringSignupPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useApp();
  const usdot = params.get('usdot') || '';

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usdot) { setError('USDOT number is missing. Please go back and search again.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/api/monitoring/subscribe`, { usdot_number: usdot, email: form.email, password: form.password });
      login(res.data.access_token, { user_id: res.data.user_id, email: form.email });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 10%, #0D2A4F, #051B35)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
        <div className="animate-scaleIn" style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 30px rgba(16,185,129,0.4)' }}>
          <i className="fas fa-check" style={{ color: 'white', fontSize: '30px' }} />
        </div>
        <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '18px', fontWeight: 800, color: '#10B981', marginBottom: '8px' }}>You're Protected!</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', maxWidth: '300px' }}>We'll email you <strong style={{ color: '#F9E498' }}>30 days before</strong> your USDOT {usdot} MCS-150 renewal is due.</p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '16px' }}>Redirecting to dashboard...</p>
      </div>
    );
  }

  const inputStyle = { width: '100%', padding: '14px 16px 14px 44px', border: '2px solid rgba(218,165,32,0.4)', borderRadius: '10px', fontSize: '15px', background: 'rgba(255,255,255,0.06)', color: 'white', outline: 'none', boxSizing: 'border-box', fontFamily: 'Roboto, sans-serif', transition: 'border-color 0.2s' };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 10%, #0D2A4F 0%, #051B35 65%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>

      {/* Icon */}
      <div className="animate-scaleIn" style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg, #0D2A4F, #0A2342)', border: '3px solid #DAA520', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 0 20px rgba(218,165,32,0.3)' }}>
        <i className="fas fa-shield-alt" style={{ fontSize: '28px', color: '#DAA520' }} />
      </div>

      <h1 className="animate-fadeIn" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '18px', fontWeight: 800, color: '#DAA520', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px', textAlign: 'center' }}>
        Activate Free Monitoring
      </h1>
      <p className="animate-fadeIn" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textAlign: 'center', marginBottom: '8px', maxWidth: '320px', lineHeight: 1.6 }}>
        Get notified <strong style={{ color: '#F9E498' }}>30 days before</strong> your USDOT {usdot} renewal deadline. Never miss a deadline again.
      </p>

      {/* Features */}
      <div className="animate-fadeIn" style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[{ icon: 'fas fa-bell', text: '30-Day Alerts' }, { icon: 'fas fa-envelope', text: 'Email Reminders' }, { icon: 'fas fa-lock', text: 'Secure & Free' }].map(f => (
          <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
            <i className={f.icon} style={{ color: '#DAA520' }} />{f.text}
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ position: 'relative', marginBottom: '14px' }}>
          <i className="fas fa-envelope" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#DAA520', fontSize: '15px' }} />
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="Your Email Address" required data-testid="monitoring-email"
            style={inputStyle} onFocus={e => e.target.style.borderColor = '#DAA520'} onBlur={e => e.target.style.borderColor = 'rgba(218,165,32,0.4)'} />
        </div>

        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <i className="fas fa-lock" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#DAA520', fontSize: '15px' }} />
          <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Create a Password" required data-testid="monitoring-password"
            style={{ ...inputStyle, paddingRight: '44px' }} onFocus={e => e.target.style.borderColor = '#DAA520'} onBlur={e => e.target.style.borderColor = 'rgba(218,165,32,0.4)'} />
          <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
            <i className={`fas fa-eye${showPw ? '-slash' : ''}`} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.4)', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', color: '#FCA5A5', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <i className="fas fa-exclamation-circle" />{error}
          </div>
        )}

        <button type="submit" disabled={loading || !form.email || !form.password} className="gold-btn" data-testid="activate-monitoring-btn"
          style={{ width: '100%', padding: '16px', fontSize: '15px', borderRadius: '10px', justifyContent: 'center', opacity: form.email && form.password ? 1 : 0.6 }}>
          {loading ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }} />Activating...</> : <><i className="fas fa-shield-alt" style={{ marginRight: '8px' }} />ACTIVATE FREE MONITORING</>}
        </button>
      </form>

      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '14px', textAlign: 'center' }}>
        Free forever. No credit card required.
      </p>

      <button onClick={() => navigate(-1)} style={{ marginTop: '20px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <i className="fas fa-arrow-left" />Go Back
      </button>
    </div>
  );
}
