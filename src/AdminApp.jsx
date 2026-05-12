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

  // LOAD DATA
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

  // ADD TEACHER
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

  // ADD STUDENT
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

  return (
    <div style={{ padding: '30px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '30px',
        }}
      >
        <div>
          <h1>Admin Dashboard</h1>

          <p>
            Welcome {userInfo?.user}
          </p>
        </div>

        <button onClick={onLogout}>
          Logout
        </button>
      </div>

      {/* ADD TEACHER */}

      <div
        style={{
          marginBottom: '40px',
          border: '1px solid #ccc',
          padding: '20px',
          borderRadius: '10px',
        }}
      >
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
            required
          />

          <br />
          <br />

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
            required
          />

          <br />
          <br />

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
          />

          <br />
          <br />

          <button type="submit" disabled={loading}>
            {loading
              ? 'Adding...'
              : 'Add Teacher'}
          </button>
        </form>
      </div>

      {/* ADD STUDENT */}

      <div
        style={{
          marginBottom: '40px',
          border: '1px solid #ccc',
          padding: '20px',
          borderRadius: '10px',
        }}
      >
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
            required
          />

          <br />
          <br />

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
            required
          />

          <br />
          <br />

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
          />

          <br />
          <br />

          <button type="submit" disabled={loading}>
            {loading
              ? 'Adding...'
              : 'Add Student'}
          </button>
        </form>
      </div>

      {/* TEACHERS */}

      <div style={{ marginBottom: '40px' }}>
        <h2>Teachers</h2>

        {(teachers || []).length === 0 ? (
          <p>No teachers found</p>
        ) : (
          (teachers || []).map((teacher) => (
            <div
              key={teacher.name}
              style={{
                border: '1px solid #ddd',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '8px',
              }}
            >
              <strong>
                {teacher.teacher_name}
              </strong>

              <br />

              {teacher.email}
            </div>
          ))
        )}
      </div>

      {/* STUDENTS */}

      <div>
        <h2>Students</h2>

        {(students || []).length === 0 ? (
          <p>No students found</p>
        ) : (
          (students || []).map((student) => (
            <div
              key={student.name}
              style={{
                border: '1px solid #ddd',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '8px',
              }}
            >
              <strong>
                {student.student_name}
              </strong>

              <br />

              {student.email}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
