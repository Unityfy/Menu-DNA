import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';

export default function AuthPage() {
  const [mode,     setMode]     = useState('login'); // 'login' | 'register'
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');
  const [restaurant, setRestaurant] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const toast    = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, name, restaurant);
      }
      toast('Welcome to Menu DNA', 'success');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.code === 'auth/wrong-password'   ? 'Invalid credentials.' :
                  err.code === 'auth/user-not-found'   ? 'Account not found.' :
                  err.code === 'auth/email-already-in-use' ? 'Email already registered.' :
                  err.code === 'auth/weak-password'    ? 'Password must be 6+ characters.' :
                  'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Form Panel */}
      <div className="auth-panel">
        <div style={{ marginBottom: 'var(--sp-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--sp-5)' }}>
            <div style={{
              width: 32, height: 32,
              background: 'var(--text-primary)',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="5" height="5" fill="#0a0a0a" />
                <rect x="9" y="2" width="5" height="5" fill="#0a0a0a" />
                <rect x="2" y="9" width="5" height="5" fill="#0a0a0a" opacity="0.6" />
                <rect x="9" y="9" width="5" height="5" fill="#0a0a0a" opacity="0.3" />
              </svg>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>Menu DNA</span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            marginBottom: 8,
          }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {mode === 'login'
              ? 'Sign in to your restaurant intelligence dashboard.'
              : 'Start optimizing your menu with data-driven insights.'}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <div className="form-group">
                <label className="form-label">Your name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Jane Smith"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Restaurant name</label>
                <input
                  type="text"
                  value={restaurant}
                  onChange={e => setRestaurant(e.target.value)}
                  placeholder="The Spice Garden"
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@restaurant.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••'}
              required
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            />
          </div>

          {error && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(212,165,116,0.08)',
              border: '1px solid rgba(212,165,116,0.2)',
              borderRadius: 'var(--radius-md)',
              fontSize: 12,
              color: 'var(--accent-warn)',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ justifyContent: 'center', marginTop: 'var(--sp-1)', height: 44 }}
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="divider" style={{ margin: 'var(--sp-4) 0 var(--sp-3)' }} />

        <p className="auth-switch">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); }}>
            {mode === 'login' ? 'Sign up free' : 'Sign in'}
          </span>
        </p>
      </div>

      {/* Visual Panel */}
      <div className="auth-visual">
        <div className="auth-grid" />
        <div className="auth-visual-content animate-fade-in">
          <div className="auth-tagline">
            Turn your menu<br />
            <span className="muted">into a</span><br />
            machine.
          </div>
          <p style={{
            fontSize: 14,
            color: 'var(--text-muted)',
            maxWidth: 320,
            margin: '0 auto',
            lineHeight: 1.7,
          }}>
            POS-integrated intelligence that tells you exactly what to keep,
            kill, reprice, and promote — every week.
          </p>

          {/* Mini metric preview */}
          <div style={{
            display: 'flex',
            gap: 'var(--sp-2)',
            marginTop: 'var(--sp-5)',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            {[
              { label: 'Stars',      color: 'var(--star)',      count: '4' },
              { label: 'Plowhorses', color: 'var(--plowhorse)', count: '3' },
              { label: 'Puzzles',    color: 'var(--puzzle)',    count: '2' },
              { label: 'Dogs',       color: 'var(--dog)',       count: '6' },
            ].map(({ label, color, count }) => (
              <div key={label} style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 20px',
                textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 24,
                  fontWeight: 700,
                  color,
                }}>{count}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
