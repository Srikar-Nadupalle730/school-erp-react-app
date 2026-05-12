import React, { useState, useEffect } from 'react';
import { api } from './api.js';
import { AdminApp } from './AdminApp.jsx';
import { TeacherApp } from './TeacherApp.jsx';
import { StudentApp } from './StudentApp.jsx';
import { HomePage } from './HomePage.jsx';
import './App.css';

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
      // TEMPORARY FRONTEND LOGIN
      // Real session auth disabled for now
      if (
        usr === 'Administrator' &&
        pwd.length > 0
      ) {
        onLogin({
          role: 'admin',
          user: 'Administrator',
        });
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}
    >
      <div
        className="glass-panel"
        style={{
          padding: '48px',
          width: '420px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h2>School ERP Suite</h2>
          <p>Sign in to continue</p>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(253,121,168,0.1)',
              border: '1px solid red',
              borderRadius: '8px',
              padding: '12px',
              color: 'red',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleLogin}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <input
            type="text"
            placeholder="Username"
            value={usr}
            onChange={(e) => setUsr(e.target.value)}
            style={{
              padding: '12px',
              borderRadius: '8px',
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            style={{
              padding: '12px',
              borderRadius: '8px',
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px',
              borderRadius: '8px',
              background: '#4f46e5',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#4f46e5',
          }}
        >
          ← Back
        </button>
      </div>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  const [userInfo, setUserInfo] = useState(null);

  const [loading, setLoading] = useState(true);

  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    // NO AUTO LOGIN
    setLoading(false);
  }, []);

  const handleLogin = (user) => {
    setUserInfo(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserInfo(null);
    setShowLogin(false);
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showLogin) {
      return (
        <Login
          onLogin={handleLogin}
          onBack={() => setShowLogin(false)}
        />
      );
    }

    return (
      <HomePage
        onLoginClick={() => setShowLogin(true)}
      />
    );
  }

  const role = userInfo?.role;

  try {
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
  } catch (err) {
    console.error(err);

    return (
      <div
        style={{
          padding: '40px',
          color: 'red',
        }}
      >
        Error loading dashboard.
        Check browser console for details.
      </div>
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
      }}
    >
      <h2>Access Restricted</h2>

      <button
        onClick={handleLogout}
        style={{
          padding: '10px 24px',
          borderRadius: '8px',
          background: '#4f46e5',
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
