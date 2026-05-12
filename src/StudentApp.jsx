import React, { useState, useEffect } from 'react';
import { callApi } from './api.js';
import { Layout, NavItem } from './components.jsx';

const studentNav = [
  { id:'marks', icon:'📝', label:'My Marks' },
  { id:'summary', icon:'📊', label:'Report Card' },
];

const MyMarks = ({ userInfo }) => {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    callApi('school_erp.api.get_marks').then(r => { setMarks(r||[]); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding:'60px', textAlign:'center', color:'var(--text-secondary)' }}>Loading your marks…</div>;

  return (
    <div className="animate-fade-in" style={{ display:'flex', flexDirection:'column', gap:'24px' }}>
      <div>
        <h1 style={{ marginBottom:'8px' }}>My Marks</h1>
        <p>View your marks for each subject. Marks are entered by your teachers.</p>
      </div>
      {marks.length === 0
        ? <div className="glass-panel" style={{ padding:'60px', textAlign:'center', color:'var(--text-secondary)' }}>
            No marks have been entered for you yet. Check back after your exams!
          </div>
        : <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {marks.map(m => {
              const pct = m.max_marks > 0 ? ((m.marks_obtained/m.max_marks)*100).toFixed(1) : 0;
              const good = parseFloat(pct) >= 35;
              const w = Math.min(100, parseFloat(pct));
              return (
                <div key={m.name} className="glass-panel" style={{ padding:'24px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:'1.1rem', marginBottom:'4px' }}>{m.subject}</div>
                      {m.exam_date && <div style={{ color:'var(--text-secondary)', fontSize:'0.85rem' }}>Exam: {m.exam_date}</div>}
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:'1.8rem', fontWeight:800, color: good ? 'var(--accent-secondary)':'var(--accent-tertiary)' }}>{m.marks_obtained}</div>
                      <div style={{ color:'var(--text-secondary)', fontSize:'0.85rem' }}>out of {m.max_marks}</div>
                    </div>
                  </div>
                  <div style={{ height:'8px', borderRadius:'4px', background:'var(--bg-secondary)', overflow:'hidden', marginBottom:'8px' }}>
                    <div style={{ width:`${w}%`, height:'100%', borderRadius:'4px', background: good ? 'linear-gradient(90deg,var(--accent-primary),var(--accent-secondary))':'var(--accent-tertiary)', transition:'width 0.8s ease' }} />
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.85rem' }}>
                    <span style={{ color: good ? 'var(--accent-secondary)':'var(--accent-tertiary)', fontWeight:600 }}>{pct}%</span>
                    <span style={{ color:'var(--text-secondary)' }}>{good ? '✓ Pass':'✗ Below passing'}</span>
                  </div>
                  {m.remarks && <div style={{ marginTop:'12px', padding:'10px', borderRadius:'8px', background:'var(--bg-secondary)', color:'var(--text-secondary)', fontSize:'0.85rem' }}>💬 {m.remarks}</div>}
                </div>
              );
            })}
          </div>
      }
    </div>
  );
};

const ReportCard = ({ userInfo }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    callApi('school_erp.api.get_student_summary', { student_id: userInfo.profile })
      .then(r => { setSummary(r); setLoading(false); }).catch(() => setLoading(false));
  }, [userInfo.profile]);

  if (loading) return <div style={{ padding:'60px', textAlign:'center', color:'var(--text-secondary)' }}>Loading your report…</div>;
  if (!summary || summary.subjects.length === 0) {
    return (
      <div className="animate-fade-in">
        <h1 style={{ marginBottom:'8px' }}>Report Card</h1>
        <div className="glass-panel" style={{ padding:'60px', textAlign:'center', color:'var(--text-secondary)', marginTop:'24px' }}>No marks available yet.</div>
      </div>
    );
  }

  const grade = summary.percentage >= 90 ? 'A+' : summary.percentage >= 75 ? 'A' : summary.percentage >= 60 ? 'B' : summary.percentage >= 45 ? 'C' : summary.percentage >= 35 ? 'D' : 'F';
  const gradeColor = summary.percentage >= 35 ? 'var(--accent-secondary)' : 'var(--accent-tertiary)';

  return (
    <div className="animate-fade-in" style={{ display:'flex', flexDirection:'column', gap:'24px' }}>
      <h1>Report Card</h1>
      {/* Summary Banner */}
      <div className="glass-panel" style={{ padding:'32px', textAlign:'center', background:'linear-gradient(135deg,rgba(108,92,231,0.15),rgba(0,206,201,0.15))' }}>
        <div style={{ fontSize:'5rem', fontWeight:800, color:gradeColor, lineHeight:1 }}>{grade}</div>
        <div style={{ fontSize:'1.3rem', fontWeight:600, marginTop:'8px' }}>{summary.percentage}%</div>
        <div style={{ color:'var(--text-secondary)', marginTop:'4px' }}>Total: {summary.total_obtained} / {summary.total_max} marks</div>
        <div style={{ color:'var(--text-secondary)', marginTop:'4px', fontSize:'0.9rem' }}>{userInfo.name_display} · {userInfo.grade}</div>
      </div>

      {/* Subject Breakdown */}
      <div>
        <h3 style={{ marginBottom:'16px' }}>Subject-wise Breakdown</h3>
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {summary.subjects.map((s, i) => {
            const pct = s.max_marks > 0 ? ((s.marks_obtained/s.max_marks)*100).toFixed(1) : 0;
            const good = parseFloat(pct) >= 35;
            return (
              <div key={i} className="glass-panel" style={{ padding:'20px 24px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                  <span style={{ fontWeight:600 }}>{s.subject}</span>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <span style={{ fontWeight:700, color: good ? 'var(--accent-secondary)':'var(--accent-tertiary)' }}>{s.marks_obtained}/{s.max_marks}</span>
                    <span style={{ padding:'2px 8px', borderRadius:'20px', fontSize:'0.8rem', background: good ? 'rgba(0,206,201,0.1)':'rgba(253,121,168,0.1)', color: good ? 'var(--accent-secondary)':'var(--accent-tertiary)' }}>{pct}%</span>
                  </div>
                </div>
                <div style={{ height:'6px', borderRadius:'4px', background:'var(--bg-secondary)', overflow:'hidden' }}>
                  <div style={{ width:`${Math.min(100,parseFloat(pct))}%`, height:'100%', borderRadius:'4px', background: good ? 'var(--accent-secondary)':'var(--accent-tertiary)', transition:'width 0.8s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const StudentApp = ({ userInfo, onLogout }) => {
  const [tab, setTab] = useState('marks');
  const content = { marks:<MyMarks userInfo={userInfo}/>, summary:<ReportCard userInfo={userInfo}/> };
  const current = studentNav.find(n => n.id === tab);
  return (
    <Layout title={current?.label||'My Marks'} subtitle={`${userInfo.grade} · Student Portal`} icon="👨‍🎓" onLogout={onLogout} nameDisplay={userInfo.name_display} role="Student"
      sidebar={studentNav.map(n => <NavItem key={n.id} {...n} active={tab===n.id} onClick={setTab}/>)}>
      {content[tab]}
    </Layout>
  );
};
