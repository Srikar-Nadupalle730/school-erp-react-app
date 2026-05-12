import React, { useState, useEffect, useCallback } from 'react';
import { api, callApi } from './api.js';
import { Layout, NavItem, Table, Modal, Btn, Field, Input } from './components.jsx';

const teacherNav = [
  { id:'students', icon:'🏫', label:'Students by Class' },
  { id:'marks', icon:'📝', label:'Student Marks' },
  { id:'attendance', icon:'📅', label:'Student Attendance' },
];

const MarksPanel = ({ userInfo, quickStudent, onQuickClear }) => {
  const [marks, setMarks] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'add' | 'single-add' | 'edit'
  const [form, setForm] = useState({ student:'', marks_obtained:'', max_marks:'100', exam_date:'', remarks:'', marks_id:'' });
  
  // Bulk Add State
  const [addClass, setAddClass] = useState('');
  const [addMaxMarks, setAddMaxMarks] = useState('100');
  const [addExamDate, setAddExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [bulkMarks, setBulkMarks] = useState({});

  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState({});

  const subject = userInfo.subject;

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      callApi('school_erp.api.get_marks'),
      callApi('school_erp.api.get_students_by_class')
    ]).then(([marksData, classesData]) => {
      setMarks(marksData || []);
      const allStuds = [];
      (classesData || []).forEach(c => {
        c.students.forEach(s => {
          allStuds.push({ id: s.id, name: s.name, grade: c.grade });
        });
      });
      setStudentsList(allStuds);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-open add modal when a student is passed from the class roster
  useEffect(() => {
    if (quickStudent) {
      setForm({ student: quickStudent.id, marks_obtained:'', max_marks:'100', exam_date:'', remarks:'' });
      setMsg('');
      setModal('single-add');
      onQuickClear && onQuickClear();
    }
  }, [quickStudent]);

  useEffect(() => {
    if (addClass) {
      const clsStuds = studentsList.filter(s => s.grade === addClass);
      const init = {};
      clsStuds.forEach(s => init[s.id] = '');
      setBulkMarks(init);
    } else {
      setBulkMarks({});
    }
  }, [addClass, studentsList]);

  const openAdd = () => {
    setAddClass('');
    setAddMaxMarks('100');
    setAddExamDate(new Date().toISOString().split('T')[0]);
    setBulkMarks({});
    setMsg('');
    setModal('add');
  };

  const openEdit = (m) => {
    setForm({
      student: m.student,
      marks_obtained: String(m.marks_obtained),
      max_marks: String(m.max_marks),
      exam_date: m.exam_date || '',
      remarks: m.remarks || '',
      marks_id: m.name
    });
    setMsg('');
    setModal('edit');
  };

  const handleSave = async () => {
    if (!form.student || form.marks_obtained === '') { setMsg('Fill all required fields.'); return; }
    setSaving(true); setMsg('');
    try {
      const payload = { ...form, student_id: form.student, subject };
      if (form.marks_id) payload.marks_id = form.marks_id;
      await callApi('school_erp.api.save_marks', payload);
      setMsg('✅ Saved!');
      load();
      setTimeout(() => setModal(null), 800);
    } catch (e) {
      setMsg(`❌ ${e.response?.data?.exception || 'Error'}`);
    }
    setSaving(false);
  };

  const handleBulkSave = async () => {
    if (!addClass || !addMaxMarks) { setMsg('Please select Class and Max Marks.'); return; }
    const validStudents = Object.keys(bulkMarks).filter(id => bulkMarks[id] !== '');
    if (validStudents.length === 0) { setMsg('Please enter marks for at least one student.'); return; }
    
    setSaving(true); setMsg('');
    try {
      await Promise.all(validStudents.map(sid => 
        callApi('school_erp.api.save_marks', {
          student_id: sid,
          subject,
          marks_obtained: bulkMarks[sid],
          max_marks: addMaxMarks,
          exam_date: addExamDate,
          remarks: ''
        })
      ));
      setMsg('✅ Bulk marks saved successfully!');
      load();
      setTimeout(() => setModal(null), 1000);
    } catch(e) {
      setMsg(`❌ Error saving bulk marks: ${e.message}`);
    } finally { setSaving(false); }
  };

  // ── Group marks by grade ──────────────────────────────────────────────────
  const byGrade = {};
  marks.forEach(m => {
    const grade = m.grade || 'Unassigned';
    if (!byGrade[grade]) byGrade[grade] = [];
    byGrade[grade].push(m);
  });
  const sortedGrades = Object.keys(byGrade).sort();

  // Auto-expand all grades when data first loads
  useEffect(() => {
    if (sortedGrades.length > 0) {
      const exp = {};
      sortedGrades.forEach(g => { exp[g] = true; });
      setExpanded(exp);
    }
  }, [marks.length]);

  const toggle = (grade) => setExpanded(prev => ({ ...prev, [grade]: !prev[grade] }));

  return (
    <div className="animate-fade-in" style={{ display:'flex', flexDirection:'column', gap:'24px' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1 style={{ marginBottom:'8px' }}>Marks — {subject}</h1>
          <p>
            Students grouped by class ·{' '}
            <strong style={{ color:'var(--accent-primary)' }}>{sortedGrades.length}</strong> class{sortedGrades.length !== 1 ? 'es' : ''} ·{' '}
            <strong style={{ color:'var(--accent-primary)' }}>{marks.length}</strong> record{marks.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Btn id="teacher-add-marks" onClick={openAdd}>+ Add Marks</Btn>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ padding:'60px', textAlign:'center', color:'var(--text-secondary)' }}>Loading…</div>
      ) : sortedGrades.length === 0 ? (
        <div className="glass-panel" style={{ padding:'48px', textAlign:'center', color:'var(--text-secondary)' }}>
          No marks entered for your subject yet.
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          {sortedGrades.map(grade => {
            const gradeMarks = byGrade[grade];
            const avgPct = gradeMarks.length > 0
              ? (gradeMarks.reduce((acc, m) => acc + (m.max_marks > 0 ? (m.marks_obtained / m.max_marks) * 100 : 0), 0) / gradeMarks.length).toFixed(1)
              : 0;
            const isExpanded = !!expanded[grade];

            return (
              <div key={grade} className="glass-panel" style={{ padding:'0', overflow:'hidden' }}>
                {/* Grade accordion header */}
                <div
                  onClick={() => toggle(grade)}
                  style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'16px 20px', cursor:'pointer',
                    borderBottom: isExpanded ? '1px solid var(--border-color)' : 'none',
                    background:'rgba(108,92,231,0.07)',
                    transition:'background 0.2s'
                  }}
                >
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <span style={{ fontSize:'1.4rem' }}>📝</span>
                    <div>
                      <div style={{ fontWeight:700, fontSize:'1.05rem' }}>Grade {grade}</div>
                      <div style={{ fontSize:'0.82rem', color:'var(--text-secondary)' }}>
                        {gradeMarks.length} record{gradeMarks.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    {/* Average percentage pill */}
                    <span style={{
                      padding:'3px 12px', borderRadius:'20px', fontSize:'0.78rem', fontWeight:600,
                      background: avgPct >= 35 ? 'rgba(0,206,201,0.15)' : avgPct >= 20 ? 'rgba(253,203,110,0.15)' : 'rgba(253,121,168,0.12)',
                      color: avgPct >= 35 ? 'var(--accent-secondary)' : avgPct >= 20 ? '#fdcb6e' : 'var(--accent-tertiary)'
                    }}>
                      Class avg {avgPct}%
                    </span>
                    <span style={{
                      fontSize:'1rem', color:'var(--text-secondary)',
                      display:'inline-block',
                      transition:'transform 0.25s',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}>▾</span>
                  </div>
                </div>

                {/* Student marks rows */}
                {isExpanded && (
                  <div>
                    {/* Column headers */}
                    <div style={{
                      display:'grid',
                      gridTemplateColumns:'1.6fr 1fr 1fr 1fr 1fr 1.2fr 90px',
                      padding:'8px 20px', fontSize:'0.75rem', fontWeight:700,
                      textTransform:'uppercase', letterSpacing:'0.06em',
                      color:'var(--text-secondary)', borderBottom:'1px solid var(--border-color)',
                      background:'var(--bg-secondary)'
                    }}>
                      <span>Student</span>
                      <span>Obtained</span>
                      <span>Max</span>
                      <span>Percentage</span>
                      <span>Exam Date</span>
                      <span>Remarks</span>
                      <span style={{ textAlign:'center' }}>Action</span>
                    </div>

                    {gradeMarks.map((m, i) => {
                      const pct = m.max_marks > 0 ? ((m.marks_obtained / m.max_marks) * 100).toFixed(1) : 0;
                      const good = pct >= 35;
                      return (
                        <div
                          key={m.name}
                          style={{
                            display:'grid',
                            gridTemplateColumns:'1.6fr 1fr 1fr 1fr 1fr 1.2fr 90px',
                            padding:'12px 20px', alignItems:'center',
                            borderBottom: i < gradeMarks.length - 1 ? '1px solid var(--border-color)' : 'none',
                            transition:'background 0.15s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,92,231,0.05)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ fontWeight:600, fontSize:'0.92rem' }}>{m.student_name}</div>
                          <div style={{ fontWeight:700, color: good ? 'var(--accent-secondary)' : 'var(--accent-tertiary)' }}>
                            {m.marks_obtained}
                          </div>
                          <div style={{ color:'var(--text-secondary)' }}>{m.max_marks}</div>
                          <div>
                            <span style={{
                              padding:'3px 10px', borderRadius:'20px', fontSize:'0.75rem', fontWeight:600,
                              background: good ? 'rgba(0,206,201,0.12)' : 'rgba(253,121,168,0.12)',
                              color: good ? 'var(--accent-secondary)' : 'var(--accent-tertiary)'
                            }}>{pct}%</span>
                          </div>
                          <div style={{ fontSize:'0.85rem', color:'var(--text-secondary)' }}>{m.exam_date || '—'}</div>
                          <div style={{
                            fontSize:'0.82rem', color:'var(--text-secondary)',
                            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'
                          }}>{m.remarks || '—'}</div>
                          <div style={{ textAlign:'center' }}>
                            <Btn small variant="success" onClick={() => openEdit(m)}>Edit</Btn>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Quick Student Modal */}
      {(modal === 'edit' || modal === 'single-add') && (
        <Modal
          title={modal === 'single-add' ? `Add Marks — ${subject}` : `Edit Marks — ${subject}`}
          onClose={() => setModal(null)}
        >
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <Field label="Student ID">
              <Input value={form.student} disabled />
            </Field>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
              <Field label="Marks Obtained *">
                <Input type="number" value={form.marks_obtained} onChange={v => setForm({ ...form, marks_obtained: v })} />
              </Field>
              <Field label="Max Marks">
                <Input type="number" value={form.max_marks} onChange={v => setForm({ ...form, max_marks: v })} />
              </Field>
            </div>
            <Field label="Exam Date">
              <Input type="date" value={form.exam_date} onChange={v => setForm({ ...form, exam_date: v })} />
            </Field>
            <Field label="Remarks">
              <Input value={form.remarks} onChange={v => setForm({ ...form, remarks: v })} placeholder="Optional" />
            </Field>
            {msg && (
              <div style={{ padding:'10px', borderRadius:'8px', background:'rgba(108,92,231,0.1)', fontSize:'0.9rem' }}>{msg}</div>
            )}
            <div style={{ display:'flex', gap:'12px', justifyContent:'flex-end' }}>
              <Btn variant="danger" onClick={() => setModal(null)}>Cancel</Btn>
              <Btn onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Btn>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'add' && (
        <Modal title={`Bulk Add Marks — ${subject}`} onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              <Field label="Class">
                <select value={addClass} onChange={e => setAddClass(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }}>
                  <option value="">Select class…</option>
                  {[...new Set(studentsList.map(s => s.grade))].sort().map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="Max Marks">
                <Input type="number" value={addMaxMarks} onChange={setAddMaxMarks} />
              </Field>
              <Field label="Exam Date">
                <Input type="date" value={addExamDate} onChange={setAddExamDate} />
              </Field>
            </div>

            {addClass && (
              <div style={{ overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-secondary)', marginTop:'8px' }}>
                <div style={{ padding: '8px 12px', background: 'rgba(108,92,231,0.1)', borderBottom: '1px solid var(--border-color)', fontWeight: 600, fontSize: '0.85rem' }}>
                  Students in Class {addClass}
                </div>
                {Object.keys(bulkMarks).length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No students in this class.</div>
                ) : (
                  Object.keys(bulkMarks).map((sid, i) => {
                    const s = studentsList.find(x => x.id === sid);
                    return (
                      <div key={sid} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderBottom: i < Object.keys(bulkMarks).length - 1 ? '1px solid var(--border-color)' : 'none', background: 'var(--bg-primary)' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s?.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{sid}</div>
                        </div>
                        <input
                          type="number"
                          placeholder="Marks"
                          value={bulkMarks[sid]}
                          onChange={e => setBulkMarks(p => ({ ...p, [sid]: e.target.value }))}
                          style={{ width: '80px', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white', fontSize: '0.9rem' }}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {msg && <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(108,92,231,0.1)', fontSize: '0.9rem' }}>{msg}</div>}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <Btn variant="danger" onClick={() => setModal(null)}>Cancel</Btn>
              <Btn onClick={handleBulkSave} disabled={saving || !addClass || Object.keys(bulkMarks).length === 0} id="save-marks-btn">{saving ? 'Saving…' : 'Save Class Marks'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

const ClassRoster = ({ userInfo, onAddMarks }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    callApi('school_erp.api.get_students_by_class')
      .then(r => {
        setClasses(r || []);
        // Auto-expand all grades by default
        const exp = {};
        (r || []).forEach(c => { exp[c.grade] = true; });
        setExpanded(exp);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggle = (grade) => setExpanded(prev => ({ ...prev, [grade]: !prev[grade] }));

  const q = search.trim().toLowerCase();
  const filtered = classes.map(cls => ({
    ...cls,
    students: cls.students.filter(s =>
      !q || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    )
  })).filter(cls => cls.students.length > 0);

  const totalStudents = classes.reduce((a, c) => a + c.students.length, 0);

  return (
    <div className="animate-fade-in" style={{ display:'flex', flexDirection:'column', gap:'24px' }}>
      {/* Dashboard Header */}
      <div className="welcome-section" style={{ marginBottom:'0' }}>
        <div className="welcome-text">
          <h1>Welcome, {userInfo.name_display} 👋</h1>
          <p>Your class roster for <strong style={{ color:'var(--accent-primary)' }}>{userInfo.subject}</strong> — {classes.length} class{classes.length !== 1 ? 'es' : ''} · {totalStudents} student{totalStudents !== 1 ? 's' : ''} enrolled</p>
        </div>
      </div>

      {/* Search */}
      <div style={{ position:'relative', maxWidth:'360px' }}>
        <span style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', fontSize:'1rem', pointerEvents:'none' }}>🔍</span>
        <input
          id="class-roster-search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or ID…"
          style={{
            width:'100%', boxSizing:'border-box',
            padding:'10px 12px 10px 36px',
            borderRadius:'10px',
            border:'1px solid var(--border-color)',
            background:'var(--bg-secondary)',
            color:'var(--text-primary)',
            fontSize:'0.9rem',
            outline:'none'
          }}
        />
      </div>

      {loading ? (
        <div style={{ padding:'60px', textAlign:'center', color:'var(--text-secondary)' }}>Loading students…</div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel" style={{ padding:'48px', textAlign:'center', color:'var(--text-secondary)' }}>
          {q ? `No students match "${search}"` : 'No students found.'}
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          {filtered.map(cls => (
            <div key={cls.grade} className="glass-panel" style={{ padding:'0', overflow:'hidden' }}>
              {/* Grade header / accordion toggle */}
              <div
                onClick={() => toggle(cls.grade)}
                style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'16px 20px', cursor:'pointer',
                  borderBottom: expanded[cls.grade] ? '1px solid var(--border-color)' : 'none',
                  background:'rgba(108,92,231,0.07)',
                  transition:'background 0.2s'
                }}
              >
                <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                  <span style={{ fontSize:'1.4rem' }}>🏫</span>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'1.05rem' }}>Grade {cls.grade}</div>
                    <div style={{ fontSize:'0.82rem', color:'var(--text-secondary)' }}>{cls.students.length} student{cls.students.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  {/* Marks coverage pill */}
                  {(() => {
                    const withMarks = cls.students.filter(s => s.has_marks).length;
                    const pct = cls.students.length > 0 ? Math.round((withMarks / cls.students.length) * 100) : 0;
                    return (
                      <span style={{
                        padding:'3px 12px', borderRadius:'20px', fontSize:'0.78rem', fontWeight:600,
                        background: pct === 100 ? 'rgba(0,206,201,0.15)' : pct > 0 ? 'rgba(253,203,110,0.15)' : 'rgba(253,121,168,0.12)',
                        color: pct === 100 ? 'var(--accent-secondary)' : pct > 0 ? '#fdcb6e' : 'var(--accent-tertiary)'
                      }}>
                        {withMarks}/{cls.students.length} marks entered
                      </span>
                    );
                  })()}
                  <span style={{ fontSize:'1rem', color:'var(--text-secondary)', transition:'transform 0.25s', display:'inline-block', transform: expanded[cls.grade] ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                </div>
              </div>

              {/* Student rows */}
              {expanded[cls.grade] && (
                <div>
                  {/* Column headers */}
                  <div style={{
                    display:'grid', gridTemplateColumns:'1fr 1.4fr 1fr 120px 110px',
                    padding:'8px 20px', fontSize:'0.75rem', fontWeight:700,
                    textTransform:'uppercase', letterSpacing:'0.06em',
                    color:'var(--text-secondary)', borderBottom:'1px solid var(--border-color)',
                    background:'var(--bg-secondary)'
                  }}>
                    <span>Name</span>
                    <span>Student ID</span>
                    <span>Email</span>
                    <span style={{ textAlign:'center' }}>Marks Status</span>
                    <span style={{ textAlign:'center' }}>Action</span>
                  </div>
                  {cls.students.map((s, i) => (
                    <div
                      key={s.id}
                      style={{
                        display:'grid', gridTemplateColumns:'1fr 1.4fr 1fr 120px 110px',
                        padding:'12px 20px', alignItems:'center',
                        borderBottom: i < cls.students.length - 1 ? '1px solid var(--border-color)' : 'none',
                        transition:'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background='rgba(108,92,231,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}
                    >
                      <div style={{ fontWeight:600, fontSize:'0.92rem' }}>{s.name}</div>
                      <div style={{ fontFamily:'monospace', fontSize:'0.82rem', color:'var(--accent-primary)', letterSpacing:'0.02em' }}>{s.id}</div>
                      <div style={{ fontSize:'0.82rem', color:'var(--text-secondary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.email || '—'}</div>
                      <div style={{ textAlign:'center' }}>
                        <span style={{
                          padding:'3px 10px', borderRadius:'20px', fontSize:'0.75rem', fontWeight:600,
                          background: s.has_marks ? 'rgba(0,206,201,0.12)' : 'rgba(253,121,168,0.12)',
                          color: s.has_marks ? 'var(--accent-secondary)' : 'var(--accent-tertiary)'
                        }}>
                          {s.has_marks ? '✅ Done' : '⏳ Pending'}
                        </span>
                      </div>
                      <div style={{ textAlign:'center' }}>
                        <button
                          onClick={() => onAddMarks && onAddMarks(s.id, s.name)}
                          style={{ padding:'4px 12px', borderRadius:'8px', fontSize:'0.75rem', fontWeight:600, background:'rgba(108,92,231,0.15)', border:'1px solid var(--accent-primary)', color:'var(--accent-primary)', cursor:'pointer' }}
                        >
                          + Marks
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TeacherAttendanceList = () => {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [filterGrade, setFilterGrade] = useState('');

  useEffect(() => {
    Promise.all([
      callApi('school_erp.api.get_attendance'),
      callApi('school_erp.api.get_students_by_class')
    ]).then(([attendanceData, classesData]) => {
      setAttendance(attendanceData || []);
      
      const allStuds = [];
      (classesData || []).forEach(c => {
        c.students.forEach(s => {
          allStuds.push({ name: s.id, grade: c.grade });
        });
      });
      setStudents(allStuds);
      
      const gradesAvail = [...new Set((attendanceData || []).map(a => a.student_info?.grade))].filter(Boolean).sort();
      if (gradesAvail[0]) setExpanded({ [gradesAvail[0]]: true });
      
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const toggle = d => setExpanded(p => ({ ...p, [d]: !p[d] }));
  const statusColor = { Present: 'var(--accent-secondary)', Absent: 'var(--accent-tertiary)', Late: '#ff9f43' };

  const filtered = filterGrade ? attendance.filter(a => a.student_info.grade === filterGrade) : attendance;
  const allGrades = [...new Set(students.map(s => s.grade || '—'))].sort();
  const activeGrades = [...new Set(filtered.map(a => a.student_info.grade))].filter(Boolean).sort();

  const byGradeDate = {};
  filtered.forEach(a => {
    const g = a.student_info.grade || '—';
    if (!byGradeDate[g]) byGradeDate[g] = {};
    if (!byGradeDate[g][a.date]) byGradeDate[g][a.date] = [];
    byGradeDate[g][a.date].push(a);
  });

  const selectStyle = { padding:'8px 12px', borderRadius:'8px', border:'1px solid var(--border-color)', background:'var(--bg-secondary)', color:'white', fontSize:'0.9rem' };

  return (
    <div className="animate-fade-in" style={{ display:'flex', flexDirection:'column', gap:'24px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h1 style={{ marginBottom:'8px' }}>Attendance Overview</h1>
          <p>Class-wise records · <strong style={{ color:'var(--accent-primary)' }}>{activeGrades.length}</strong> class{activeGrades.length !== 1 ? 'es' : ''}</p>
        </div>
        <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
          <span style={{ fontSize:'0.9rem', color:'var(--text-secondary)' }}>Filter class:</span>
          <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} style={selectStyle}>
            <option value="">All Classes</option>
            {allGrades.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          {filterGrade && <Btn small variant="danger" onClick={() => setFilterGrade('')}>Clear</Btn>}
        </div>
      </div>

      {loading ? (
        <div style={{ padding:'60px', textAlign:'center', color:'var(--text-secondary)' }}>Loading…</div>
      ) : activeGrades.length === 0 ? (
        <div className="glass-panel" style={{ padding:'48px', textAlign:'center', color:'var(--text-secondary)' }}>No attendance records found.</div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          {activeGrades.map(grade => {
            const isExp = !!expanded[grade];
            const dateGroups = byGradeDate[grade] || {};
            const dates = Object.keys(dateGroups).sort((a,b) => b.localeCompare(a));
            let totalPresent = 0, totalAbsent = 0;
            dates.forEach(d => {
              totalPresent += dateGroups[d].filter(r => r.status === 'Present').length;
              totalAbsent += dateGroups[d].filter(r => r.status === 'Absent').length;
            });

            return (
              <div key={grade} className="glass-panel" style={{ padding:'0', overflow:'hidden' }}>
                <div onClick={() => toggle(grade)} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', cursor:'pointer', background:'rgba(108,92,231,0.07)', borderBottom: isExp ? '1px solid var(--border-color)' : 'none', transition:'background 0.2s' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <span style={{ fontSize:'1.3rem' }}>🏫</span>
                    <div>
                      <div style={{ fontWeight:700, fontSize:'1.05rem' }}>Class {grade}</div>
                      <div style={{ fontSize:'0.82rem', color:'var(--text-secondary)' }}>{dates.length} date{dates.length !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <span style={{ padding:'3px 10px', borderRadius:'20px', fontSize:'0.78rem', fontWeight:600, background:'rgba(0,206,201,0.12)', color:'var(--accent-secondary)' }}>✅ {totalPresent} Present</span>
                    <span style={{ padding:'3px 10px', borderRadius:'20px', fontSize:'0.78rem', fontWeight:600, background:'rgba(253,121,168,0.12)', color:'var(--accent-tertiary)' }}>❌ {totalAbsent} Absent</span>
                    <span style={{ fontSize:'1rem', color:'var(--text-secondary)', display:'inline-block', transition:'transform 0.25s', transform: isExp ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                  </div>
                </div>
                {isExp && (
                  <div style={{ display:'flex', flexDirection:'column', gap:'0' }}>
                    {dates.map((date, di) => (
                      <div key={date} style={{ borderBottom: di < dates.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                        <div style={{ background:'rgba(0,206,201,0.04)', padding:'8px 20px', fontSize:'0.85rem', fontWeight:700, color:'var(--accent-secondary)' }}>
                          📅 {date}
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'1.8fr 1.5fr 100px', padding:'8px 20px', fontSize:'0.75rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-secondary)', borderBottom:'1px solid var(--border-color)', background:'var(--bg-secondary)' }}>
                          <span>Student Name</span><span>Student ID</span><span style={{ textAlign:'center' }}>Status</span>
                        </div>
                        {dateGroups[date].map((r, i) => (
                          <div key={r.name} style={{ display:'grid', gridTemplateColumns:'1.8fr 1.5fr 100px', padding:'11px 20px', alignItems:'center', borderBottom: i < dateGroups[date].length - 1 ? '1px solid var(--border-color)' : 'none', transition:'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,92,231,0.05)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <div style={{ fontWeight:600, fontSize:'0.92rem' }}>{r.student_info.full_name}</div>
                            <div style={{ fontFamily:'monospace', fontSize:'0.82rem', color:'var(--accent-primary)' }}>{r.student}</div>
                            <div style={{ textAlign:'center' }}>
                              <span style={{ padding:'3px 10px', borderRadius:'20px', fontSize:'0.75rem', fontWeight:600, background:`${statusColor[r.status] || 'gray'}22`, color: statusColor[r.status] || 'gray' }}>{r.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const TeacherApp = ({ userInfo, onLogout }) => {
  const [tab, setTab] = useState('students');
  const [quickStudent, setQuickStudent] = useState(null); // { id, name } for pre-filled marks modal

  const handleAddMarks = (studentId, studentName) => {
    setQuickStudent({ id: studentId, name: studentName });
    setTab('marks');
  };

  const content = {
    students: <ClassRoster userInfo={userInfo} onAddMarks={handleAddMarks} />,
    marks: <MarksPanel userInfo={userInfo} quickStudent={quickStudent} onQuickClear={() => setQuickStudent(null)} />,
    attendance: <TeacherAttendanceList />
  };
  const current = teacherNav.find(n => n.id === tab);
  return (
    <Layout title={current?.label || 'Dashboard'} subtitle={`Subject: ${userInfo.subject}`} icon="👩‍🏫" onLogout={onLogout} nameDisplay={userInfo.name_display} role="Teacher"
      sidebar={teacherNav.map(n => <NavItem key={n.id} {...n} active={tab===n.id} onClick={setTab}/>)}>
      {content[tab]}
    </Layout>
  );
};
