import React, { useState, useEffect } from 'react';
import { AdminApp } from './AdminApp.jsx';
import { TeacherApp } from './TeacherApp.jsx';
import { StudentApp } from './StudentApp.jsx';
import { HomePage } from './HomePage.jsx';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // TEMPORARY AUTH FOR API TOKEN TESTING
  // Since API token already authenticates backend requests,
  // we bypass cookie/session login completely.

  const loadUserInfo = async () => {
    try {
      // TEMPORARY STATIC ADMIN USER
      // Replace later with proper role API if needed
      setUserInfo({
        role: 'admin',
        user: 'Administrator',
      });

      setIsAuthenticated(true);
    } catch (err) {
      console.error(err);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserInfo();
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserInfo(null);
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          color: 'var(--text-secondary)',
        }}
      >
        Loading...
      </div>
    );
  }

  // OPTIONAL:
  // Show homepage if not authenticated
  if (!isAuthenticated) {
    return (
      <HomePage
        onLoginClick={() => {
          setIsAuthenticated(true);
          setUserInfo({
            role: 'admin',
            user: 'Administrator',
          });
        }}
      />
    );
  }

  const role = userInfo?.role;

  if (role === 'admin') {
    return (
      <AdminApp
        userInfo={userInfo}
        onLogout={handleLogout}
      />
    );
  }

  if (role === 'teacher') {
    return (
      <TeacherApp
        userInfo={userInfo}
        onLogout={handleLogout}
      />
    );
  }

  if (role === 'student') {
    return (
      <StudentApp
        userInfo={userInfo}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
        background: 'var(--bg-primary)',
      }}
    >
      <h2>Access Restricted</h2>

      <p>
        Your account has no assigned role.
      </p>

      <button
        onClick={handleLogout}
        style={{
          padding: '10px 24px',
          borderRadius: '8px',
          background: 'var(--accent-primary)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default App;
