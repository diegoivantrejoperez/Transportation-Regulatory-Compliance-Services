import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';

const API = process.env.REACT_APP_BACKEND_URL;

function StepIndicator({ current }) {
  const steps = ['Payment', 'Verification', 'Filing'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 20px', background: 'white', borderBottom: '1px solid #E5E7EB', gap: '8px' }}>
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: i < current ? '#10B981' : i === current ? '#DAA520' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: i <= current ? 'white' : '#9CA3AF' }}>
              {i < current ? <i className="fas fa-check" /> : i + 1}
            </div>
            <span style={{ fontSize: '10px', color: i === current ? '#0A2342' : '#9CA3AF', fontWeight: i === current ? 700 : 400, fontFamily: "'Montserrat', sans-serif", textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s}</span>
          </div>
          {i < steps.length - 1 && <div style={{ flex: 1, height: '2px', background: i < current ? '#10B981' : '#E5E7EB', margin: '0 4px', marginBottom: '16px' }} />}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function VerificationPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { usdotData, login } = useApp();
  const sigRef = useRef(null);

  const sessionId = params.get('session_id');
  const usdot = params.get('usdot');
  const emailParam = params.get('email') || '';

  const fmcsa = usdotData?.fmcsa_data || {};
  const [form, setForm] = useState({
    legal_name: fmcsa.legal_name || '',
    dba_name: fmcsa.dba_name || '',
    physical_street: fmcsa.physical_address?.street || '',
    physical_city: fmcsa.physical_address?.city || '',
    physical_state: fmcsa.physical_address?.state || '',
    physical_zip: fmcsa.physical_address?.zip || '',
    mailing_same: true,
    fleet_size: fmcsa.fleet_size || '',
    email: emailParam,
    tin_ssn_ein: '',
    mobile_number: '',
    authorization_agreed: false,
  });

  const [sigEmpty, setSigEmpty] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const canSubmit = form.legal_name && form.physical_street && form.physical_city && form.physical_state && form.email && form.tin_ssn_ein && form.mobile_number && form.authorization_agreed && !sigEmpty;

  const handleSubmit = async () => {
    if (!canSubmit) { setError('Please fill all required fields and add your signature.'); return; }
    setLoading(true);
    setError('');
    try {
      const sig = sigRef.current.getTrimmedCanvas().toDataURL('image/png');
      const payload = {
        usdot_number: usdot,
        session_id: sessionId,
        legal_name: form.legal_name,
        dba_name: form.dba_name,
        physical_street: form.physical_street,
        physical_city: form.physical_city,
        physical_state: form.physical_state,
        physical_zip: form.physical_zip,
        mailing_same: form.mailing_same,
        fleet_size: form.fleet_size,
        email: form.email,
        tin_ssn_ein: form.tin_ssn_ein,
        mobile_number: form.mobile_number,
        authorization_agreed: form.authorization_agreed,
        signature_base64: sig,
      };
      const res = await axios.post(`${API}/api/filings/submit`, payload);
      if (res.data.access_token) {
        login(res.data.access_token, { user_id: res.data.user_id, email: form.email });
      }
      navigate(`/filing-success?filing_id=${res.data.filing_id}&conf=${res.data.confirmation_number}&usdot=${usdot}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Submission failed. Please try again.');
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '12px 14px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#0A2342', fontFamily: 'Roboto, sans-serif', transition: 'border-color 0.2s' };
  const focusStyle = { borderColor: '#DAA520' };

  return (
    <div style={{ minHeight: '100vh', background: '#FFF8E7' }}>
      <StepIndicator current={1} />
      <div style={{ background: '#0A2342', padding: '16px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '15px', fontWeight: 800, color: '#DAA520', textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0 }}>Verify Your Information</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '4px', marginBottom: 0 }}>This information will be submitted to the FMCSA</p>
      </div>

      <div style={{ padding: '20px 16px', maxWidth: '480px', margin: '0 auto' }}>
        {/* Company Info */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '12px', fontWeight: 700, color: '#0A2342', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-building" style={{ color: '#DAA520' }} />Company Information
          </h3>
          <div style={{ marginBottom: '12px' }}>
            <label className="form-label">Legal Name *</label>
            <input style={inputStyle} value={form.legal_name} onChange={e => set('legal_name', e.target.value)} data-testid="legal-name-input" onFocus={e => e.target.style.borderColor = '#DAA520'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label className="form-label">DBA Name</label>
            <input style={inputStyle} value={form.dba_name} onChange={e => set('dba_name', e.target.value)} placeholder="Optional" onFocus={e => e.target.style.borderColor = '#DAA520'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label className="form-label">Physical Address *</label>
            <input style={{ ...inputStyle, marginBottom: '8px' }} value={form.physical_street} onChange={e => set('physical_street', e.target.value)} placeholder="Street Address" onFocus={e => e.target.style.borderColor = '#DAA520'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px' }}>
              <input style={inputStyle} value={form.physical_city} onChange={e => set('physical_city', e.target.value)} placeholder="City" onFocus={e => e.target.style.borderColor = '#DAA520'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
              <input style={inputStyle} value={form.physical_state} onChange={e => set('physical_state', e.target.value)} placeholder="ST" maxLength={2} onFocus={e => e.target.style.borderColor = '#DAA520'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
              <input style={inputStyle} value={form.physical_zip} onChange={e => set('physical_zip', e.target.value)} placeholder="ZIP" onFocus={e => e.target.style.borderColor = '#DAA520'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label">Fleet Size</label>
              <input style={inputStyle} value={form.fleet_size} onChange={e => set('fleet_size', e.target.value)} placeholder="Power Units" onFocus={e => e.target.style.borderColor = '#DAA520'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
            </div>
            <div>
              <label className="form-label">Email *</label>
              <input style={inputStyle} type="email" value={form.email} onChange={e => set('email', e.target.value)} data-testid="verification-email" onFocus={e => e.target.style.borderColor = '#DAA520'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
            </div>
          </div>
        </div>

        {/* Required Fields */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '12px', fontWeight: 700, color: '#0A2342', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-lock" style={{ color: '#DAA520' }} />Secure Information
          </h3>
          <div style={{ marginBottom: '12px' }}>
            <label className="form-label"><i className="fas fa-lock" style={{ marginRight: '4px', color: '#10B981' }} />Taxpayer ID (TIN/SSN/EIN) *</label>
            <input style={inputStyle} type="password" value={form.tin_ssn_ein} onChange={e => set('tin_ssn_ein', e.target.value)} placeholder="•••-••-•••• (Encrypted & Secure)" data-testid="tin-input" onFocus={e => e.target.style.borderColor = '#DAA520'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
            <p style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <i className="fas fa-shield-alt" style={{ color: '#10B981' }} />AES-256 encrypted before storage. Never shared without consent.
            </p>
          </div>
          <div>
            <label className="form-label">Mobile Phone *</label>
            <input style={inputStyle} type="tel" value={form.mobile_number} onChange={e => set('mobile_number', e.target.value)} placeholder="+1 (555) 000-0000" data-testid="mobile-input" onFocus={e => e.target.style.borderColor = '#DAA520'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
          </div>
        </div>

        {/* Authorization */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: `2px solid ${form.authorization_agreed ? '#DAA520' : '#E5E7EB'}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'border-color 0.2s' }}>
          <label style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.authorization_agreed} onChange={e => set('authorization_agreed', e.target.checked)} data-testid="auth-checkbox"
              style={{ marginTop: '3px', width: '18px', height: '18px', accentColor: '#DAA520', flexShrink: 0 }} />
            <span style={{ fontSize: '12px', color: '#374151', lineHeight: 1.6 }}>
              I authorize <strong>Transportation Regulatory Compliance (TRC)</strong> to act as my authorized representative to submit this MCS-150 update to the FMCSA on my behalf. I certify that all information is accurate and complete.
            </span>
          </label>
        </div>

        {/* Signature */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '20px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '12px', fontWeight: 700, color: '#0A2342', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-pen-nib" style={{ color: '#DAA520' }} />Digital Signature *
          </h3>
          <div className="sig-canvas-wrapper" style={{ background: 'white', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', opacity: sigEmpty ? 0.15 : 0 }}>
              <svg width="80" height="80" viewBox="0 0 100 120" opacity="0.3">
                <path d="M50 4 L86 17 L86 53 Q86 80 50 96 Q14 80 14 53 L14 17 Z" fill="#DAA520" stroke="#B8860B" strokeWidth="2" />
              </svg>
            </div>
            <SignatureCanvas
              ref={sigRef}
              penColor="#0A2342"
              canvasProps={{ width: 380, height: 160, style: { display: 'block', width: '100%', maxHeight: '160px' } }}
              onEnd={() => setSigEmpty(sigRef.current.isEmpty())}
              data-testid="signature-canvas"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <p style={{ fontSize: '11px', color: '#9CA3AF' }}><i className="fas fa-pen" style={{ marginRight: '4px' }} />Sign above with mouse or touch</p>
            <button onClick={() => { sigRef.current.clear(); setSigEmpty(true); }} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', color: '#6B7280', cursor: 'pointer' }}>
              CLEAR
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', border: '1px solid #DC2626', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#DC2626', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <i className="fas fa-exclamation-circle" style={{ marginTop: '2px', flexShrink: 0 }} />{error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          data-testid="submit-filing-btn"
          className="gold-btn"
          style={{ width: '100%', padding: '18px', fontSize: '15px', borderRadius: '12px', justifyContent: 'center', opacity: canSubmit ? 1 : 0.5 }}
        >
          {loading ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }} />SUBMITTING FILING...</> : <><i className="fas fa-paper-plane" style={{ marginRight: '8px' }} />SUBMIT FILING</>}
        </button>

        <p style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'center', marginTop: '10px', lineHeight: 1.6 }}>
          By submitting, you agree to TRC's Terms of Service and Privacy Policy.
          USDOT #{usdot} &bull; Session: {sessionId?.substring(0, 12)}...
        </p>
      </div>
    </div>
  );
}
