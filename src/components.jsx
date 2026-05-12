import React from 'react';

export const Layout = ({ title, subtitle, icon, onLogout, nameDisplay, role, children, sidebar }) => (
  <div className="app-container">
    <div className="sidebar">
      <div className="brand">
        <div className="brand-icon">{icon}</div>
        <div className="brand-title">School ERP</div>
      </div>
      <div className="nav-links">{sidebar}</div>
      <div style={{ marginTop:'auto', padding:'16px', borderTop:'1px solid var(--border-color)' }}>
        <div style={{ fontWeight:600, marginBottom:'4px' }}>{nameDisplay}</div>
        <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)', textTransform:'capitalize', marginBottom:'12px' }}>{role}</div>
        <button id="logout-btn" onClick={onLogout} style={{ width:'100%', padding:'10px', borderRadius:'8px', background:'rgba(253,121,168,0.1)', border:'1px solid var(--accent-tertiary)', color:'var(--accent-tertiary)', cursor:'pointer', fontWeight:500 }}>Sign Out</button>
      </div>
    </div>
    <main className="main-content">
      <div className="top-nav glass-panel">
        <div>
          <h3 style={{ margin:0 }}>{title}</h3>
          {subtitle && <p style={{ margin:0, fontSize:'0.85rem' }}>{subtitle}</p>}
        </div>
      </div>
      <div style={{ padding:'32px', overflowY:'auto', flex:1 }}>{children}</div>
    </main>
  </div>
);

export const NavItem = ({ id, icon, label, active, onClick }) => (
  <div id={`nav-${id}`} className={`nav-item ${active ? 'active' : ''}`} onClick={() => onClick(id)}>
    <span>{icon}</span><span>{label}</span>
  </div>
);

export const Table = ({ headers, rows, emptyMsg }) => (
  rows.length === 0
    ? <div style={{ padding:'40px', textAlign:'center', color:'var(--text-secondary)' }}>{emptyMsg}</div>
    : <table style={{ width:'100%', borderCollapse:'collapse', textAlign:'left' }}>
        <thead>
          <tr style={{ color:'var(--text-secondary)', borderBottom:'1px solid var(--border-color)' }}>
            {headers.map((h,i) => <th key={i} style={{ padding:'14px 16px', fontWeight:500, fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</th>)}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
);

export const StatusBadge = ({ status }) => {
  const colors = { Present:'var(--accent-secondary)', Absent:'var(--accent-tertiary)', Late:'#ff9f43' };
  return <span style={{ padding:'3px 10px', borderRadius:'20px', fontSize:'0.8rem', background:`${colors[status] || 'gray'}22`, color: colors[status] || 'gray' }}>{status}</span>;
};

export const Modal = ({ title, children, onClose }) => (
  <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 }}>
    <div className="glass-panel" style={{ padding:'32px', width:'480px', maxWidth:'90vw', maxHeight:'85vh', overflowY:'auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <h3 style={{ margin:0 }}>{title}</h3>
        <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-secondary)', fontSize:'1.5rem', cursor:'pointer' }}>×</button>
      </div>
      {children}
    </div>
  </div>
);

export const Btn = ({ children, onClick, variant='primary', disabled=false, id, small=false }) => {
  const bg = { primary:'linear-gradient(135deg,var(--accent-primary),var(--accent-secondary))', danger:'rgba(253,121,168,0.15)', success:'rgba(0,206,201,0.15)' };
  const color = { primary:'white', danger:'var(--accent-tertiary)', success:'var(--accent-secondary)' };
  return (
    <button id={id} onClick={onClick} disabled={disabled}
      style={{ padding: small ? '6px 14px' : '10px 20px', borderRadius:'8px', background: bg[variant], color: color[variant], border: variant==='primary' ? 'none' : `1px solid ${color[variant]}`, cursor: disabled ? 'not-allowed' : 'pointer', fontWeight:500, opacity: disabled ? 0.6 : 1, fontSize: small ? '0.8rem' : '0.9rem' }}>
      {children}
    </button>
  );
};

export const Field = ({ label, children }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
    <label style={{ fontSize:'0.85rem', color:'var(--text-secondary)' }}>{label}</label>
    {children}
  </div>
);

export const Input = ({ value, onChange, placeholder='', type='text' }) => (
  <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
    style={{ padding:'10px 12px', borderRadius:'8px', border:'1px solid var(--border-color)', background:'var(--bg-secondary)', color:'white', fontSize:'0.9rem' }} />
);
