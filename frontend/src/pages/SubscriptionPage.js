import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;
const LOGO_SQUARE = 'https://customer-assets.emergentagent.com/job_44f8ad78-8ec0-4a92-b07a-3505ef291e27/artifacts/qisdrhs0_unnamed%20%281%29.jpg';

const TIERS = [
  {
    id: 'BRONZE',
    name: 'Bronze',
    price: 119,
    period: '/year',
    color: '#CD7F32',
    icon: 'fas fa-shield-alt',
    dotLimit: '1 USDOT',
    features: [
      'Email Renewal Reminders',
      '30-Day Early Warnings',
      'Basic Dashboard',
      'Compliance Status Checks',
      '1 USDOT Number',
      'Document Storage (1GB)',
    ],
    notIncluded: ['SMS Alerts', 'Priority Support', 'Multi-USDOT'],
  },
  {
    id: 'SILVER',
    name: 'Silver',
    price: 499,
    period: '/year',
    color: '#A8B4BC',
    icon: 'fas fa-shield-alt',
    dotLimit: '5 USDOT',
    featured: true,
    badge: 'MOST POPULAR',
    features: [
      'Everything in Bronze',
      '5 USDOT Numbers',
      'SMS Alerts',
      'Priority Support',
      'Document Storage (5GB)',
      'Filing History & Reports',
      '10% Discount on Filings',
    ],
    notIncluded: ['Unlimited USDOT', 'Dedicated Manager'],
  },
  {
    id: 'GOLD',
    name: 'Gold',
    price: 1199,
    period: '/year',
    color: '#DAA520',
    icon: 'fas fa-crown',
    dotLimit: 'Unlimited',
    badge: 'ENTERPRISE',
    features: [
      'Everything in Silver',
      'Unlimited USDOT Numbers',
      'Dedicated Account Manager',
      'Audit Preparation Guide',
      'Unlimited Document Storage',
      '20% Discount on Filings',
      'White-Glove Service',
      'Custom Compliance Reports',
    ],
    notIncluded: [],
  },
];

function TierCard({ tier, onSelect }) {
  return (
    <div
      className={`tier-card ${tier.featured ? 'featured' : ''}`}
      data-testid={`tier-${tier.id.toLowerCase()}`}
      style={{ marginBottom: '16px', position: 'relative', overflow: 'hidden' }}
    >
      {/* Circuit overlay */}
      <div className="circuit-bg" style={{ position: 'absolute', inset: 0, borderRadius: '16px', opacity: 0.5 }} />

      {/* Badge */}
      {tier.badge && (
        <div style={{ position: 'absolute', top: '14px', right: '14px', background: `linear-gradient(180deg, ${tier.color}, ${tier.color}CC)`, color: '#0A2342', fontSize: '9px', fontWeight: 800, padding: '3px 10px', borderRadius: '20px', fontFamily: "'Montserrat', sans-serif", letterSpacing: '0.8px' }}>
          {tier.badge}
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div className="hex-badge" style={{ width: '52px', height: '58px', background: `linear-gradient(160deg, rgba(13,42,79,0.9), rgba(5,27,53,0.95))`, border: `2px solid ${tier.color}` }}>
            <i className={tier.icon} style={{ fontSize: '22px', color: tier.color }} />
          </div>
          <div>
            <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '18px', color: tier.color, textTransform: 'uppercase', letterSpacing: '1px' }}>{tier.name}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{tier.dotLimit} Monitoring</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: '28px', color: 'white', lineHeight: 1 }}>
              ${tier.price.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{tier.period}</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>~${(tier.price / 12).toFixed(0)}/mo</div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: `linear-gradient(90deg, transparent, ${tier.color}50, transparent)`, marginBottom: '14px' }} />

        {/* Features */}
        <div style={{ marginBottom: '16px' }}>
          {tier.features.map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px' }}>
              <i className="fas fa-check-circle" style={{ color: '#10B981', fontSize: '12px', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{f}</span>
            </div>
          ))}
          {tier.notIncluded.map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px' }}>
              <i className="fas fa-times-circle" style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', textDecoration: 'line-through' }}>{f}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => onSelect(tier)}
          data-testid={`select-${tier.id.toLowerCase()}-btn`}
          style={{
            width: '100%', padding: '14px', border: 'none', borderRadius: '10px', cursor: 'pointer',
            background: tier.featured ? `linear-gradient(180deg, #F9E498, #DAA520)` : 'transparent',
            color: tier.featured ? '#0A2342' : tier.color,
            border: tier.featured ? 'none' : `2px solid ${tier.color}`,
            fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '13px',
            textTransform: 'uppercase', letterSpacing: '0.8px',
            boxShadow: tier.featured ? '0 4px 15px rgba(218,165,32,0.4)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          <i className="fas fa-arrow-right" style={{ marginRight: '8px' }} />
          GET STARTED WITH {tier.name.toUpperCase()}
        </button>
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { auth } = useApp();
  const [loading, setLoading] = useState(null);

  const handleSelect = async (tier) => {
    if (!auth?.token) {
      navigate(`/login?redirect=subscription&tier=${tier.id}`);
      return;
    }
    setLoading(tier.id);
    try {
      const res = await axios.post(`${API}/api/payments/create-checkout`, {
        tier: `SUB_${tier.id}`,
        usdot_number: 'SUBSCRIPTION',
        email: auth.user?.email || '',
        origin_url: window.location.origin,
        amount: tier.price,
        subscription: true,
      });
      window.location.href = res.data.checkout_url;
    } catch (err) {
      // If subscription checkout not implemented, show contact
      alert(`To subscribe to the ${tier.name} plan, please call us at 877-668-2114 or email questions@transportationregulatorycompliance.com`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 0%, #0D2A4F, #051B35)', position: 'relative' }}>
      <div className="circuit-bg" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />

      {/* Header */}
      <div className="page-header" style={{ justifyContent: 'space-between' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#DAA520', cursor: 'pointer', padding: '4px 8px' }}>
          <i className="fas fa-arrow-left" style={{ fontSize: '18px' }} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={LOGO_SQUARE} alt="TRC" style={{ width: '28px', height: '28px', objectFit: 'contain', borderRadius: '4px' }} />
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '13px', color: '#DAA520', letterSpacing: '1px' }}>PRICING PLANS</span>
        </div>
        <div style={{ width: '40px' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 10, padding: '24px 16px 40px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(218,165,32,0.1)', border: '1px solid rgba(218,165,32,0.3)', borderRadius: '20px', padding: '6px 16px', marginBottom: '12px' }}>
            <i className="fas fa-trophy" style={{ color: '#DAA520', fontSize: '11px' }} />
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '10px', color: '#DAA520', letterSpacing: '1.5px' }}>TRANSPARENT TIERED PRICING</span>
          </div>

          <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: '22px', color: 'white', margin: '0 0 8px', lineHeight: 1.2 }}>
            <span className="gold-text">40% More Affordable</span><br />
            Than Legacy Competitors
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', maxWidth: '320px', margin: '0 auto 16px', lineHeight: 1.6 }}>
            While J.J. Keller charges $5,000–$15,000+/year, TRC starts at just $119/year with more features.
          </p>

          {/* Comparison badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '8px', padding: '8px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: '#FCA5A5', fontFamily: "'Montserrat', sans-serif", fontWeight: 700, letterSpacing: '0.8px' }}>LEGACY LEADER</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#FCA5A5', fontFamily: "'Montserrat', sans-serif" }}>$5K–$15K+/yr</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: '#DAA520', fontSize: '18px', fontWeight: 900 }}>→</div>
            <div style={{ background: 'rgba(218,165,32,0.15)', border: '1px solid rgba(218,165,32,0.4)', borderRadius: '8px', padding: '8px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: '#DAA520', fontFamily: "'Montserrat', sans-serif", fontWeight: 700, letterSpacing: '0.8px' }}>TRC ECOSYSTEM</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#F9E498', fontFamily: "'Montserrat', sans-serif" }}>$119–$1,199/yr</div>
            </div>
          </div>
        </div>

        {/* Tier Cards */}
        {TIERS.map(tier => (
          <TierCard
            key={tier.id}
            tier={tier}
            onSelect={handleSelect}
          />
        ))}

        {/* One-time filing section */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '2px dashed rgba(218,165,32,0.3)', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
          <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '12px', color: '#DAA520', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-file-signature" />ONE-TIME FILING SERVICES
          </div>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px', lineHeight: 1.6 }}>
            Need to file your MCS-150 now? No subscription required. One-time filing fees are separate from monitoring plans.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: 'rgba(218,165,32,0.08)', border: '1px solid rgba(218,165,32,0.3)', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '20px', color: '#F9E498' }}>$299</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '3px' }}>2-Year MCS-150 Filing</div>
            </div>
            <div style={{ background: 'rgba(218,165,32,0.08)', border: '1px solid rgba(218,165,32,0.3)', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '20px', color: '#F9E498' }}>$499</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '3px' }}>4-Year MCS-150 Premium</div>
            </div>
          </div>
          <button onClick={() => navigate('/')} className="gold-btn" style={{ width: '100%', marginTop: '12px', padding: '13px', fontSize: '13px', borderRadius: '10px', justifyContent: 'center' }}>
            <i className="fas fa-search" style={{ marginRight: '8px' }} />CHECK MY USDOT STATUS NOW
          </button>
        </div>

        {/* Feature comparison matrix */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center', marginBottom: '12px' }}>
            Full Feature Comparison
          </div>
          <div style={{ border: '2px solid rgba(218,165,32,0.3)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', background: '#0A2342', borderBottom: '1px solid rgba(218,165,32,0.3)', padding: '10px 8px' }}>
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Feature</div>
              {TIERS.map(t => (
                <div key={t.id} style={{ textAlign: 'center', fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '10px', color: t.color, textTransform: 'uppercase' }}>{t.name}</div>
              ))}
            </div>
            {[
              { label: 'USDOT Monitoring', vals: ['1', '5', 'Unlimited'] },
              { label: 'Email Reminders', vals: [true, true, true] },
              { label: 'SMS Alerts', vals: [false, true, true] },
              { label: 'Priority Support', vals: [false, true, true] },
              { label: 'Document Storage', vals: ['1GB', '5GB', 'Unlimited'] },
              { label: 'Filing Discount', vals: [false, '10%', '20%'] },
              { label: 'Dedicated Manager', vals: [false, false, true] },
            ].map((row, i) => (
              <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '9px 8px', borderTop: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)' }}>{row.label}</div>
                {row.vals.map((v, j) => (
                  <div key={j} style={{ textAlign: 'center' }}>
                    {v === true ? <i className="fas fa-check" style={{ color: '#10B981', fontSize: '11px' }} />
                      : v === false ? <i className="fas fa-minus" style={{ color: 'rgba(255,255,255,0.15)', fontSize: '11px' }} />
                      : <span style={{ fontSize: '11px', color: '#F9E498', fontWeight: 600 }}>{v}</span>
                    }
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: '11px', lineHeight: 1.8 }}>
          <p style={{ margin: '0 0 6px' }}>Questions about plans? We're here.</p>
          <a href="tel:8776682114" style={{ color: '#DAA520', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
            <i className="fas fa-phone" style={{ marginRight: '6px' }} />877-668-2114
          </a>
          <br />
          <a href="mailto:questions@transportationregulatorycompliance.com" style={{ color: 'rgba(218,165,32,0.5)', textDecoration: 'none', fontSize: '11px' }}>
            questions@transportationregulatorycompliance.com
          </a>
        </div>
      </div>
    </div>
  );
}
