import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;
const LOGO_SQUARE = 'https://customer-assets.emergentagent.com/job_44f8ad78-8ec0-4a92-b07a-3505ef291e27/artifacts/qisdrhs0_unnamed%20%281%29.jpg';

function ComplianceGauge({ daysUntilDue }) {
  const maxDays = 730;
  const hasData = daysUntilDue !== null && daysUntilDue !== undefined;
  const pct = !hasData ? 0 : Math.min(Math.max(daysUntilDue / maxDays, 0), 1);
  const r = 72;
  const circ = 2 * Math.PI * r;
  const offset = hasData ? circ - pct * circ : circ;
  const color = !hasData ? '#6B7280' : daysUntilDue < 0 ? '#DC2626' : daysUntilDue <= 30 ? '#FBBF24' : '#10B981';
  const label = !hasData ? 'NO DATA' : daysUntilDue < 0 ? 'OVERDUE' : daysUntilDue <= 30 ? 'DUE SOON' : 'COMPLIANT';

  return (
    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '8px' }}>
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" />
        <circle cx="90" cy="90" r={r} fill="none" stroke={color} strokeWidth="14" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 90 90)" style={{ transition: 'stroke-dashoffset 1.5s ease, stroke 0.5s' }} />
        {/* Center */}
        <text x="90" y="82" textAnchor="middle" fill="white" fontSize={hasData && daysUntilDue > 99 ? '28' : '34'} fontWeight="800" fontFamily="Montserrat, sans-serif">
          {!hasData ? '--' : (daysUntilDue < 0 ? '!' : daysUntilDue)}
        </text>
        {hasData && daysUntilDue >= 0 && (
          <text x="90" y="100" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11" fontFamily="Roboto, sans-serif">days left</text>
        )}
        <text x="90" y="118" textAnchor="middle" fill={color} fontSize="10" fontWeight="700" fontFamily="Montserrat, sans-serif" letterSpacing="1">{label}</text>
      </svg>
    </div>
  );
}

function BottomNav({ active }) {
  const navigate = useNavigate();
  const items = [
    { id: 'home', icon: 'fas fa-home', label: 'Home', path: '/' },
    { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard', path: '/dashboard' },
    { id: 'notifications', icon: 'fas fa-bell', label: 'Alerts', path: '/dashboard#notifications' },
    { id: 'profile', icon: 'fas fa-user', label: 'Profile', path: '/dashboard#profile' },
  ];
  return (
    <div className="bottom-nav">
      {items.map(item => (
        <div key={item.id} className={`bottom-nav-item ${active === item.id ? 'active' : ''}`} onClick={() => navigate(item.path)} data-testid={`nav-${item.id}`}>
          <i className={item.icon} style={{ fontSize: '18px' }} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { auth, logout } = useApp();
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    if (!auth?.token) { navigate('/login'); return; }
    loadDashboard();
  }, [auth]);

  const loadDashboard = async () => {
    try {
      const res = await axios.get(`${API}/api/dashboard`, { headers: { Authorization: `Bearer ${auth.token}` } });
      setDashData(res.data);
    } catch (err) {
      if (err.response?.status === 401) { logout(); navigate('/login'); }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const primaryRecord = dashData?.dot_records?.[0];
  const daysUntilDue = primaryRecord?.days_until_due;
  const status = primaryRecord?.compliance_status || 'UNKNOWN';
  const statusColors = { RED: '#DC2626', YELLOW: '#FBBF24', GREEN: '#10B981', UNKNOWN: '#6B7280', FILED: '#10B981' };
  const sColor = statusColors[status] || '#6B7280';

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid rgba(218,165,32,0.3)', borderTop: '3px solid #DAA520', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Loading dashboard...</p>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ background: '#0A2342', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(218,165,32,0.2)', position: 'sticky', top: 0, zIndex: 50 }}>
        <img src={LOGO_SQUARE} alt="TRC" style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '6px' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '13px', color: '#DAA520', letterSpacing: '1px' }}>TRC DASHBOARD</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{auth?.user?.email}</div>
        </div>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '6px' }}>
            <i className="fas fa-bars" style={{ fontSize: '18px' }} />
          </button>
          {menuOpen && (
            <div style={{ position: 'absolute', right: 0, top: '100%', background: '#0D2A4F', border: '1px solid rgba(218,165,32,0.3)', borderRadius: '10px', padding: '8px', minWidth: '160px', zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
              <button onClick={() => { navigate('/'); setMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 14px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '13px', borderRadius: '6px' }}>
                <i className="fas fa-search" style={{ color: '#DAA520', width: '16px' }} />Check USDOT
              </button>
              <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 14px', background: 'none', border: 'none', color: '#FCA5A5', cursor: 'pointer', fontSize: '13px', borderRadius: '6px' }} data-testid="logout-btn">
                <i className="fas fa-sign-out-alt" style={{ color: '#DC2626', width: '16px' }} />Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Compliance Gauge Hero */}
      <div style={{ textAlign: 'center', padding: '24px 16px 16px', background: 'radial-gradient(ellipse at 50% 0%, #0D2A4F 0%, #051B35 70%)' }}>
        <ComplianceGauge daysUntilDue={daysUntilDue} />
        {primaryRecord && (
          <div>
            <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: '14px', color: 'white', marginBottom: '4px' }}>{primaryRecord.legal_name || 'Your Carrier'}</div>
            {primaryRecord.mcs_150_renewal_date && <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Next MCS-150 due: <span style={{ color: sColor, fontWeight: 600 }}>{primaryRecord.mcs_150_renewal_date}</span></div>}
          </div>
        )}
        {!primaryRecord && (
          <div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '16px' }}>No USDOT records linked yet</p>
            <button className="gold-btn" onClick={() => navigate('/')} style={{ padding: '12px 24px', justifyContent: 'center' }}>
              <i className="fas fa-search" style={{ marginRight: '8px' }} />Check a USDOT
            </button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '16px' }}>
        {[
          { icon: 'fas fa-shield-alt', label: 'USDOT Status', value: status, color: sColor, testid: 'stat-status' },
          { icon: 'fas fa-calendar', label: 'Next Action', value: daysUntilDue !== null && daysUntilDue !== undefined ? `${daysUntilDue > 0 ? `In ${daysUntilDue}d` : 'OVERDUE'}` : 'N/A', color: sColor, testid: 'stat-action' },
          { icon: 'fas fa-file-alt', label: 'Filings', value: `${dashData?.recent_filings?.length || 0} Total`, color: '#DAA520', testid: 'stat-filings' },
          { icon: 'fas fa-bell', label: 'Alerts', value: `${dashData?.unread_count || 0} Unread`, color: dashData?.unread_count > 0 ? '#FBBF24' : '#10B981', testid: 'stat-alerts' },
        ].map(s => (
          <div key={s.label} className="trc-card" style={{ padding: '16px', textAlign: 'center', cursor: 'pointer' }} data-testid={s.testid}>
            <i className={s.icon} style={{ fontSize: '22px', color: s.color, marginBottom: '8px', display: 'block' }} />
            <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '15px', color: s.color, marginBottom: '4px' }}>{s.value}</div>
            <div style={{ fontSize: '10px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: "'Montserrat', sans-serif" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Quick Actions</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            { icon: 'fas fa-search', label: 'Check USDOT', action: () => navigate('/'), testid: 'action-check' },
            { icon: 'fas fa-history', label: 'Filing History', action: () => navigate('/dashboard'), testid: 'action-history' },
            { icon: 'fas fa-phone', label: 'Call Support', action: () => window.open('tel:8776682114'), testid: 'action-support' },
            { icon: 'fas fa-envelope', label: 'Email Us', action: () => window.open('mailto:questions@transportationregulatorycompliance.com'), testid: 'action-email' },
          ].map(a => (
            <button key={a.label} className="gold-outline-btn" onClick={a.action} data-testid={a.testid} style={{ padding: '12px', fontSize: '12px', width: '100%', justifyContent: 'center', flexDirection: 'column', gap: '6px', height: '64px' }}>
              <i className={a.icon} style={{ fontSize: '18px' }} />
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {(dashData?.recent_filings?.length > 0 || dashData?.notifications?.length > 0) && (
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Recent Activity</div>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(218,165,32,0.15)', borderRadius: '12px', overflow: 'hidden' }}>
            {dashData.notifications?.slice(0, 4).map((n, i) => (
              <div key={n.notification_id} style={{ padding: '12px 16px', borderBottom: i < Math.min(dashData.notifications.length, 4) - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.status === 'unread' ? '#DAA520' : '#6B7280', flexShrink: 0, marginTop: '5px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: 'white', fontWeight: n.status === 'unread' ? 600 : 400, marginBottom: '2px' }}>{n.title}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{n.message?.substring(0, 60)}...</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Footer */}
      <div style={{ padding: '16px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '11px', lineHeight: 1.8 }}>
        <p style={{ margin: 0 }}>Need help? Call <a href="tel:8776682114" style={{ color: '#DAA520', textDecoration: 'none' }}>877-668-2114</a></p>
        <p style={{ margin: 0 }}><a href="mailto:questions@transportationregulatorycompliance.com" style={{ color: 'rgba(218,165,32,0.5)', textDecoration: 'none', fontSize: '10px' }}>questions@transportationregulatorycompliance.com</a></p>
      </div>

      <BottomNav active="dashboard" />
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
