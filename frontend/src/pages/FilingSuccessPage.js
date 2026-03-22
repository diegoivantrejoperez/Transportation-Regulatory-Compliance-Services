import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const LOGO_SQUARE = 'https://customer-assets.emergentagent.com/job_44f8ad78-8ec0-4a92-b07a-3505ef291e27/artifacts/qisdrhs0_unnamed%20%281%29.jpg';

export default function FilingSuccessPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { auth } = useApp();
  const confNumber = params.get('conf') || 'TRC-PENDING';
  const usdot = params.get('usdot') || '';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #064e3b 0%, #0A2342 50%, #051B35 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>

      {/* Animated checkmark */}
      <div className="animate-scaleIn" style={{ width: '90px', height: '90px', background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 40px rgba(16,185,129,0.5), 0 0 80px rgba(16,185,129,0.2)' }}>
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <path d="M8 22 L18 32 L36 12" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="200" style={{ animation: 'checkDraw 0.6s ease 0.3s forwards', strokeDashoffset: 200 }} />
        </svg>
      </div>

      <h1 className="animate-fadeInUp" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '22px', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
        FILING COMPLETE!
      </h1>
      <p className="animate-fadeInUp" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '6px', animationDelay: '0.1s' }}>
        Your MCS-150 update has been submitted to the FMCSA.
      </p>
      <p className="animate-fadeInUp" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '24px', animationDelay: '0.15s' }}>
        You'll receive confirmation within 24-48 hours.
      </p>

      {/* Confirmation Number */}
      <div className="animate-slideUp" style={{ background: 'rgba(218,165,32,0.15)', border: '2px solid rgba(218,165,32,0.4)', borderRadius: '12px', padding: '14px 24px', marginBottom: '24px', animationDelay: '0.2s' }}>
        <div style={{ fontSize: '11px', color: 'rgba(218,165,32,0.7)', fontFamily: "'Montserrat', sans-serif", textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Confirmation Number</div>
        <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '16px', fontWeight: 800, color: '#DAA520', letterSpacing: '1px' }}>{confNumber}</div>
      </div>

      {/* Next Steps */}
      <div className="trc-card animate-slideUp" style={{ width: '100%', maxWidth: '380px', padding: '20px', textAlign: 'left', marginBottom: '24px', animationDelay: '0.3s' }}>
        <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '13px', fontWeight: 700, color: '#0A2342', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fas fa-list-ol" style={{ color: '#DAA520' }} />What Happens Next?
        </div>
        {[
          { n: 1, text: 'Check your email for receipt and confirmation from Stripe' },
          { n: 2, text: 'Your MCS-150 will be processed within 1-2 business days' },
          { n: 3, text: 'Monitor your compliance status 24/7 in your dashboard' },
        ].map(step => (
          <div key={step.n} style={{ display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'flex-start' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(180deg, #F9E498, #DAA520)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: '#0A2342', flexShrink: 0 }}>{step.n}</div>
            <p style={{ fontSize: '13px', color: '#374151', lineHeight: 1.5, margin: 0 }}>{step.text}</p>
          </div>
        ))}
      </div>

      {/* TRC Logo */}
      <img src={LOGO_SQUARE} alt="TRC" style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '20px', borderRadius: '8px' }} />

      {/* CTA Buttons */}
      <div className="animate-slideUp" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '380px', animationDelay: '0.4s' }}>
        <button className="gold-btn" onClick={() => navigate('/dashboard')} data-testid="go-to-dashboard-btn" style={{ width: '100%', padding: '16px', justifyContent: 'center' }}>
          <i className="fas fa-tachometer-alt" style={{ marginRight: '8px' }} />GO TO DASHBOARD
        </button>
        <button className="gold-outline-btn" onClick={() => navigate('/')} style={{ width: '100%', padding: '14px', justifyContent: 'center' }}>
          <i className="fas fa-search" style={{ marginRight: '8px' }} />Check Another USDOT
        </button>
      </div>

      {/* Contact */}
      <div style={{ marginTop: '32px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', lineHeight: 1.8 }}>
        <p style={{ margin: '0 0 4px' }}>Questions? We're here to help.</p>
        <a href="tel:8776682114" style={{ color: '#DAA520', textDecoration: 'none', fontWeight: 600 }}>877-668-2114</a>
        <span style={{ margin: '0 8px' }}>&bull;</span>
        <a href="mailto:questions@transportationregulatorycompliance.com" style={{ color: '#DAA520', textDecoration: 'none', fontSize: '11px' }}>questions@transportationregulatorycompliance.com</a>
      </div>
    </div>
  );
}
