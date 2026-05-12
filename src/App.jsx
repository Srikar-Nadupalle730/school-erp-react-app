import React, { useState, useEffect } from 'react';
import { api, callApi } from './api.js';
import { AdminApp } from './AdminApp.jsx';
import { TeacherApp } from './TeacherApp.jsx';
import { StudentApp } from './StudentApp.jsx';
import { HomePage } from './HomePage.jsx';
import './App.css';

// Fetch and attach Frappe CSRF token to all subsequent requests
async function fetchCsrfToken() {
  try {
    const res = await api.get('method/frappe.auth.get_logged_user');
    const token = res.headers['x-frappe-csrftoken'] || res.data?.csrf_token;
    if (token && token !== 'None') {
      api.defaults.headers.common['X-Frappe-CSRF-Token'] = token;
    }
  } catch {}
}

const Login = ({ onLogin, onBack }) => {
  const [usr, setUsr] = useState('');
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('method/login', { usr, pwd });
      await fetchCsrfToken();
      onLogin();
    } catch (err) {
      if (!err.response) {
        setError('Cannot reach server. Make sure "bench start" is running.');
      } else if (err.response.status === 401 || err.response.status === 403) {
        setError('Invalid username or password.');
      } else {
        setError(`Login failed (${err.response.status}). Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display:'flex', height:'100vh', alignItems:'center', justifyContent:'center', background:'var(--bg-primary)' }}>
      <div className="glass-panel" style={{ padding:'48px', width:'420px', display:'flex', flexDirection:'column', gap:'24px' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ width:'60px', height:'60px', background:'linear-gradient(135deg,var(--accent-primary),var(--accent-secondary))', borderRadius:'16px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:'1.5rem', fontWeight:'bold', color:'white' }}>ERP</div>
          <h2 style={{ marginBottom:'4px' }}>School ERP Suite</h2>
          <p>Sign in with your credentials</p>
        </div>
        {error && <div style={{ background:'rgba(253,121,168,0.1)', border:'1px solid var(--accent-tertiary)', borderRadius:'8px', padding:'12px', color:'var(--accent-tertiary)', textAlign:'center', fontSize:'0.9rem' }}>{error}</div>}
        <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <div>
            <label style={{ display:'block', marginBottom:'6px', fontSize:'0.85rem', color:'var(--text-secondary)' }}>Username / Email</label>
            <input id="login-username" type="text" value={usr} onChange={e=>setUsr(e.target.value)} placeholder="e.g. Administrator or user@school.local"
              style={{ width:'100%', padding:'12px', borderRadius:'8px', border:'1px solid var(--border-color)', background:'var(--bg-secondary)', color:'white', fontSize:'0.95rem' }} />
          </div>
          <div>
            <label style={{ display:'block', marginBottom:'6px', fontSize:'0.85rem', color:'var(--text-secondary)' }}>Password</label>
            <input id="login-password" type="password" value={pwd} onChange={e=>setPwd(e.target.value)} placeholder="Your password"
              style={{ width:'100%', padding:'12px', borderRadius:'8px', border:'1px solid var(--border-color)', background:'var(--bg-secondary)', color:'white', fontSize:'0.95rem' }} />
          </div>
          <button id="login-submit" type="submit" disabled={loading}
            style={{ padding:'14px', borderRadius:'8px', background:'linear-gradient(135deg,var(--accent-primary),var(--accent-secondary))', color:'white', border:'none', fontWeight:'bold', cursor:'pointer', fontSize:'1rem', marginTop:'8px', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <button onClick={onBack} style={{ background:'none', border:'none', color:'var(--accent-primary)', cursor:'pointer', fontSize:'0.85rem', fontWeight:500, padding:0 }}>← Back to Home</button>
          <p style={{ fontSize:'0.8rem', margin:0 }}>Contact Admin for credentials</p>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  const loadUserInfo = async () => {
    try {
      await fetchCsrfToken();
      const res = await callApi('school_erp.api.get_current_user_role');
      if (res && res.role) {
        setUserInfo(res);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUserInfo(null);
      }
    } catch {
      setIsAuthenticated(false);
      setUserInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUserInfo(); }, []);

  const handleLogin = () => { setLoading(true); loadUserInfo(); };

  const handleLogout = async () => {
    try { await api.get('method/logout'); } catch {}
    setIsAuthenticated(false);
    setUserInfo(null);
    setShowLogin(false);
  };

  if (loading) {
    return <div style={{ display:'flex', height:'100vh', alignItems:'center', justifyContent:'center', background:'var(--bg-primary)', color:'var(--text-secondary)' }}>Loading…</div>;
  }

  if (!isAuthenticated) {
    if (showLogin) {
      return <Login onLogin={handleLogin} onBack={() => setShowLogin(false)} />;
    }
    return <HomePage onLoginClick={() => setShowLogin(true)} />;
  }

  const role = userInfo?.role;
  if (role === 'admin') return <AdminApp userInfo={userInfo} onLogout={handleLogout} />;
  if (role === 'teacher') return <TeacherApp userInfo={userInfo} onLogout={handleLogout} />;
  if (role === 'student') return <StudentApp userInfo={userInfo} onLogout={handleLogout} />;

  return (
    <div style={{ display:'flex', height:'100vh', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'16px', background:'var(--bg-primary)' }}>
      <h2>Access Restricted</h2>
      <p>Your account has no assigned school role. Please contact the Administrator.</p>
      <button onClick={handleLogout} style={{ padding:'10px 24px', borderRadius:'8px', background:'var(--accent-primary)', color:'white', border:'none', cursor:'pointer' }}>Logout</button>
    </div>
  );
}

export default App;
