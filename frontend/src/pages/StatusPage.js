import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

const STATUS_CONFIG = {
  RED: { color: '#DC2626', bg: '#7f1d1d', label: 'EXPIRED', icon: 'fas fa-exclamation-triangle', overlayBg: 'rgba(10,5,5,0.95)' },
  YELLOW: { color: '#FBBF24', bg: '#78350f', label: 'DUE SOON', icon: 'fas fa-clock', overlayBg: 'rgba(10,8,2,0.92)' },
  GREEN: { color: '#10B981', bg: '#064e3b', label: 'COMPLIANT', icon: 'fas fa-check-circle', overlayBg: 'rgba(2,10,8,0.9)' },
  UNKNOWN: { color: '#6B7280', bg: '#1f2937', label: 'UNKNOWN', icon: 'fas fa-question-circle', overlayBg: 'rgba(0,0,0,0.9)' },
};

function ComplianceShield({ status, size = 80 }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.UNKNOWN;
  const cls = status === 'RED' ? 'pulse-red' : '';
  return (
    <div className={cls} style={{ width: size, height: size, position: 'relative', display: 'inline-block' }}>
      <svg width={size} height={size * 1.2} viewBox="0 0 80 96">
        <path d="M40 4 L72 16 L72 52 Q72 76 40 92 Q8 76 8 52 L8 16 Z" fill={cfg.color} stroke="#DAA520" strokeWidth="2.5" />
        <path d="M40 12 L64 22 L64 52 Q64 72 40 84 Q16 72 16 52 L16 22 Z" fill={cfg.bg} opacity="0.6" />
        <text x="40" y="54" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold" fontFamily="Montserrat, sans-serif">{status === 'RED' ? '!' : status === 'GREEN' ? '✓' : status === 'YELLOW' ? '~' : '?'}</text>
      </svg>
    </div>
  );
}

function TruckLoader() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '32px' }}>
      <div style={{ overflow: 'hidden', width: '100%', height: '60px', position: 'relative' }}>
        <div className="truck-drive" style={{ position: 'absolute', top: 0 }}>
          <svg width="120" height="60" viewBox="0 0 120 60">
            <rect x="10" y="15" width="70" height="30" rx="3" fill="#DAA520" />
            <rect x="80" y="20" width="30" height="25" rx="2" fill="#DAA520" />
            <rect x="85" y="25" width="20" height="14" rx="1" fill="#051B35" opacity="0.7" />
            <circle cx="25" cy="48" r="8" fill="#0A2342" stroke="#DAA520" strokeWidth="2" />
            <circle cx="85" cy="48" r="8" fill="#0A2342" stroke="#DAA520" strokeWidth="2" />
            <circle cx="25" cy="48" r="3" fill="#DAA520" />
            <circle cx="85" cy="48" r="3" fill="#DAA520" />
          </svg>
        </div>
      </div>
      <div style={{ height: '3px', width: '200px', background: 'rgba(218,165,32,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
        <div className="gold-shimmer-bg" style={{ height: '100%', borderRadius: '2px' }} />
      </div>
      <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '13px', letterSpacing: '2px', color: 'rgba(218,165,32,0.8)', textTransform: 'uppercase' }}>
        Pulling compliance data...
      </p>
    </div>
  );
}

function PricingSection({ usdot, onBack }) {
  const [selected, setSelected] = useState(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePay = async () => {
    if (!email.trim() || !email.includes('@')) { setError('Please enter a valid email address'); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/payments/create-checkout`, { tier: selected, usdot_number: usdot, email, origin_url: window.location.origin });
      window.location.href = res.data.checkout_url;
    } catch (err) {
      setError(err.response?.data?.detail || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  const plans = [
    { tier: '2_YEAR', name: 'STANDARD PROTECTION', price: 299, period: '2-Year', features: ['Complete Filing Service', 'Expert Review', '30-Day Monitoring', 'Instant Submission', 'Stripe Receipt'] },
    { tier: '4_YEAR', name: 'PREMIUM PROTECTION', price: 499, period: '4-Year', badge: '★ BEST VALUE', features: ['Everything in Standard', 'Extended 4-Year Coverage', 'Priority Support', 'Audit Preparation', 'Dedicated Account Manager'] },
  ];

  return (
    <div style={{ padding: '0 16px 24px' }}>
      {plans.map(p => (
        <div key={p.tier} className={`pricing-card ${selected === p.tier ? 'selected' : ''}`} onClick={() => setSelected(p.tier)} data-testid={`plan-${p.tier}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div>
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '13px', color: '#0A2342', letterSpacing: '0.5px' }}>{p.name}</div>
              {p.badge && <span style={{ background: 'linear-gradient(180deg, #F9E498, #DAA520)', color: '#0A2342', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', fontFamily: "'Montserrat', sans-serif" }}>{p.badge}</span>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#0A2342', fontFamily: "'Montserrat', sans-serif" }}>${p.price}</div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>{p.period} filing</div>
            </div>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
            {p.features.map(f => (
              <li key={f} style={{ fontSize: '12px', color: '#374151', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <i className="fas fa-check" style={{ color: '#10B981', fontSize: '10px' }} />{f}
              </li>
            ))}
          </ul>
          {selected !== p.tier ? (
            <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(218,165,32,0.1)', borderRadius: '8px', color: '#DAA520', fontWeight: 700, fontSize: '13px', fontFamily: "'Montserrat', sans-serif" }}>
              SELECT &rarr;
            </div>
          ) : (
            <div style={{ marginTop: '12px' }}>
              <input type="email" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} data-testid="payment-email-input"
                style={{ width: '100%', padding: '12px 14px', border: '2px solid #DAA520', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#0A2342', marginBottom: '8px' }} />
              {error && <p style={{ color: '#DC2626', fontSize: '12px', margin: '0 0 8px' }}>{error}</p>}
              <button onClick={(e) => { e.stopPropagation(); handlePay(); }} disabled={loading} data-testid="complete-payment-btn"
                className="gold-btn" style={{ width: '100%', padding: '14px', fontSize: '14px', borderRadius: '8px', justifyContent: 'center' }}>
                {loading ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: '6px' }} />PROCESSING...</> : <><i className="fas fa-lock" style={{ marginRight: '6px' }} />COMPLETE PAYMENT</>}
              </button>
              <p style={{ fontSize: '11px', color: '#6B7280', textAlign: 'center', marginTop: '6px' }}>
                <i className="fas fa-lock" style={{ marginRight: '4px', color: '#10B981' }} />256-bit encrypted &bull; Powered by Stripe
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function StatusPage() {
  const { usdot } = useParams();
  const navigate = useNavigate();
  const { usdotData, setUsdotData } = useApp();
  const [data, setData] = useState(usdotData?.usdot_number === usdot ? usdotData : null);
  const [loadingData, setLoadingData] = useState(!data);
  const [error, setError] = useState('');
  const [overlayDismissed, setOverlayDismissed] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => {
    if (!data) {
      axios.get(`${API}/api/usdot/${usdot}`)
        .then(r => { setData(r.data); setUsdotData(r.data); })
        .catch(() => setError('Failed to load compliance data'))
        .finally(() => setLoadingData(false));
    }
  }, [usdot]);

  if (loadingData) return <TruckLoader />;
  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', gap: '16px' }}>
      <i className="fas fa-exclamation-circle" style={{ fontSize: '48px', color: '#DC2626' }} />
      <p style={{ color: 'white', textAlign: 'center', fontSize: '16px' }}>{error}</p>
      <button className="gold-btn" onClick={() => navigate('/')}>Try Again</button>
    </div>
  );

  const status = data?.compliance_status || 'UNKNOWN';
  const cfg = STATUS_CONFIG[status];
  const fmcsa = data?.fmcsa_data || {};
  const showOverlay = !overlayDismissed || status === 'RED';

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '20px' }}>
      {/* Header */}
      <div className="page-header">
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#DAA520', cursor: 'pointer', padding: '4px 8px' }}>
          <i className="fas fa-arrow-left" style={{ fontSize: '18px' }} />
        </button>
        <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '14px', letterSpacing: '1px', color: '#DAA520' }}>COMPLIANCE STATUS</span>
      </div>

      {/* Company Card */}
      <div style={{ padding: '16px' }}>
        <div className="trc-card">
          <div style={{ background: '#0A2342', padding: '16px', borderRadius: '12px 12px 0 0' }}>
            <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '16px', color: 'white', marginBottom: '4px' }}>{fmcsa.legal_name || 'Unknown Carrier'}</div>
            {fmcsa.dba_name && <div style={{ fontSize: '12px', color: '#F9E498', marginBottom: '6px' }}>DBA: {fmcsa.dba_name}</div>}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}><i className="fas fa-id-card" style={{ marginRight: '4px', color: '#DAA520' }} />USDOT #{usdot}</span>
              {fmcsa.mc_number && <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}><i className="fas fa-certificate" style={{ marginRight: '4px', color: '#DAA520' }} />MC#{fmcsa.mc_number}</span>}
            </div>
          </div>
          <div style={{ padding: '16px', color: '#374151' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#9CA3AF', marginBottom: '3px' }}>Address</div>
                <div style={{ fontSize: '13px', lineHeight: 1.4 }}>
                  {fmcsa.physical_address?.street}<br />
                  {fmcsa.physical_address?.city}, {fmcsa.physical_address?.state} {fmcsa.physical_address?.zip}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#9CA3AF', marginBottom: '3px' }}>Fleet Info</div>
                <div style={{ fontSize: '13px' }}>{fmcsa.fleet_size ? `${fmcsa.fleet_size} Power Units` : 'N/A'}</div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>{fmcsa.operating_status}</div>
              </div>
            </div>

            {/* MCS-150 Status */}
            <div style={{ background: '#F9FAFB', border: `2px solid ${cfg.color}`, borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <ComplianceShield status={status} size={64} />
              <div>
                <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '11px', color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.8px' }}>MCS-150 Status</div>
                <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '18px', color: cfg.color }}>{cfg.label}</div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                  {data?.days_until_due !== null && data?.days_until_due !== undefined ? (
                    data.days_until_due < 0 ? `${Math.abs(data.days_until_due)} days overdue` : `Due in ${data.days_until_due} days`
                  ) : 'Unknown deadline'}
                </div>
                {data?.mcs_150_renewal_date && <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Renewal: {data.mcs_150_renewal_date}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Overlay */}
      {showOverlay && (
        <div className="status-overlay" style={{ background: cfg.overlayBg, padding: '0 0 40px' }}>
          <div style={{ padding: '24px 16px 16px', textAlign: 'center' }}>
            {status !== 'RED' && (
              <button onClick={() => setOverlayDismissed(true)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '20px' }}>
                <i className="fas fa-times" />
              </button>
            )}
            <ComplianceShield status={status} size={90} />

            {status === 'RED' && (
              <>
                <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '16px', fontWeight: 800, color: '#DAA520', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '16px 0 8px' }}>
                  REGULATORY ACTION REQUIRED
                </h2>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', maxWidth: '320px', margin: '0 auto 20px', lineHeight: 1.6 }}>
                  Your MCS-150 is <strong style={{ color: '#FCA5A5' }}>overdue by {Math.abs(data?.days_until_due)} days</strong>. Continued operation may result in fines or out-of-service orders.
                </p>
                <p style={{ fontSize: '12px', color: '#DAA520', fontWeight: 600, marginBottom: '20px', fontFamily: "'Montserrat', sans-serif" }}>SELECT A PLAN TO FILE NOW:</p>
                <PricingSection usdot={usdot} />
              </>
            )}

            {status === 'YELLOW' && (
              <>
                <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '15px', fontWeight: 800, color: '#FBBF24', textTransform: 'uppercase', letterSpacing: '1px', margin: '16px 0 8px' }}>
                  ACTION RECOMMENDED
                </h2>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', maxWidth: '320px', margin: '0 auto 20px', lineHeight: 1.6 }}>
                  Your MCS-150 is due in <strong style={{ color: '#FCD34D' }}>{data?.days_until_due} days</strong>. Renew early to avoid last-minute stress and potential issues.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 16px' }}>
                  <button className="gold-btn" onClick={() => setShowPricing(true)} style={{ width: '100%', padding: '16px', justifyContent: 'center' }}
                    data-testid="renew-now-btn">
                    <i className="fas fa-file-alt" style={{ marginRight: '8px' }} />RENEW NOW - FROM $299
                  </button>
                  <button className="gold-outline-btn" onClick={() => navigate(`/monitoring?usdot=${usdot}`)} style={{ width: '100%', padding: '14px', justifyContent: 'center' }}
                    data-testid="free-monitoring-btn">
                    <i className="fas fa-bell" style={{ marginRight: '8px' }} />Activate FREE 30-Day Monitoring
                  </button>
                </div>
                {showPricing && <PricingSection usdot={usdot} />}
              </>
            )}

            {status === 'GREEN' && (
              <>
                <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '15px', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '1px', margin: '16px 0 8px' }}>
                  FULLY COMPLIANT
                </h2>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', maxWidth: '320px', margin: '0 auto 20px', lineHeight: 1.6 }}>
                  Your MCS-150 is current. Next renewal due on <strong style={{ color: '#6EE7B7' }}>{data?.mcs_150_renewal_date}</strong> ({data?.days_until_due} days).
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 16px' }}>
                  <button className="gold-btn" onClick={() => navigate(`/monitoring?usdot=${usdot}`)} style={{ width: '100%', padding: '16px', justifyContent: 'center' }}
                    data-testid="activate-monitoring-btn">
                    <i className="fas fa-shield-alt" style={{ marginRight: '8px' }} />Activate FREE Early Warning System
                  </button>
                  <button className="gold-outline-btn" onClick={() => navigate('/')} style={{ width: '100%', padding: '14px', justifyContent: 'center' }}>
                    <i className="fas fa-search" style={{ marginRight: '8px' }} />Check Another USDOT
                  </button>
                </div>
              </>
            )}

            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '24px', padding: '0 20px', lineHeight: 1.5 }}>
              TRC is not affiliated with FMCSA. You may file directly with FMCSA for free. Our fees are for software, processing, and monitoring services.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
