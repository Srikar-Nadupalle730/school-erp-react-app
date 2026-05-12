import React, { useState, useEffect, useCallback } from 'react';
import { api, callApi } from './api.js';
import { Layout, NavItem, Table, Modal, Btn, Field, Input } from './components.jsx';

const adminNav = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'students', icon: '👨‍🎓', label: 'Students' },
  { id: 'teachers', icon: '👩‍🏫', label: 'Teachers' },
  { id: 'marks', icon: '📝', label: 'Marks Manager' },
  { id: 'users', icon: '🔑', label: 'User Credentials' },
  { id: 'academics', icon: '📚', label: 'Academics' },
  { id: 'attendance', icon: '📅', label: 'Attendance' },
];

// ── Dashboard ─────────────────────────────────────────────────
const Dashboard = () => {
  const [stats, setStats] = useState({ students: 0, teachers: 0, marks: 0 });
  useEffect(() => {
    Promise.all([
      api.get('resource/School Student?limit_page_length=0'),
      api.get('resource/School Teacher?limit_page_length=0'),
      api.get('resource/School Marks?limit_page_length=0'),
    ]).then(([s, t, m]) => setStats({
      students: s.data.data?.length || 0,
      teachers: t.data.data?.length || 0,
      marks: m.data.data?.length || 0,
    })).catch(() => { });
  }, []);

  const cards = [
    { label: 'Total Students', value: stats.students, icon: '👨‍🎓', color: 'var(--accent-primary)' },
    { label: 'Active Teachers', value: stats.teachers, icon: '👩‍🏫', color: 'var(--accent-secondary)' },
    { label: 'Marks Records', value: stats.marks, icon: '📝', color: '#ff9f43' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="welcome-section" style={{ marginBottom: '32px' }}>
        <div className="welcome-text">
          <h1>Admin Dashboard 👋</h1>
          <p>Manage your school — students, teachers, marks, and credentials.</p>
        </div>
      </div>
      <div className="metrics-grid">
        {cards.map(c => (
          <div key={c.label} className="metric-card glass-panel">
            <div className="metric-header">
              <span className="metric-label">{c.label}</span>
              <div className="metric-icon" style={{ background: `${c.color}22`, color: c.color }}>{c.icon}</div>
            </div>
            <div className="metric-value">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Students List (class-wise accordion) ──────────────────────────────────
const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ first_name: '', last_name: '', email: '', grade: '', enrollment_date: '' });
  const [addMsg, setAddMsg] = useState('');
  const [addSaving, setAddSaving] = useState(false);

  const loadStudents = () => {
    setLoading(true);
    api.get('resource/School Student?fields=["name","first_name","last_name","grade","email","frappe_user"]&limit_page_length=0')
      .then(r => {
        const data = r.data.data || [];
        setStudents(data);
        const exp = {};
        data.forEach(s => { if (s.grade) exp[s.grade] = true; });
        setExpanded(exp);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadStudents(); }, []);

  const handleAddStudent = async () => {
    if (!addForm.first_name.trim()) { setAddMsg('First name is required.'); return; }
    setAddSaving(true); setAddMsg('');
    try {
      await api.post('resource/School Student', addForm);
      setAddMsg('✅ Student added successfully!');
      setTimeout(() => { setShowAdd(false); setAddForm({ first_name: '', last_name: '', email: '', grade: '', enrollment_date: '' }); setAddMsg(''); loadStudents(); }, 1000);
    } catch (e) {
      setAddMsg(`❌ ${e.response?.data?._server_messages || e.response?.data?.exception || 'Error adding student.'}`);
    } finally { setAddSaving(false); }
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    if (!confirm(`Delete student "${studentName}" (${studentId})?\n\nThis will permanently delete:\n• All marks records\n• All attendance records\n• Login credentials (if any)\n• The student record itself\n\nThis action cannot be undone.`)) return;
    try {
      await callApi('school_erp.api.delete_student', { student_id: studentId });
      loadStudents();
    } catch (e) {
      alert(`Error deleting student: ${e.response?.data?.exception || 'Unknown error'}`);
    }
  };

  const toggle = g => setExpanded(p => ({ ...p, [g]: !p[g] }));
  const q = search.trim().toLowerCase();

  const byGrade = {};
  students.forEach(s => {
    const g = s.grade || 'Unassigned';
    if (!byGrade[g]) byGrade[g] = [];
    const name = `${s.first_name} ${s.last_name || ''}`.toLowerCase();
    if (!q || name.includes(q) || s.name.toLowerCase().includes(q))
      byGrade[g].push(s);
  });
  const grades = Object.keys(byGrade).filter(g => byGrade[g].length > 0).sort();

  const gradeOptions = ['9th Grade', '10th Grade', '11th Grade', '12th Grade'];
  const selectStyle = { padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white', width: '100%' };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ marginBottom: '8px' }}>Students Directory</h1>
          <p>{grades.length} class{grades.length !== 1 ? 'es' : ''} · <strong style={{ color: 'var(--accent-primary)' }}>{students.length}</strong> enrolled</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students…"
              style={{ padding: '9px 12px 9px 32px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }} />
          </div>
          <Btn id="add-student-btn" onClick={() => { setShowAdd(true); setAddMsg(''); }}>+ Add Student</Btn>
        </div>
      </div>
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading…</div>
      ) : grades.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>No students found.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {grades.map(grade => (
            <div key={grade} className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
              <div onClick={() => toggle(grade)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: 'pointer', background: 'rgba(108,92,231,0.07)', borderBottom: expanded[grade] ? '1px solid var(--border-color)' : 'none', transition: 'background 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.3rem' }}>🏫</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Grade {grade}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{byGrade[grade].length} student{byGrade[grade].length !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', display: 'inline-block', transition: 'transform 0.25s', transform: expanded[grade] ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
              </div>
              {expanded[grade] && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.8fr 1.5fr 0.8fr 80px', padding: '8px 20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                    <span>Name</span><span>Student ID</span><span>Email</span><span>Login</span><span style={{ textAlign: 'center' }}>Action</span>
                  </div>
                  {byGrade[grade].map((s, i) => (
                    <div key={s.name} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.8fr 1.5fr 0.8fr 80px', padding: '12px 20px', alignItems: 'center', borderBottom: i < byGrade[grade].length - 1 ? '1px solid var(--border-color)' : 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,92,231,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ fontWeight: 600 }}>{s.first_name} {s.last_name}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--accent-primary)' }}>{s.name}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.email || '—'}</div>
                      <div>{s.frappe_user
                        ? <span style={{ color: 'var(--accent-secondary)', fontSize: '0.82rem' }}>✓ Active</span>
                        : <span style={{ color: 'var(--accent-tertiary)', fontSize: '0.82rem' }}>No login</span>}
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <Btn small variant="danger" onClick={() => handleDeleteStudent(s.name, `${s.first_name} ${s.last_name}`)}>Delete</Btn>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <Modal title="Add New Student" onClose={() => setShowAdd(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="First Name *"><Input value={addForm.first_name} onChange={v => setAddForm({ ...addForm, first_name: v })} /></Field>
              <Field label="Last Name"><Input value={addForm.last_name} onChange={v => setAddForm({ ...addForm, last_name: v })} /></Field>
            </div>
            <Field label="Email"><Input value={addForm.email} onChange={v => setAddForm({ ...addForm, email: v })} /></Field>
            <Field label="Grade">
              <select value={addForm.grade} onChange={e => setAddForm({ ...addForm, grade: e.target.value })} style={selectStyle}>
                <option value="">Select grade…</option>
                {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="Enrollment Date"><Input type="date" value={addForm.enrollment_date} onChange={v => setAddForm({ ...addForm, enrollment_date: v })} /></Field>
            {addMsg && <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(108,92,231,0.1)', fontSize: '0.9rem' }}>{addMsg}</div>}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Btn variant="danger" onClick={() => setShowAdd(false)}>Cancel</Btn>
              <Btn onClick={handleAddStudent} disabled={addSaving} id="confirm-add-student">{addSaving ? 'Adding…' : 'Add Student'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── Teachers List ──────────────────────────────────────────────────────
const TeachersList = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ first_name: '', last_name: '', email: '', subject: '' });
  const [addMsg, setAddMsg] = useState('');
  const [addSaving, setAddSaving] = useState(false);

  const loadTeachers = () => {
    setLoading(true);
    api.get('resource/School Teacher?fields=["name","first_name","last_name","subject","email","frappe_user"]&limit_page_length=0')
      .then(r => { setTeachers(r.data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadTeachers(); }, []);

  const handleAddTeacher = async () => {
    if (!addForm.first_name.trim()) { setAddMsg('First name is required.'); return; }
    setAddSaving(true); setAddMsg('');
    try {
      await api.post('resource/School Teacher', addForm);
      setAddMsg('✅ Teacher added successfully!');
      setTimeout(() => { setShowAdd(false); setAddForm({ first_name: '', last_name: '', email: '', subject: '' }); setAddMsg(''); loadTeachers(); }, 1000);
    } catch (e) {
      setAddMsg(`❌ ${e.response?.data?._server_messages || e.response?.data?.exception || 'Error adding teacher.'}`);
    } finally { setAddSaving(false); }
  };

  const handleDeleteTeacher = async (teacherId, teacherName) => {
    if (!confirm(`Delete teacher "${teacherName}" (${teacherId})?\n\nThis will permanently delete:\n• Login credentials (if any)\n• Course assignments will be unlinked\n• The teacher record itself\n\nThis action cannot be undone.`)) return;
    try {
      await callApi('school_erp.api.delete_teacher', { teacher_id: teacherId });
      loadTeachers();
    } catch (e) {
      alert(`Error deleting teacher: ${e.response?.data?.exception || 'Unknown error'}`);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ marginBottom: '8px' }}>Teachers Directory</h1>
          <p>All active teachers.</p>
        </div>
        <Btn id="add-teacher-btn" onClick={() => { setShowAdd(true); setAddMsg(''); }}>+ Add Teacher</Btn>
      </div>
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? <div style={{ padding: '40px', textAlign: 'center' }}>Loading…</div> : (
          <Table
            headers={['ID', 'Full Name', 'Subject', 'Email', 'Login Account', 'Action']}
            emptyMsg="No teachers found."
            rows={teachers.map(t => (
              <tr key={t.name} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t.name}</td>
                <td style={{ padding: '14px 16px', fontWeight: 500 }}>{t.first_name} {t.last_name}</td>
                <td style={{ padding: '14px 16px', color: 'var(--accent-primary)' }}>{t.subject}</td>
                <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{t.email}</td>
                <td style={{ padding: '14px 16px' }}>
                  {t.frappe_user
                    ? <span style={{ color: 'var(--accent-secondary)', fontSize: '0.85rem' }}>✓ {t.frappe_user}</span>
                    : <span style={{ color: 'var(--accent-tertiary)', fontSize: '0.85rem' }}>No login</span>}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <Btn small variant="danger" onClick={() => handleDeleteTeacher(t.name, `${t.first_name} ${t.last_name}`)}>Delete</Btn>
                </td>
              </tr>
            ))}
          />
        )}
      </div>

      {showAdd && (
        <Modal title="Add New Teacher" onClose={() => setShowAdd(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="First Name *"><Input value={addForm.first_name} onChange={v => setAddForm({ ...addForm, first_name: v })} /></Field>
              <Field label="Last Name"><Input value={addForm.last_name} onChange={v => setAddForm({ ...addForm, last_name: v })} /></Field>
            </div>
            <Field label="Email"><Input value={addForm.email} onChange={v => setAddForm({ ...addForm, email: v })} /></Field>
            <Field label="Primary Subject"><Input value={addForm.subject} onChange={v => setAddForm({ ...addForm, subject: v })} /></Field>
            {addMsg && <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(108,92,231,0.1)', fontSize: '0.9rem' }}>{addMsg}</div>}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Btn variant="danger" onClick={() => setShowAdd(false)}>Cancel</Btn>
              <Btn onClick={handleAddTeacher} disabled={addSaving} id="confirm-add-teacher">{addSaving ? 'Adding…' : 'Add Teacher'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── User Credentials Panel ─────────────────────────────────────
const UserCredentials = () => {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [modal, setModal] = useState(null); // {type:'student'|'teacher', id, name}
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('resource/School Student?fields=["name","first_name","last_name","frappe_user","grade"]&limit_page_length=0').then(r => setStudents(r.data.data || []));
    api.get('resource/School Teacher?fields=["name","first_name","last_name","frappe_user","subject"]&limit_page_length=0').then(r => setTeachers(r.data.data || []));
  }, [saving]);

  const openModal = (type, id, name) => { setModal({ type, id, name }); setUsername(''); setPassword(''); setMsg(''); };
  const closeModal = () => setModal(null);

  const handleCreate = async () => {
    if (!username || !password) { setMsg('Please fill all fields.'); return; }
    setSaving(true); setMsg('');
    try {
      const method = modal.type === 'student' ? 'school_erp.api.create_student_user' : 'school_erp.api.create_teacher_user';
      const key = modal.type === 'student' ? 'student_id' : 'teacher_id';
      const res = await callApi(method, { [key]: modal.id, username, password });
      setMsg(`✅ ${res.message}`);
      setSaving(false);
      setTimeout(closeModal, 1500);
    } catch (e) {
      setMsg(`❌ ${e.response?.data?.exception || 'Error creating credentials.'}`);
      setSaving(false);
    }
  };

  const renderRow = (person, type) => (
    <tr key={person.name} style={{ borderBottom: '1px solid var(--border-color)' }}>
      <td style={{ padding: '14px 16px' }}>{person.first_name} {person.last_name}</td>
      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{person.name}</td>
      <td style={{ padding: '14px 16px' }}>
        {person.frappe_user
          ? <span style={{ color: 'var(--accent-secondary)', fontSize: '0.85rem' }}>✓ {person.frappe_user}</span>
          : <span style={{ color: 'var(--accent-tertiary)', fontSize: '0.85rem' }}>No login</span>}
      </td>
      <td style={{ padding: '14px 16px' }}>
        <Btn small id={`create-cred-${person.name}`} onClick={() => openModal(type, person.name, `${person.first_name} ${person.last_name}`)}>
          {person.frappe_user ? '🔄 Update' : '+ Create Login'}
        </Btn>
      </td>
    </tr>
  );

  const teachersBySubject = {};
  teachers.forEach(t => {
    const s = t.subject || 'Unassigned';
    if (!teachersBySubject[s]) teachersBySubject[s] = [];
    teachersBySubject[s].push(t);
  });

  const studentsByGrade = {};
  students.forEach(s => {
    const g = s.grade || 'Unassigned';
    if (!studentsByGrade[g]) studentsByGrade[g] = [];
    studentsByGrade[g].push(s);
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ marginBottom: '8px' }}>User Credentials</h1>
        <p>Create or update login accounts for teachers and students.</p>
      </div>

      <div>
        <h3 style={{ marginBottom: '16px' }}>👩‍🏫 Teacher Accounts (by Subject)</h3>
        {Object.keys(teachersBySubject).sort().map(subj => (
          <div key={subj} style={{ marginBottom: '16px' }}>
            <h4 style={{ marginBottom: '8px', color: 'var(--accent-primary)' }}>{subj}</h4>
            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
              <Table headers={['Name', 'ID', 'Login Email', 'Action']} emptyMsg="No teachers." rows={teachersBySubject[subj].map(t => renderRow(t, 'teacher'))} />
            </div>
          </div>
        ))}
        {teachers.length === 0 && <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>No teachers.</div>}
      </div>

      <div>
        <h3 style={{ marginBottom: '16px' }}>👨‍🎓 Student Accounts (by Class)</h3>
        {Object.keys(studentsByGrade).sort().map(grade => (
          <div key={grade} style={{ marginBottom: '16px' }}>
            <h4 style={{ marginBottom: '8px', color: 'var(--accent-secondary)' }}>{grade}</h4>
            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
              <Table headers={['Name', 'ID', 'Login Email', 'Action']} emptyMsg="No students." rows={studentsByGrade[grade].map(s => renderRow(s, 'student'))} />
            </div>
          </div>
        ))}
        {students.length === 0 && <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>No students.</div>}
      </div>

      {modal && (
        <Modal title={`Create Login — ${modal.name}`} onClose={closeModal}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Field label="Username (or full email)">
              <Input value={username} onChange={setUsername} />
            </Field>
            <Field label="Password">
              <Input type="password" value={password} onChange={setPassword} />
            </Field>
            {msg && <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(108,92,231,0.1)', fontSize: '0.9rem' }}>{msg}</div>}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Btn variant="danger" onClick={closeModal}>Cancel</Btn>
              <Btn onClick={handleCreate} disabled={saving} id="confirm-create-cred">{saving ? 'Creating…' : 'Create Login'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── Marks Manager ──────────────────────────────────────────────
const MarksManager = () => {

  const [marks, setMarks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'add' | 'edit'
  const [form, setForm] = useState({ student: '', subject: '', marks_obtained: '', max_marks: '100', exam_date: '', remarks: '' });
  
  // Bulk Add State
  const [addClass, setAddClass] = useState('');
  const [addSubject, setAddSubject] = useState('');
  const [addMaxMarks, setAddMaxMarks] = useState('100');
  const [addExamDate, setAddExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [bulkMarks, setBulkMarks] = useState({});

  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [filterGrade, setFilterGrade] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    callApi('school_erp.api.get_marks').then(r => { setMarks(r || []); setLoading(false); }).catch(() => setLoading(false));
    api.get('resource/School Student?fields=["name","first_name","last_name","grade"]&limit_page_length=0').then(r => setStudents(r.data.data || []));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (addClass) {
      const clsStuds = students.filter(s => s.grade === addClass);
      const init = {};
      clsStuds.forEach(s => init[s.name] = '');
      setBulkMarks(init);
    } else {
      setBulkMarks({});
    }
  }, [addClass, students]);

  const openAdd = () => { 
    setAddClass(''); 
    setAddSubject(''); 
    setAddMaxMarks('100'); 
    setAddExamDate(new Date().toISOString().split('T')[0]); 
    setBulkMarks({}); 
    setMsg(''); 
    setModal('add'); 
  };
  const openEdit = (m) => { setForm({ student: m.student, subject: m.subject, marks_obtained: m.marks_obtained, max_marks: m.max_marks, exam_date: m.exam_date || '', remarks: m.remarks || '', marks_id: m.name }); setMsg(''); setModal('edit'); };

  const handleSave = async () => {
    if (!form.student || !form.subject || form.marks_obtained === '') { setMsg('Please fill required fields.'); return; }
    setSaving(true); setMsg('');
    try {
      const payload = { student_id: form.student, subject: form.subject, marks_obtained: form.marks_obtained, max_marks: form.max_marks, exam_date: form.exam_date, remarks: form.remarks };
      if (form.marks_id) payload.marks_id = form.marks_id;
      await callApi('school_erp.api.save_marks', payload);
      setMsg('✅ Saved!'); load(); setTimeout(() => setModal(null), 800);
    } catch (e) {
      setMsg(`❌ ${e.response?.data?.exception || 'Error saving.'}`);
    } finally { setSaving(false); }
  };

  const handleBulkSave = async () => {
    if (!addClass || !addSubject || !addMaxMarks) { setMsg('Please select Class, Subject, and Max Marks.'); return; }
    const validStudents = Object.keys(bulkMarks).filter(id => bulkMarks[id] !== '');
    if (validStudents.length === 0) { setMsg('Please enter marks for at least one student.'); return; }
    
    setSaving(true); setMsg('');
    try {
      await Promise.all(validStudents.map(sid => 
        callApi('school_erp.api.save_marks', {
          student_id: sid,
          subject: addSubject,
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

  const handleDelete = async (id) => {
    if (!confirm('Delete this marks record?')) return;
    await callApi('school_erp.api.delete_marks', { marks_id: id });
    load();
  };

  const allGrades = [...new Set(students.map(s => s.grade || '—'))].filter(g => g !== '—').sort();
  const grades = [...new Set(marks.map(m => m.grade).filter(Boolean))].sort();
  const subjects = [...new Set(marks.map(m => m.subject).filter(Boolean))].sort();

  const displayed = marks.filter(m =>
    (!filterGrade || m.grade === filterGrade) &&
    (!filterSubject || m.subject === filterSubject)
  );

  // Group displayed marks: grade -> subject -> [records]
  const grouped = {};
  displayed.forEach(m => {
    const g = m.grade || 'Unassigned';
    const s = m.subject || 'Unknown';
    if (!grouped[g]) grouped[g] = {};
    if (!grouped[g][s]) grouped[g][s] = [];
    grouped[g][s].push(m);
  });
  const sortedGrades = Object.keys(grouped).sort();

  const selectStyle = { padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1 style={{ marginBottom: '8px' }}>Marks Manager</h1><p>Marks grouped by class and subject.</p></div>
        <Btn id="add-marks-btn" onClick={openAdd}>+ Add Marks</Btn>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Filter:</span>
        <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} style={selectStyle}>
          <option value="">All Classes</option>
          {grades.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} style={selectStyle}>
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(filterGrade || filterSubject) && (
          <Btn small variant="danger" onClick={() => { setFilterGrade(''); setFilterSubject(''); }}>Clear</Btn>
        )}
      </div>

      {/* Grouped Display */}
      {loading ? <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>Loading…</div> :
        sortedGrades.length === 0
          ? <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No marks records found.</div>
          : sortedGrades.map(grade => (
            <div key={grade}>
              <h3 style={{ marginBottom: '12px', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: 'rgba(108,92,231,0.15)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.9rem' }}>🏫 Class: {grade}</span>
              </h3>
              {Object.keys(grouped[grade]).sort().map(subject => (
                <div key={subject} className="glass-panel" style={{ marginBottom: '16px', padding: '0', overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', background: 'rgba(0,206,201,0.08)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>📖 {subject}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{grouped[grade][subject].length} student(s)</span>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                        {['Student', 'Marks Obtained', 'Max Marks', '%', 'Exam Date', 'Actions'].map((h, i) => (
                          <th key={i} style={{ padding: '10px 16px', fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {grouped[grade][subject].map(m => {
                        const pct = m.max_marks > 0 ? Math.round(m.marks_obtained / m.max_marks * 100) : 0;
                        const pctColor = pct >= 35 ? 'var(--accent-secondary)' : 'var(--accent-tertiary)';
                        return (
                          <tr key={m.name} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '12px 16px', fontWeight: 500 }}>{m.student_name}</td>
                            <td style={{ padding: '12px 16px', fontWeight: 700, color: m.marks_obtained >= m.max_marks * 0.35 ? 'var(--accent-secondary)' : 'var(--accent-tertiary)' }}>{m.marks_obtained}</td>
                            <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{m.max_marks}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', background: `${pctColor}22`, color: pctColor }}>{pct}%</span>
                            </td>
                            <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{m.exam_date || '—'}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <Btn small variant="success" onClick={() => openEdit(m)}>Edit</Btn>
                                <Btn small variant="danger" onClick={() => handleDelete(m.name)}>Delete</Btn>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ))
      }

      {modal === 'edit' && (
        <Modal title="Edit Marks Entry" onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Field label="Student">
              <Input value={form.student} disabled />
            </Field>
            <Field label="Subject *"><Input value={form.subject} onChange={v => setForm({ ...form, subject: v })} placeholder="e.g. Mathematics" /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="Marks Obtained *"><Input type="number" value={form.marks_obtained} onChange={v => setForm({ ...form, marks_obtained: v })} placeholder="0" /></Field>
              <Field label="Max Marks"><Input type="number" value={form.max_marks} onChange={v => setForm({ ...form, max_marks: v })} placeholder="100" /></Field>
            </div>
            <Field label="Exam Date"><Input type="date" value={form.exam_date} onChange={v => setForm({ ...form, exam_date: v })} /></Field>
            <Field label="Remarks"><Input value={form.remarks} onChange={v => setForm({ ...form, remarks: v })} placeholder="Optional remarks" /></Field>
            {msg && <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(108,92,231,0.1)', fontSize: '0.9rem' }}>{msg}</div>}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Btn variant="danger" onClick={() => setModal(null)}>Cancel</Btn>
              <Btn onClick={handleSave} disabled={saving} id="save-marks-btn">{saving ? 'Saving…' : 'Save'}</Btn>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'add' && (
        <Modal title="Bulk Add Marks Entry" onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="Class">
                <select value={addClass} onChange={e => setAddClass(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white' }}>
                  <option value="">Select class…</option>
                  {allGrades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </Field>
              <Field label="Subject *">
                <Input value={addSubject} onChange={setAddSubject} placeholder="e.g. Mathematics" />
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
                    const s = students.find(x => x.name === sid);
                    return (
                      <div key={sid} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderBottom: i < Object.keys(bulkMarks).length - 1 ? '1px solid var(--border-color)' : 'none', background: 'var(--bg-primary)' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s?.first_name} {s?.last_name || ''}</div>
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

// ── Academics (subject-centric, multi-teacher view) ───────────────────────────
const AcademicsList = () => {
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    Promise.all([
      api.get('resource/School Teacher?fields=["name","first_name","last_name","subject","email","frappe_user"]&limit_page_length=0'),
      api.get('resource/School Course?fields=["name","course_name","teacher"]&limit_page_length=0')
    ]).then(([tr, cr]) => {
      setTeachers(tr.data.data || []);
      setCourses(cr.data.data || []);
      // Auto-expand all subjects
      const exp = {};
      (tr.data.data || []).forEach(t => { if (t.subject) exp[t.subject] = true; });
      setExpanded(exp);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const toggle = s => setExpanded(p => ({ ...p, [s]: !p[s] }));

  // Group teachers by subject
  const bySubject = {};
  teachers.forEach(t => {
    const subj = t.subject || 'Unassigned';
    if (!bySubject[subj]) bySubject[subj] = [];
    bySubject[subj].push(t);
  });
  const subjects = Object.keys(bySubject).sort();

  // Map courses by teacher ID for quick lookup
  const coursesByTeacher = {};
  courses.forEach(c => {
    if (c.teacher) {
      if (!coursesByTeacher[c.teacher]) coursesByTeacher[c.teacher] = [];
      coursesByTeacher[c.teacher].push(c.course_name);
    }
  });

  // Also get courses by subject (matching any teacher in that subject)
  const coursesBySubject = {};
  subjects.forEach(subj => {
    const subjCourses = new Set();
    bySubject[subj].forEach(t => {
      (coursesByTeacher[t.name] || []).forEach(cn => subjCourses.add(cn));
    });
    // Also check courses with course_name matching subject
    courses.forEach(c => {
      if (c.course_name && c.course_name.toLowerCase().includes(subj.toLowerCase())) {
        subjCourses.add(c.course_name);
      }
    });
    coursesBySubject[subj] = [...subjCourses];
  });

  const totalSubjects = subjects.filter(s => s !== 'Unassigned').length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ marginBottom: '8px' }}>Academics</h1>
        <p>Subjects and their assigned teachers. <strong style={{ color: 'var(--accent-primary)' }}>{totalSubjects}</strong> subject{totalSubjects !== 1 ? 's' : ''} · <strong style={{ color: 'var(--accent-primary)' }}>{teachers.length}</strong> teacher{teachers.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading…</div>
      ) : subjects.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>No subjects or teachers found.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {subjects.map(subj => {
            const subjTeachers = bySubject[subj];
            const isExp = !!expanded[subj];
            const subjCourses = coursesBySubject[subj] || [];
            return (
              <div key={subj} className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                {/* Subject header */}
                <div onClick={() => toggle(subj)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: 'pointer', background: 'rgba(108,92,231,0.07)', borderBottom: isExp ? '1px solid var(--border-color)' : 'none', transition: 'background 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.3rem' }}>📚</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{subj}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {subjTeachers.length} teacher{subjTeachers.length !== 1 ? 's' : ''}
                        {subjCourses.length > 0 && ` · ${subjCourses.length} course${subjCourses.length !== 1 ? 's' : ''}`}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ padding: '3px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, background: subjTeachers.length > 1 ? 'rgba(0,206,201,0.15)' : 'rgba(108,92,231,0.15)', color: subjTeachers.length > 1 ? 'var(--accent-secondary)' : 'var(--accent-primary)' }}>
                      {subjTeachers.length > 1 ? `${subjTeachers.length} Teachers` : '1 Teacher'}
                    </span>
                    <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', display: 'inline-block', transition: 'transform 0.25s', transform: isExp ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                  </div>
                </div>

                {/* Teacher rows */}
                {isExp && (
                  <div>
                    {/* Courses row if any */}
                    {subjCourses.length > 0 && (
                      <div style={{ padding: '10px 20px', background: 'rgba(0,206,201,0.04)', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <span style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>Courses:</span>{' '}
                        {subjCourses.join(', ')}
                      </div>
                    )}
                    {/* Column headers */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1.8fr 1fr', padding: '8px 20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                      <span>Teacher Name</span><span>Teacher ID</span><span>Email</span><span>Login</span>
                    </div>
                    {subjTeachers.map((t, i) => (
                      <div key={t.name} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1.8fr 1fr', padding: '12px 20px', alignItems: 'center', borderBottom: i < subjTeachers.length - 1 ? '1px solid var(--border-color)' : 'none', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,92,231,0.05)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1rem' }}>👩‍🏫</span>
                          {t.first_name} {t.last_name || ''}
                        </div>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--accent-primary)' }}>{t.name}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.email || '—'}</div>
                        <div>{t.frappe_user
                          ? <span style={{ color: 'var(--accent-secondary)', fontSize: '0.82rem' }}>✓ Active</span>
                          : <span style={{ color: 'var(--accent-tertiary)', fontSize: '0.82rem' }}>No login</span>}
                        </div>
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

// ── Attendance (date-wise accordion) ───────────────────────────
const AttendanceList = () => {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [filterGrade, setFilterGrade] = useState('');

  const [addModal, setAddModal] = useState(false);
  const [addDate, setAddDate] = useState(new Date().toISOString().split('T')[0]);
  const [addClass, setAddClass] = useState('');
  const [bulkStatus, setBulkStatus] = useState({}); // { student_id: status }
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Update bulkStatus when addClass changes
  useEffect(() => {
    if (addClass) {
      const clsStuds = students.filter(s => (s.grade || '—') === addClass);
      const init = {};
      clsStuds.forEach(s => init[s.name] = 'Present');
      setBulkStatus(init);
    } else {
      setBulkStatus({});
    }
  }, [addClass, students]);

  const loadAttendance = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get('resource/School Attendance?fields=["name","date","student","status"]&limit_page_length=0&order_by=date desc'),
      api.get('resource/School Student?fields=["name","first_name","last_name","grade"]&limit_page_length=0')
    ]).then(([ar, sr]) => {
      const sm = {};
      const studs = sr.data.data || [];
      studs.forEach(s => {
        sm[s.name] = { full_name: `${s.first_name} ${s.last_name || ''}`.trim(), grade: s.grade || '—' };
      });
      setStudents(studs);
      const enriched = (ar.data.data || []).map(a => ({ ...a, student_info: sm[a.student] || { full_name: a.student, grade: '—' } }));
      setAttendance(enriched);

      const gradesAvail = [...new Set(enriched.map(a => a.student_info.grade))].filter(Boolean).sort();
      if (gradesAvail[0]) setExpanded(p => Object.keys(p).length === 0 ? { [gradesAvail[0]]: true } : p);

      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { loadAttendance(); }, [loadAttendance]);

  const handleBulkAdd = async () => {
    if (!addDate || !addClass) { setMsg('Please select date and class.'); return; }
    const studs = Object.keys(bulkStatus);
    if (studs.length === 0) { setMsg('No students in this class.'); return; }

    setSaving(true); setMsg('');
    try {
      await Promise.all(studs.map(sid =>
        api.post('resource/School Attendance', { date: addDate, student: sid, status: bulkStatus[sid] })
      ));
      setMsg('✅ Attendance recorded for class!');
      loadAttendance();
      setTimeout(() => { setAddModal(false); setMsg(''); setAddClass(''); }, 1000);
    } catch (e) {
      setMsg(`❌ Error recording attendance: ${e.message}`);
    } finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`resource/School Attendance/${id}`, { status });
      loadAttendance();
    } catch (e) {
      alert('Failed to update status.');
    }
  };

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

  const selectStyle = { padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'white', fontSize: '0.9rem' };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ marginBottom: '8px' }}>Attendance</h1>
          <p>Class-wise records · <strong style={{ color: 'var(--accent-primary)' }}>{activeGrades.length}</strong> class{activeGrades.length !== 1 ? 'es' : ''} · <strong style={{ color: 'var(--accent-primary)' }}>{filtered.length}</strong> entries</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Filter class:</span>
          <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} style={selectStyle}>
            <option value="">All Classes</option>
            {allGrades.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          {filterGrade && <Btn small variant="danger" onClick={() => setFilterGrade('')}>Clear</Btn>}
          <Btn id="add-attendance-btn" onClick={() => { setAddModal(true); setMsg(''); }}>+ Add Attendance</Btn>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading…</div>
      ) : activeGrades.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>No attendance records found.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {activeGrades.map(grade => {
            const isExp = !!expanded[grade];
            const dateGroups = byGradeDate[grade] || {};
            const dates = Object.keys(dateGroups).sort((a, b) => b.localeCompare(a));
            let totalPresent = 0, totalAbsent = 0;
            dates.forEach(d => {
              totalPresent += dateGroups[d].filter(r => r.status === 'Present').length;
              totalAbsent += dateGroups[d].filter(r => r.status === 'Absent').length;
            });

            return (
              <div key={grade} className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <div onClick={() => toggle(grade)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', cursor: 'pointer', background: 'rgba(108,92,231,0.07)', borderBottom: isExp ? '1px solid var(--border-color)' : 'none', transition: 'background 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.3rem' }}>🏫</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Class {grade}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{dates.length} date{dates.length !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, background: 'rgba(0,206,201,0.12)', color: 'var(--accent-secondary)' }}>✅ {totalPresent} Present</span>
                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, background: 'rgba(253,121,168,0.12)', color: 'var(--accent-tertiary)' }}>❌ {totalAbsent} Absent</span>
                    <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', display: 'inline-block', transition: 'transform 0.25s', transform: isExp ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                  </div>
                </div>
                {isExp && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {dates.map((date, di) => (
                      <div key={date} style={{ borderBottom: di < dates.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                        <div style={{ background: 'rgba(0,206,201,0.04)', padding: '8px 20px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>
                          📅 {date}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.5fr 100px', padding: '8px 20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                          <span>Student Name</span><span>Student ID</span><span style={{ textAlign: 'center' }}>Status</span>
                        </div>
                        {dateGroups[date].map((r, i) => (
                          <div key={r.name} style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.5fr 100px', padding: '11px 20px', alignItems: 'center', borderBottom: i < dateGroups[date].length - 1 ? '1px solid var(--border-color)' : 'none', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,92,231,0.05)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{r.student_info.full_name}</div>
                            <div style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--accent-primary)' }}>{r.student}</div>
                            <div style={{ textAlign: 'center' }}>
                              <select
                                value={r.status}
                                onChange={e => updateStatus(r.name, e.target.value)}
                                style={{ padding: '2px 8px', borderRadius: '8px', border: '1px solid var(--border-color)', background: `${statusColor[r.status] || 'gray'}22`, color: statusColor[r.status] || 'gray', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                              >
                                <option value="Present">Present</option>
                                <option value="Absent">Absent</option>
                                <option value="Late">Late</option>
                              </select>
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

      {addModal && (
        <Modal title="Mark Bulk Attendance" onClose={() => setAddModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="Date">
                <Input type="date" value={addDate} onChange={setAddDate} />
              </Field>
              <Field label="Class">
                <select value={addClass} onChange={e => setAddClass(e.target.value)} style={selectStyle}>
                  <option value="">Select a class…</option>
                  {allGrades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </Field>
            </div>

            {addClass && (
              <div style={{ overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-secondary)' }}>
                <div style={{ padding: '8px 12px', background: 'rgba(108,92,231,0.1)', borderBottom: '1px solid var(--border-color)', fontWeight: 600, fontSize: '0.85rem' }}>
                  Students in Class {addClass} ({Object.keys(bulkStatus).length})
                </div>
                {Object.keys(bulkStatus).length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No students in this class.</div>
                ) : (
                  Object.keys(bulkStatus).map((sid, i) => {
                    const s = students.find(x => x.name === sid);
                    return (
                      <div key={sid} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderBottom: i < Object.keys(bulkStatus).length - 1 ? '1px solid var(--border-color)' : 'none', background: 'var(--bg-primary)' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s?.first_name} {s?.last_name || ''}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{sid}</div>
                        </div>
                        <select
                          value={bulkStatus[sid]}
                          onChange={e => setBulkStatus(p => ({ ...p, [sid]: e.target.value }))}
                          style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: `${statusColor[bulkStatus[sid]]}22`, color: statusColor[bulkStatus[sid]], fontSize: '0.8rem', fontWeight: 600 }}
                        >
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                          <option value="Late">Late</option>
                        </select>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {msg && <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(108,92,231,0.1)', fontSize: '0.9rem' }}>{msg}</div>}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <Btn variant="danger" onClick={() => setAddModal(false)}>Cancel</Btn>
              <Btn onClick={handleBulkAdd} disabled={saving || !addClass || Object.keys(bulkStatus).length === 0} id="confirm-add-attendance">{saving ? 'Saving…' : 'Save Class Attendance'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── Main Admin App ─────────────────────────────────────────────
export const AdminApp = ({ userInfo, onLogout }) => {
  const [tab, setTab] = useState('dashboard');
  const current = adminNav.find(n => n.id === tab);

  const renderContent = () => {
    switch (tab) {
      case 'dashboard': return <Dashboard />;
      case 'students': return <StudentsList />;
      case 'teachers': return <TeachersList />;
      case 'users': return <UserCredentials />;
      case 'marks': return <MarksManager />;
      case 'academics': return <AcademicsList />;
      case 'attendance': return <AttendanceList />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout title={current?.label || 'Dashboard'} subtitle="Administrator" icon="⚙️" onLogout={onLogout} nameDisplay="Administrator" role="Admin"
      sidebar={adminNav.map(n => <NavItem key={n.id} {...n} active={tab === n.id} onClick={setTab} />)}>
      {renderContent()}
    </Layout>
  );
};
