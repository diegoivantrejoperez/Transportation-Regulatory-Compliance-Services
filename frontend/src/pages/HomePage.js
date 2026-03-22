import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;
const LOGO_CIRCULAR = 'https://customer-assets.emergentagent.com/job_44f8ad78-8ec0-4a92-b07a-3505ef291e27/artifacts/wo89kflz_1773349561130.png.jpg';

export default function HomePage() {
  const [usdot, setUsdot] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUsdotData } = useApp();
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    const num = usdot.trim();
    if (!num) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API}/api/usdot/${num}`);
      setUsdotData(res.data);
      navigate(`/status/${num}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'USDOT not found. Please verify the number.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 10%, #0D2A4F 0%, #051B35 65%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>

      {/* Logo */}
      <div className="animate-fadeIn" style={{ marginBottom: '20px' }}>
        <img src={LOGO_CIRCULAR} alt="TRC Logo" data-testid="trc-logo" style={{ width: '170px', height: '170px', objectFit: 'contain', borderRadius: '50%' }} />
      </div>

      {/* Tagline */}
      <p className="animate-fadeIn" style={{ fontFamily: "'Playfair Display', serif", fontSize: '19px', fontStyle: 'italic', color: '#F9E498', textAlign: 'center', marginBottom: '12px', lineHeight: 1.4, animationDelay: '0.1s', opacity: 0 }}>
        "We Worry, So You Don't Have To."
      </p>

      <p className="animate-fadeIn" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '2px', color: 'rgba(218,165,32,0.7)', textTransform: 'uppercase', marginBottom: '36px', animationDelay: '0.2s', opacity: 0 }}>
        USDOT Compliance Portal
      </p>

      {/* Search Form */}
      <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '380px', animationDelay: '0.3s', opacity: 0 }} className="animate-fadeIn">
        <div style={{ position: 'relative', marginBottom: '14px' }}>
          <i className="fas fa-truck" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#DAA520', fontSize: '16px', zIndex: 1 }} />
          <input
            type="text"
            value={usdot}
            onChange={e => setUsdot(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter USDOT Number"
            maxLength={8}
            data-testid="usdot-input"
            style={{ width: '100%', padding: '18px 16px 18px 46px', fontSize: '18px', background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(218,165,32,0.5)', borderRadius: '12px', color: 'white', outline: 'none', boxSizing: 'border-box', letterSpacing: '3px', fontWeight: '600', fontFamily: "'Montserrat', sans-serif", textAlign: 'center' }}
          />
        </div>

        {error && (
          <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.4)', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', color: '#FCA5A5', fontSize: '13px', textAlign: 'center' }}>
            <i className="fas fa-exclamation-circle" style={{ marginRight: '6px' }} />{error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !usdot}
          data-testid="check-status-btn"
          className="gold-btn"
          style={{ width: '100%', padding: '18px', fontSize: '15px', borderRadius: '12px', justifyContent: 'center' }}
        >
          {loading ? (
            <><i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }} />SEARCHING FMCSA DATABASE...</>
          ) : (
            <><i className="fas fa-search" style={{ marginRight: '8px' }} />CHECK COMPLIANCE STATUS</>
          )}
        </button>
      </form>

      {/* Sub-text */}
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '14px', textAlign: 'center' }}>
        No account required &bull; Instant results
      </p>

      {/* Login Link */}
      <div style={{ marginTop: '48px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <a href="/login" data-testid="login-link" style={{ color: '#DAA520', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>
          <i className="fas fa-user-circle" style={{ marginRight: '6px' }} />Client Portal Login
        </a>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
        <a href="tel:8776682114" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'none' }}>
          <i className="fas fa-phone" style={{ marginRight: '6px' }} />877-668-2114
        </a>
      </div>

      {/* Disclaimer */}
      <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', marginTop: '24px', textAlign: 'center', maxWidth: '320px', lineHeight: 1.6 }}>
        TRC is a private service, NOT affiliated with FMCSA or USDOT. You may file directly at fmcsa.dot.gov for free.
      </p>
    </div>
  );
}
