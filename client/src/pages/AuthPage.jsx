import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { authLogin } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = mode === 'login' ? await login(username, password) : await signup(username, password);
      authLogin(data);
      navigate('/lobby');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.glow} />
      <div style={styles.card} className="fade-in">
        <div style={styles.logo}>
          <span style={styles.logoIcon}>◈</span>
          <span style={styles.logoText} className="mono">WATCHPARTY</span>
        </div>
        <p style={styles.tagline}>Watch together, anywhere.</p>

        <div style={styles.tabs}>
          {['login', 'signup'].map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(''); }} style={{ ...styles.tab, ...(mode === m ? styles.tabActive : {}) }}>
              {m === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input style={styles.input} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="your_username" autoFocus />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={{ ...styles.btn, ...(loading ? styles.btnDisabled : {}) }} disabled={loading}>
            {loading ? <span style={styles.spinner} /> : (mode === 'login' ? 'Enter →' : 'Create Account →')}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', position: 'relative', overflow: 'hidden' },
  glow: { position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' },
  card: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: '40px 40px 36px', width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 },
  logo: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  logoIcon: { fontSize: 28, color: 'var(--accent)' },
  logoText: { fontSize: 18, fontWeight: 700, letterSpacing: 3, color: 'var(--text)' },
  tagline: { color: 'var(--text3)', fontSize: 14, marginBottom: 32 },
  tabs: { display: 'flex', gap: 4, background: 'var(--bg3)', borderRadius: 8, padding: 4, marginBottom: 28 },
  tab: { flex: 1, padding: '8px 0', borderRadius: 6, background: 'transparent', color: 'var(--text2)', fontSize: 14, fontWeight: 500 },
  tabActive: { background: 'var(--bg4)', color: 'var(--text)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 12, color: 'var(--text2)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' },
  input: { background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '11px 14px', color: 'var(--text)', fontSize: 15, transition: 'border-color 0.15s' },
  error: { background: 'rgba(255,85,101,0.1)', border: '1px solid rgba(255,85,101,0.3)', borderRadius: 8, padding: '10px 14px', color: 'var(--red)', fontSize: 13 },
  btn: { background: 'var(--accent)', color: '#fff', padding: '13px', borderRadius: 9, fontSize: 15, fontWeight: 600, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { opacity: 0.6, cursor: 'not-allowed' },
  spinner: { width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' },
};
