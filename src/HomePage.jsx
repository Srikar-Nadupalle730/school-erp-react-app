import React, { useState, useEffect } from 'react';



/* ─── Floating Particle Background ─── */
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 10,
    opacity: Math.random() * 0.3 + 0.05,
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: p.id % 3 === 0 ? 'var(--accent-primary)' : p.id % 3 === 1 ? 'var(--accent-secondary)' : 'var(--accent-tertiary)',
            opacity: p.opacity,
            left: `${p.x}%`,
            top: `${p.y}%`,
            animation: `floatParticle ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
};

/* ─── Feature Card ─── */
const FeatureCard = ({ icon, title, description, delay }) => (
  <div
    className="glass-panel homepage-feature-card"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="homepage-feature-icon">{icon}</div>
    <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>{title}</h3>
    <p style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>{description}</p>
  </div>
);


/* ─── Nav Bar ─── */
const NavBar = ({ onLoginClick }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`homepage-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="homepage-navbar-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="homepage-nav-logo">S</div>
          <span style={{ fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.5px' }}>SchoolERP</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a href="#features" className="homepage-nav-link">Features</a>
          <a href="#about" className="homepage-nav-link">About</a>
          <button id="homepage-signin-btn" onClick={onLoginClick} className="homepage-nav-cta">
            Sign In →
          </button>
        </div>
      </div>
    </nav>
  );
};

/* ─── Main Homepage Component ─── */
export const HomePage = ({ onLoginClick }) => {
  return (
    <div className="homepage-root">
      <style>{`
        /* ─── Animations ─── */
        @keyframes floatParticle {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(30px, -40px) scale(1.4); }
        }
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInCard {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(108, 92, 231, 0.4); }
          50%      { box-shadow: 0 0 40px rgba(108, 92, 231, 0.7); }
        }
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0); }
          33%      { transform: translate(25px, -30px); }
          66%      { transform: translate(-15px, 20px); }
        }

        /* ─── Root ─── */
        .homepage-root {
          min-height: 100vh;
          background: var(--bg-primary);
          overflow-x: hidden;
          position: relative;
        }

        /* ─── Navbar ─── */
        .homepage-navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          padding: 16px 0;
          transition: all 0.35s ease;
        }
        .homepage-navbar.scrolled {
          background: rgba(15, 17, 26, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-color);
          padding: 10px 0;
        }
        .homepage-navbar-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .homepage-nav-logo {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 1rem;
        }
        .homepage-nav-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          transition: color 0.2s ease;
        }
        .homepage-nav-link:hover {
          color: var(--text-primary);
        }
        .homepage-nav-cta {
          padding: 10px 24px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: white;
          border: none;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.9rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .homepage-nav-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(108, 92, 231, 0.4);
        }

        /* ─── Hero ─── */
        .homepage-hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          position: relative;
          padding: 120px 40px 80px;
        }
        .homepage-hero-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .homepage-hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: orbFloat 12s ease-in-out infinite;
        }
        .homepage-hero-content {
          position: relative;
          z-index: 2;
          max-width: 800px;
          animation: heroFadeUp 0.8s ease-out;
        }
        .homepage-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          border-radius: 100px;
          background: rgba(108, 92, 231, 0.1);
          border: 1px solid rgba(108, 92, 231, 0.25);
          color: var(--accent-primary);
          font-size: 0.85rem;
          font-weight: 500;
          margin-bottom: 32px;
        }
        .homepage-hero h1 {
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: 800;
          line-height: 1.15;
          margin-bottom: 24px;
          letter-spacing: -1.5px;
        }
        .homepage-hero h1 .gradient-text {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary), var(--accent-tertiary));
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 4s ease infinite;
        }
        .homepage-hero p {
          font-size: 1.15rem;
          line-height: 1.8;
          max-width: 600px;
          margin: 0 auto 40px;
        }
        .homepage-hero-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .homepage-hero-primary {
          padding: 16px 36px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: white;
          border: none;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          animation: pulseGlow 3s ease-in-out infinite;
        }
        .homepage-hero-primary:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 12px 30px rgba(108, 92, 231, 0.5);
        }
        .homepage-hero-secondary {
          padding: 16px 36px;
          border-radius: 12px;
          background: transparent;
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        .homepage-hero-secondary:hover {
          border-color: var(--accent-primary);
          background: rgba(108, 92, 231, 0.05);
          transform: translateY(-2px);
        }

        /* ─── Features ─── */
        .homepage-features {
          padding: 100px 40px;
          position: relative;
        }
        .homepage-features-inner {
          max-width: 1200px;
          margin: 0 auto;
        }
        .homepage-section-header {
          text-align: center;
          margin-bottom: 64px;
        }
        .homepage-section-header h2 {
          font-size: 2.2rem;
          font-weight: 800;
          margin-bottom: 16px;
          letter-spacing: -0.8px;
        }
        .homepage-section-header p {
          max-width: 500px;
          margin: 0 auto;
          font-size: 1rem;
          line-height: 1.7;
        }
        .homepage-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }
        .homepage-feature-card {
          padding: 32px;
          transition: all 0.35s ease;
          animation: slideInCard 0.6s ease-out both;
          cursor: default;
        }
        .homepage-feature-card:hover {
          transform: translateY(-6px);
          border-color: var(--accent-primary);
          box-shadow: 0 15px 40px rgba(108, 92, 231, 0.15);
        }
        .homepage-feature-icon {
          width: 52px; height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
          margin-bottom: 20px;
          background: linear-gradient(135deg, rgba(108, 92, 231, 0.15), rgba(0, 206, 201, 0.1));
        }



        /* ─── About ─── */
        .homepage-about {
          padding: 100px 40px;
          position: relative;
        }
        .homepage-about-inner {
          max-width: 900px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
        }
        .homepage-about-graphic {
          aspect-ratio: 1;
          border-radius: 24px;
          background: linear-gradient(135deg, rgba(108, 92, 231, 0.1), rgba(0, 206, 201, 0.08));
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .homepage-about-graphic::before {
          content: '';
          position: absolute;
          width: 120%;
          height: 120%;
          background: conic-gradient(from 0deg, transparent, rgba(108, 92, 231, 0.08), transparent, rgba(0, 206, 201, 0.08), transparent);
          animation: spin 15s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .homepage-about-icon-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .homepage-about-icon-item {
          width: 64px; height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
        }
        .homepage-about-text h2 {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 20px;
          letter-spacing: -0.5px;
        }
        .homepage-about-text p {
          font-size: 0.95rem;
          line-height: 1.8;
          margin-bottom: 16px;
        }

        /* ─── CTA ─── */
        .homepage-cta {
          padding: 100px 40px;
          text-align: center;
          position: relative;
        }
        .homepage-cta-inner {
          max-width: 700px;
          margin: 0 auto;
          padding: 64px;
          border-radius: 24px;
          background: linear-gradient(135deg, rgba(108, 92, 231, 0.08), rgba(0, 206, 201, 0.05));
          border: 1px solid rgba(108, 92, 231, 0.15);
          position: relative;
          overflow: hidden;
        }
        .homepage-cta-inner::before {
          content: '';
          position: absolute;
          top: -50%; left: -50%;
          width: 200%; height: 200%;
          background: radial-gradient(circle at 30% 70%, rgba(108, 92, 231, 0.04), transparent 60%);
          pointer-events: none;
        }
        .homepage-cta h2 {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 16px;
          letter-spacing: -0.5px;
          position: relative;
          z-index: 1;
        }
        .homepage-cta p {
          margin-bottom: 32px;
          font-size: 1rem;
          line-height: 1.7;
          position: relative;
          z-index: 1;
        }

        /* ─── Footer ─── */
        .homepage-footer {
          padding: 40px;
          text-align: center;
          border-top: 1px solid var(--border-color);
        }
        .homepage-footer p {
          font-size: 0.85rem;
        }

        /* ─── Responsive ─── */
        @media (max-width: 768px) {
          .homepage-navbar-inner { padding: 0 20px; }
          .homepage-nav-link { display: none; }
          .homepage-hero { padding: 100px 20px 60px; }
          .homepage-hero h1 { font-size: 2.2rem; }
          .homepage-features { padding: 60px 20px; }

          .homepage-about { padding: 60px 20px; }
          .homepage-about-inner { grid-template-columns: 1fr; }
          .homepage-cta { padding: 60px 20px; }
          .homepage-cta-inner { padding: 40px 24px; }
          .homepage-hero-actions { flex-direction: column; align-items: center; }
        }
      `}</style>

      <NavBar onLoginClick={onLoginClick} />
      <FloatingParticles />

      {/* ── HERO ── */}
      <section className="homepage-hero">
        <div className="homepage-hero-bg">
          <div className="homepage-hero-orb" style={{ width: 500, height: 500, top: '-15%', left: '-10%', background: 'rgba(108, 92, 231, 0.08)' }} />
          <div className="homepage-hero-orb" style={{ width: 400, height: 400, bottom: '-10%', right: '-5%', background: 'rgba(0, 206, 201, 0.06)', animationDelay: '4s' }} />
          <div className="homepage-hero-orb" style={{ width: 300, height: 300, top: '40%', right: '20%', background: 'rgba(253, 121, 168, 0.04)', animationDelay: '8s' }} />
        </div>
        <div className="homepage-hero-content">
          <div className="homepage-hero-badge">
            ✨ Modern School Management
          </div>
          <h1>
            Simplify Your<br />
            <span className="gradient-text">School Operations</span>
          </h1>
          <p>
            A comprehensive ERP suite designed for schools — manage students, teachers,
            courses, attendance, and academic performance all in one place.
          </p>
          <div className="homepage-hero-actions">
            <button id="homepage-get-started-btn" className="homepage-hero-primary" onClick={onLoginClick}>
              Get Started
            </button>
            <a href="#features" style={{ textDecoration: 'none' }}>
              <button className="homepage-hero-secondary">
                Explore Features ↓
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="homepage-features">
        <div className="homepage-features-inner">
          <div className="homepage-section-header">
            <h2>Everything You Need</h2>
            <p>Powerful tools built for modern school administration</p>
          </div>
          <div className="homepage-features-grid">
            <FeatureCard
              icon="🎓"
              title="Student Management"
              description="Maintain complete student profiles, class rosters, and enrollment records with an intuitive directory."
              delay={100}
            />
            <FeatureCard
              icon="👩‍🏫"
              title="Teacher Dashboard"
              description="Empower teachers with quick access to their classes, student lists, and grade management tools."
              delay={200}
            />
            <FeatureCard
              icon="📊"
              title="Marks & Grades"
              description="Record, track, and analyze academic performance across subjects, classes, and exam periods."
              delay={300}
            />
            <FeatureCard
              icon="📋"
              title="Attendance Tracking"
              description="Digital attendance with date-wise reports."
              delay={400}
            />
            <FeatureCard
              icon="📚"
              title="Course Management"
              description="Organize subjects, assign teachers, and manage the academic curriculum effortlessly."
              delay={500}
            />
            <FeatureCard
              icon="🔐"
              title="Role-Based Access"
              description="Secure login for admins, teachers, and students — each with their own tailored dashboard."
              delay={600}
            />
          </div>
        </div>
      </section>



      {/* ── ABOUT ── */}
      <section id="about" className="homepage-about">
        <div className="homepage-about-inner">
          <div className="homepage-about-graphic">
            <div className="homepage-about-icon-grid">
              <div className="homepage-about-icon-item">🏫</div>
              <div className="homepage-about-icon-item">📝</div>
              <div className="homepage-about-icon-item">📈</div>
              <div className="homepage-about-icon-item">🤝</div>
            </div>
          </div>
          <div className="homepage-about-text">
            <h2>Why SchoolERP?</h2>
            <p>
              Traditional school management is tedious, paper-heavy, and error-prone.
              SchoolERP replaces spreadsheets and registers with a sleek digital platform.
            </p>
            <p>
              Built with a modern React frontend and a robust Frappe backend, the system
              is fast, secure, and ready to scale with your institution. Contact for more custom features as per your requirements.
            </p>
            <p style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>
              ✓ Open source &nbsp; ✓ Self-hosted &nbsp; ✓ API-first
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="homepage-cta">
        <div className="homepage-cta-inner glass-panel">
          <h2>Ready to Get Started?</h2>
          <p>Sign in to access your personalized dashboard — Admin, Teacher, or Student.</p>
          <button id="homepage-cta-signin-btn" className="homepage-hero-primary" onClick={onLoginClick}>
            Sign In to Dashboard →
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="homepage-footer">
        <p>&copy; {new Date().getFullYear()} SchoolERP Suite. Built by Srikar Nadupalle. All rights reserved.</p>
      </footer>
    </div>
  );
};
