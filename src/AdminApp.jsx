import React, { useEffect, useState } from 'react';
import { callApi, getApi } from './api.js';

export function AdminApp({ userInfo, onLogout }) {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);

  const [teacherForm, setTeacherForm] = useState({
    teacher_name: '',
    email: '',
    phone: '',
  });

  const [studentForm, setStudentForm] = useState({
    student_name: '',
    email: '',
    phone: '',
  });

  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const teachersData = await getApi(
        'resource/Teacher'
      );

      const studentsData = await getApi(
        'resource/Student'
      );

      setTeachers(teachersData.data || []);
      setStudents(studentsData.data || []);
    } catch (err) {
      console.error(err);

      setTeachers([]);
      setStudents([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddTeacher = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await callApi('school_erp.api.add_teacher', {
        teacher_name: teacherForm.teacher_name,
        email: teacherForm.email,
        phone: teacherForm.phone,
      });

      alert('Teacher added successfully');

      setTeacherForm({
        teacher_name: '',
        email: '',
        phone: '',
      });

      await loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to add teacher');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await callApi('school_erp.api.add_student', {
        student_name: studentForm.student_name,
        email: studentForm.email,
        phone: studentForm.phone,
      });

      alert('Student added successfully');

      setStudentForm({
        student_name: '',
        email: '',
        phone: '',
      });

      await loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    background: '#ffffff',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginBottom: '24px',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    marginBottom: '12px',
    fontSize: '14px',
  };

  const buttonStyle = {
    padding: '12px 18px',
    borderRadius: '8px',
    border: 'none',
    background: '#4f46e5',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f7fb',
        padding: '30px',
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              color: '#111827',
            }}
          >
            Admin Dashboard
          </h1>

          <p
            style={{
              marginTop: '6px',
              color: '#6b7280',
            }}
          >
            Welcome {userInfo?.user}
          </p>
        </div>

        <button
          onClick={onLogout}
          style={{
            ...buttonStyle,
            background: '#ef4444',
          }}
        >
          Logout
        </button>
      </div>

      {/* FORMS */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit,minmax(320px,1fr))',
          gap: '24px',
          marginBottom: '30px',
        }}
      >
        {/* TEACHER FORM */}

        <div style={cardStyle}>
          <h2>Add Teacher</h2>

          <form onSubmit={handleAddTeacher}>
            <input
              type="text"
              placeholder="Teacher Name"
              value={teacherForm.teacher_name}
              onChange={(e) =>
                setTeacherForm({
                  ...teacherForm,
                  teacher_name: e.target.value,
                })
              }
              style={inputStyle}
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={teacherForm.email}
              onChange={(e) =>
                setTeacherForm({
                  ...teacherForm,
                  email: e.target.value,
                })
              }
              style={inputStyle}
              required
            />

            <input
              type="text"
              placeholder="Phone"
              value={teacherForm.phone}
              onChange={(e) =>
                setTeacherForm({
                  ...teacherForm,
                  phone: e.target.value,
                })
              }
              style={inputStyle}
            />

            <button
              type="submit"
              style={buttonStyle}
              disabled={loading}
            >
              {loading
                ? 'Adding...'
                : 'Add Teacher'}
            </button>
          </form>
        </div>

        {/* STUDENT FORM */}

        <div style={cardStyle}>
          <h2>Add Student</h2>

          <form onSubmit={handleAddStudent}>
            <input
              type="text"
              placeholder="Student Name"
              value={studentForm.student_name}
              onChange={(e) =>
                setStudentForm({
                  ...studentForm,
                  student_name: e.target.value,
                })
              }
              style={inputStyle}
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={studentForm.email}
              onChange={(e) =>
                setStudentForm({
                  ...studentForm,
                  email: e.target.value,
                })
              }
              style={inputStyle}
              required
            />

            <input
              type="text"
              placeholder="Phone"
              value={studentForm.phone}
              onChange={(e) =>
                setStudentForm({
                  ...studentForm,
                  phone: e.target.value,
                })
              }
              style={inputStyle}
            />

            <button
              type="submit"
              style={buttonStyle}
              disabled={loading}
            >
              {loading
                ? 'Adding...'
                : 'Add Student'}
            </button>
          </form>
        </div>
      </div>

      {/* DATA TABLES */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit,minmax(320px,1fr))',
          gap: '24px',
        }}
      >
        {/* TEACHERS */}

        <div style={cardStyle}>
          <h2>Teachers</h2>

          {(teachers || []).length === 0 ? (
            <p>No teachers found</p>
          ) : (
            (teachers || []).map((teacher) => (
              <div
                key={teacher.name}
                style={{
                  padding: '12px',
                  borderBottom:
                    '1px solid #e5e7eb',
                }}
              >
                <strong>
                  {teacher.teacher_name}
                </strong>

                <div>{teacher.email}</div>
              </div>
            ))
          )}
        </div>

        {/* STUDENTS */}

        <div style={cardStyle}>
          <h2>Students</h2>

          {(students || []).length === 0 ? (
            <p>No students found</p>
          ) : (
            (students || []).map((student) => (
              <div
                key={student.name}
                style={{
                  padding: '12px',
                  borderBottom:
                    '1px solid #e5e7eb',
                }}
              >
                <strong>
                  {student.student_name}
                </strong>

                <div>{student.email}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
