import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;
const LOGO = 'https://customer-assets.emergentagent.com/job_44f8ad78-8ec0-4a92-b07a-3505ef291e27/artifacts/qisdrhs0_unnamed%20%281%29.jpg';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let res;
      if (tab === 'login') {
        res = await axios.post(`${API}/api/auth/login`, { email: form.email, password: form.password });
      } else {
        res = await axios.post(`${API}/api/auth/register`, { email: form.email, password: form.password, phone_number: form.phone });
      }
      login(res.data.access_token, { user_id: res.data.user_id, email: res.data.email });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please try again.');
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '14px 16px 14px 44px', border: '2px solid rgba(218,165,32,0.4)', borderRadius: '10px', fontSize: '15px', background: 'rgba(255,255,255,0.06)', color: 'white', outline: 'none', boxSizing: 'border-box', fontFamily: 'Roboto, sans-serif', transition: 'border-color 0.2s' };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 10%, #0D2A4F 0%, #051B35 65%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>

      {/* Logo */}
      <img src={LOGO} alt="TRC" className="animate-fadeIn" style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '10px', marginBottom: '16px' }} />
      <h1 className="animate-fadeIn" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '18px', fontWeight: 800, color: '#DAA520', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px', textAlign: 'center' }}>TRC Compliance Portal</h1>
      <p className="animate-fadeIn" style={{ fontFamily: "'Playfair Display', serif", fontSize: '14px', fontStyle: 'italic', color: '#F9E498', marginBottom: '32px', textAlign: 'center' }}>
        "We Worry, So You Don't Have To."
      </p>

      {/* Tab Switch */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '4px', marginBottom: '24px', width: '100%', maxWidth: '380px' }}>
        {['login', 'register'].map(t => (
          <button key={t} onClick={() => { setTab(t); setError(''); }} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', transition: 'all 0.2s', background: tab === t ? 'linear-gradient(180deg, #F9E498, #DAA520)' : 'transparent', color: tab === t ? '#0A2342' : 'rgba(255,255,255,0.5)' }} data-testid={`tab-${t}`}>
            {t === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '380px' }}>
        {/* Email */}
        <div style={{ position: 'relative', marginBottom: '14px' }}>
          <i className="fas fa-envelope" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#DAA520', fontSize: '15px' }} />
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="Email Address" required data-testid="login-email"
            style={inputStyle} onFocus={e => e.target.style.borderColor = '#DAA520'} onBlur={e => e.target.style.borderColor = 'rgba(218,165,32,0.4)'} />
        </div>

        {/* Password */}
        <div style={{ position: 'relative', marginBottom: tab === 'register' ? '14px' : '20px' }}>
          <i className="fas fa-lock" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#DAA520', fontSize: '15px' }} />
          <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Password" required data-testid="login-password"
            style={{ ...inputStyle, paddingRight: '44px' }} onFocus={e => e.target.style.borderColor = '#DAA520'} onBlur={e => e.target.style.borderColor = 'rgba(218,165,32,0.4)'} />
          <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
            <i className={`fas fa-eye${showPw ? '-slash' : ''}`} />
          </button>
        </div>

        {/* Phone (register only) */}
        {tab === 'register' && (
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <i className="fas fa-phone" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#DAA520', fontSize: '15px' }} />
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="Phone Number (Optional)"
              style={inputStyle} onFocus={e => e.target.style.borderColor = '#DAA520'} onBlur={e => e.target.style.borderColor = 'rgba(218,165,32,0.4)'} />
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.4)', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', color: '#FCA5A5', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <i className="fas fa-exclamation-circle" />{error}
          </div>
        )}

        <button type="submit" disabled={loading} className="gold-btn" data-testid="auth-submit-btn"
          style={{ width: '100%', padding: '16px', fontSize: '15px', borderRadius: '10px', justifyContent: 'center' }}>
          {loading ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }} />Please wait...</> : tab === 'login' ? <><i className="fas fa-sign-in-alt" style={{ marginRight: '8px' }} />SIGN IN</> : <><i className="fas fa-user-plus" style={{ marginRight: '8px' }} />CREATE ACCOUNT</>}
        </button>
      </form>

      {/* Back */}
      <button onClick={() => navigate('/')} style={{ marginTop: '24px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <i className="fas fa-arrow-left" />Back to USDOT Search
      </button>

      {/* Contact */}
      <div style={{ marginTop: '32px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '11px', lineHeight: 1.8 }}>
        <a href="tel:8776682114" style={{ color: 'rgba(218,165,32,0.5)', textDecoration: 'none' }}>877-668-2114</a>
        {' '}&bull;{' '}
        <a href="mailto:questions@transportationregulatorycompliance.com" style={{ color: 'rgba(218,165,32,0.5)', textDecoration: 'none' }}>Contact Support</a>
      </div>
    </div>
  );
}
