import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;
const LOGO_CIRCULAR = 'https://customer-assets.emergentagent.com/job_44f8ad78-8ec0-4a92-b07a-3505ef291e27/artifacts/wo89kflz_1773349561130.png.jpg';
const LOGO_SQUARE = 'https://customer-assets.emergentagent.com/job_44f8ad78-8ec0-4a92-b07a-3505ef291e27/artifacts/qisdrhs0_unnamed%20%281%29.jpg';

function HexBadge({ icon, label, color = '#DAA520', size = 56 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div className="hex-badge" style={{ width: size, height: size * 1.1, background: `linear-gradient(160deg, #0D2A4F, #051B35)`, border: `2px solid ${color}`, borderRadius: '8px' }}>
        <i className={icon} style={{ fontSize: size * 0.35, color: color }} />
      </div>
      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 1.3, maxWidth: '64px', fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}>{label}</span>
    </div>
  );
}

function FeatureCard({ icon, title, desc, badge }) {
  return (
    <div style={{ background: 'linear-gradient(145deg, rgba(13,42,79,0.8), rgba(5,27,53,0.9))', border: '1px solid rgba(218,165,32,0.25)', borderRadius: '14px', padding: '18px', position: 'relative', overflow: 'hidden' }}>
      {/* Gold corner accent */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: '40px', height: '40px', background: 'linear-gradient(135deg, transparent 50%, rgba(218,165,32,0.15) 50%)' }} />
      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        <div className="hex-badge" style={{ width: '44px', height: '50px', background: 'linear-gradient(180deg, #F9E498, #DAA520)', flexShrink: 0 }}>
          <i className={icon} style={{ fontSize: '18px', color: '#0A2342' }} />
        </div>
        <div>
          {badge && <span style={{ background: 'rgba(218,165,32,0.2)', border: '1px solid rgba(218,165,32,0.4)', color: '#F9E498', fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '20px', fontFamily: "'Montserrat', sans-serif", letterSpacing: '0.8px', display: 'inline-block', marginBottom: '4px' }}>{badge}</span>}
          <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '13px', color: '#DAA520', marginBottom: '4px' }}>{title}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{desc}</div>
        </div>
      </div>
    </div>
  );
}

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
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 10%, #0D2A4F 0%, #051B35 65%)', position: 'relative', overflowX: 'hidden' }}>
      {/* Circuit board overlay */}
      <div className="circuit-bg" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.8 }} />

      {/* Top bar */}
      <div style={{ position: 'relative', zIndex: 10, background: 'rgba(10,35,66,0.95)', borderBottom: '1px solid rgba(218,165,32,0.2)', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={LOGO_SQUARE} alt="TRC" style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '6px' }} />
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '13px', color: '#DAA520', letterSpacing: '1px' }}>TRC</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <a href="/subscription" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', textDecoration: 'none', fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}>PRICING</a>
          <a href="/login" data-testid="login-link" style={{ color: '#DAA520', fontSize: '12px', textDecoration: 'none', fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>LOGIN</a>
        </div>
      </div>

      {/* ── HERO SECTION ── */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '36px 20px 32px', textAlign: 'center' }}>
        {/* Logo */}
        <div className="animate-scaleIn" style={{ marginBottom: '16px' }}>
          <img src={LOGO_CIRCULAR} alt="TRC Logo" data-testid="trc-logo" style={{ width: '150px', height: '150px', objectFit: 'contain', borderRadius: '50%', boxShadow: '0 0 40px rgba(218,165,32,0.3), 0 0 80px rgba(218,165,32,0.1)' }} />
        </div>

        {/* Title */}
        <h1 className="animate-fadeInUp" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '22px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: '#DAA520', margin: '0 0 6px', lineHeight: 1.2 }}>
          TRC COMPLIANCE PORTAL
        </h1>

        <p className="animate-fadeInUp" style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', fontStyle: 'italic', color: '#F9E498', marginBottom: '24px', animationDelay: '0.1s', opacity: 0, lineHeight: 1.4 }}>
          "We Worry, So You Don't Have To."
        </p>

        {/* ── USDOT SEARCH ── */}
        <form onSubmit={handleSearch} className="animate-fadeInUp" style={{ width: '100%', maxWidth: '380px', animationDelay: '0.2s', opacity: 0 }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(218,165,32,0.4)', borderRadius: '14px', padding: '16px', marginBottom: '12px', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: '11px', fontFamily: "'Montserrat', sans-serif", fontWeight: 700, color: 'rgba(218,165,32,0.7)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '10px', textAlign: 'left' }}>
              <i className="fas fa-search" style={{ marginRight: '6px' }} />INSTANT USDOT STATUS CHECK
            </div>
            <div style={{ position: 'relative' }}>
              <i className="fas fa-truck" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#DAA520', fontSize: '15px' }} />
              <input
                type="text"
                value={usdot}
                onChange={e => setUsdot(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter USDOT Number"
                maxLength={8}
                data-testid="usdot-input"
                style={{ width: '100%', padding: '14px 14px 14px 44px', fontSize: '17px', background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(218,165,32,0.5)', borderRadius: '10px', color: 'white', outline: 'none', boxSizing: 'border-box', letterSpacing: '3px', fontWeight: 700, fontFamily: "'Montserrat', sans-serif", textAlign: 'center' }}
              />
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.4)', borderRadius: '8px', padding: '10px 14px', marginBottom: '10px', color: '#FCA5A5', fontSize: '12px', textAlign: 'center' }}>
              <i className="fas fa-exclamation-circle" style={{ marginRight: '6px' }} />{error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !usdot}
            data-testid="check-status-btn"
            className="gold-btn"
            style={{ width: '100%', padding: '16px', fontSize: '14px', borderRadius: '12px', justifyContent: 'center' }}
          >
            {loading ? (
              <><i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }} />SEARCHING FMCSA DATABASE...</>
            ) : (
              <><i className="fas fa-shield-alt" style={{ marginRight: '8px' }} />CHECK COMPLIANCE STATUS</>
            )}
          </button>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', marginTop: '8px', textAlign: 'center' }}>
            No account required &bull; Instant results &bull; Live FMCSA data
          </p>
        </form>
      </div>

      {/* ── FEATURES SECTION ── */}
      <div style={{ position: 'relative', zIndex: 10, padding: '0 16px 24px' }}>
        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(218,165,32,0.1)', border: '1px solid rgba(218,165,32,0.3)', borderRadius: '20px', padding: '6px 16px', marginBottom: '10px' }}>
            <i className="fas fa-star" style={{ color: '#DAA520', fontSize: '11px' }} />
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '10px', color: '#DAA520', letterSpacing: '1.5px', textTransform: 'uppercase' }}>THE TRC DIGITAL ADVANTAGE</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <FeatureCard
            icon="fas fa-mobile-alt"
            title="Native Mobile-First Experience"
            desc="True iOS/Android apps provide faster, offline-capable compliance management compared to legacy web portals."
            badge="INSTANT ACCESS"
          />
          <FeatureCard
            icon="fas fa-funnel-dollar"
            title='The "Golden Goose" Funnel'
            desc="Users get instant USDOT status results without login, reducing friction and building trust from the first tap."
            badge="NO ACCOUNT NEEDED"
          />
          <FeatureCard
            icon="fas fa-bell"
            title="30-Day Early Warning System"
            desc="Intelligent multi-channel alerts prevent massive fines by flagging upcoming filings via email and push notifications."
            badge="FREE FEATURE"
          />
          <FeatureCard
            icon="fas fa-folder-open"
            title="All-Inclusive Driver Portal"
            desc="Every tier includes a document management system, saving drivers up to $500 annually in compliance costs."
            badge="ALL TIERS"
          />
        </div>
      </div>

      {/* ── QUICK STATS ── */}
      <div style={{ position: 'relative', zIndex: 10, padding: '0 16px 24px' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(218,165,32,0.12), rgba(218,165,32,0.06))', border: '2px solid rgba(218,165,32,0.3)', borderRadius: '16px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
          <div className="circuit-bg" style={{ position: 'absolute', inset: 0, borderRadius: '16px', opacity: 0.5 }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '13px', color: '#DAA520', textTransform: 'uppercase', letterSpacing: '1.5px', textAlign: 'center', marginBottom: '16px' }}>
              Why Choose TRC?
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', textAlign: 'center' }}>
              {[
                { val: '40%', label: 'More Affordable' },
                { val: '<3s', label: 'USDOT Lookup' },
                { val: '24/7', label: 'Monitoring' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: '22px', color: '#F9E498', lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '4px', fontFamily: "'Montserrat', sans-serif" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── COMPARISON TABLE ── */}
      <div style={{ position: 'relative', zIndex: 10, padding: '0 16px 24px' }}>
        <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center', marginBottom: '12px' }}>
          Comparing TRC against the industry's legacy leader
        </div>

        <div style={{ border: '2px solid rgba(218,165,32,0.4)', borderRadius: '14px', overflow: 'hidden' }}>
          {/* Header Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1.4fr', background: '#0A2342', borderBottom: '1px solid rgba(218,165,32,0.3)' }}>
            <div style={{ padding: '10px 10px', fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}> </div>
            <div style={{ padding: '10px 8px', fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '10px', color: '#DC2626', textTransform: 'uppercase', borderLeft: '1px solid rgba(218,165,32,0.2)', textAlign: 'center' }}>Legacy Leader<br /><span style={{ fontSize: '9px', fontWeight: 400, color: 'rgba(255,255,255,0.4)' }}>(J.J. Keller)</span></div>
            <div style={{ padding: '10px 8px', fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '10px', color: '#DAA520', textTransform: 'uppercase', borderLeft: '1px solid rgba(218,165,32,0.2)', textAlign: 'center', background: 'rgba(218,165,32,0.06)' }}>TRC Ecosystem</div>
          </div>

          {[
            {
              label: 'Pricing',
              legacy: { val: '$5,000-$15,000+/yr', bad: true },
              trc: { val: '$119-$1,199/yr', good: true },
            },
            {
              label: 'User Experience',
              legacy: { val: 'Outdated Web / Manual', bad: true },
              trc: { val: 'Modern Mobile App', good: true },
            },
            {
              label: 'Setup Speed',
              legacy: { val: 'Weeks (Sales-heavy)', bad: true },
              trc: { val: 'Minutes (Self-service)', good: true },
            },
          ].map((row, i) => (
            <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1.4fr', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <div style={{ padding: '11px 10px', fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '10px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center' }}>{row.label}</div>
              <div style={{ padding: '11px 8px', borderLeft: '1px solid rgba(218,165,32,0.15)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <i className="fas fa-times" style={{ color: '#DC2626', fontSize: '10px' }} />
                <span style={{ fontSize: '11px', color: '#FCA5A5' }}>{row.legacy.val}</span>
              </div>
              <div style={{ padding: '11px 8px', borderLeft: '1px solid rgba(218,165,32,0.15)', textAlign: 'center', background: 'rgba(218,165,32,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <i className="fas fa-check" style={{ color: '#10B981', fontSize: '10px' }} />
                <span style={{ fontSize: '11px', color: '#6EE7B7', fontWeight: 600 }}>{row.trc.val}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SUBSCRIPTION TIERS PREVIEW ── */}
      <div style={{ position: 'relative', zIndex: 10, padding: '0 16px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
          <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '13px', color: '#DAA520', textTransform: 'uppercase', letterSpacing: '1.5px' }}>TRANSPARENT TIERED PRICING</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Starting at just $119/year</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          {[
            { name: 'BRONZE', price: '$119', period: '/yr', color: '#CD7F32', icon: 'fas fa-shield-alt', desc: '1 USDOT' },
            { name: 'SILVER', price: '$499', period: '/yr', color: '#C0C0C0', icon: 'fas fa-shield-alt', desc: '5 USDOT', featured: true },
            { name: 'GOLD', price: '$1,199', period: '/yr', color: '#DAA520', icon: 'fas fa-crown', desc: 'Unlimited' },
          ].map(t => (
            <div key={t.name} style={{ background: t.featured ? 'linear-gradient(145deg, #0D2A4F, #051B35)' : 'rgba(255,255,255,0.03)', border: `2px solid ${t.featured ? t.color : 'rgba(218,165,32,0.2)'}`, borderRadius: '12px', padding: '14px 10px', textAlign: 'center', boxShadow: t.featured ? `0 4px 20px rgba(218,165,32,0.2)` : 'none' }}>
              <i className={t.icon} style={{ fontSize: '18px', color: t.color, marginBottom: '6px', display: 'block' }} />
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '10px', color: t.color, letterSpacing: '0.5px' }}>{t.name}</div>
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: '16px', color: 'white', lineHeight: 1.1, marginTop: '4px' }}>{t.price}<span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>{t.period}</span></div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{t.desc}</div>
            </div>
          ))}
        </div>

        <button onClick={() => navigate('/subscription')} className="gold-outline-btn" style={{ width: '100%', padding: '13px', justifyContent: 'center', fontSize: '12px' }} data-testid="view-plans-btn">
          <i className="fas fa-list" style={{ marginRight: '8px' }} />VIEW ALL PLANS & FEATURES
        </button>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ position: 'relative', zIndex: 10, padding: '20px 16px 32px', textAlign: 'center', borderTop: '1px solid rgba(218,165,32,0.15)' }}>
        <img src={LOGO_CIRCULAR} alt="TRC" style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '50%', marginBottom: '12px', opacity: 0.8 }} />
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '10px' }}>
          <a href="tel:8776682114" style={{ color: '#DAA520', fontSize: '13px', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="fas fa-phone" />877-668-2114
          </a>
          <a href="mailto:questions@transportationregulatorycompliance.com" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textDecoration: 'none' }}>
            <i className="fas fa-envelope" style={{ marginRight: '4px' }} />Email Us
          </a>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '9px', lineHeight: 1.6, maxWidth: '340px', margin: '0 auto' }}>
          TRC is a private service, NOT affiliated with FMCSA or USDOT. You may file directly at fmcsa.dot.gov for free. TRC fees are for software, processing, and monitoring services.
        </p>
      </div>
    </div>
  );
}
