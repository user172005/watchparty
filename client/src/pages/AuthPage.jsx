import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/Logo';

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
      <Starfield />
      <div style={styles.glow} />

      <div style={styles.card} className="fade-in">
        <div style={styles.logoWrap}>
          <Logo size="md" showName={true} />
        </div>
        <p style={styles.tagline}>Watch together, anywhere.</p>

        <div style={styles.tabs}>
          {['login', 'signup'].map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              style={{ ...styles.tab, ...(mode === m ? styles.tabActive : {}) }}>
              {m === 'login' ? 'LOG IN' : 'SIGN UP'}
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
            {loading ? <span style={styles.spinner} /> : (mode === 'login' ? 'ENTER →' : 'CREATE ACCOUNT →')}
          </button>
        </form>
      </div>
    </div>
  );
}

function Starfield() {
  const stars = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 2 + 1,
    delay: `${Math.random() * 4}s`,
    duration: `${2 + Math.random() * 3}s`,
  }));
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {stars.map(s => (
        <div key={s.id} style={{
          position: 'absolute', top: s.top, left: s.left,
          width: s.size, height: s.size,
          borderRadius: '50%', background: '#5de8b8',
          animation: `twinkle ${s.duration} ease-in-out infinite`,
          animationDelay: s.delay, opacity: 0.5,
        }} />
      ))}
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070e14', position: 'relative', overflow: 'hidden' },
  glow: { position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(93,232,184,0.10) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' },
  card: { background: 'rgba(13,34,51,0.75)', border: '1px solid rgba(60,180,130,0.25)', borderRadius: 18, padding: '40px 40px 36px', width: '100%', maxWidth: 420, position: 'relative', zIndex: 1, backdropFilter: 'blur(8px)' },
  logoWrap: { marginBottom: 10 },
  tagline: { color: 'var(--text3)', fontSize: 13, marginBottom: 28, letterSpacing: 1, fontWeight: 300 },
  tabs: { display: 'flex', gap: 4, background: 'rgba(10,30,22,0.6)', borderRadius: 10, padding: 4, marginBottom: 28, border: '1px solid var(--border)' },
  tab: { flex: 1, padding: '8px 0', borderRadius: 8, background: 'transparent', color: 'var(--text3)', fontSize: 12, fontWeight: 500, fontFamily: "'Cinzel', serif", letterSpacing: 2 },
  tabActive: { background: 'rgba(93,232,184,0.15)', color: 'var(--accent)', border: '1px solid rgba(93,232,184,0.3)' },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 11, color: 'var(--text3)', fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'Cinzel', serif" },
  input: { background: 'rgba(15,45,34,0.7)', border: '1px solid var(--border)', borderRadius: 9, padding: '11px 14px', color: 'var(--text)', fontSize: 15, transition: 'border-color 0.15s' },
  error: { background: 'rgba(255,85,101,0.1)', border: '1px solid rgba(255,85,101,0.3)', borderRadius: 8, padding: '10px 14px', color: 'var(--red)', fontSize: 13 },
  btn: { background: 'rgba(93,232,184,0.2)', border: '1px solid rgba(93,232,184,0.5)', color: 'var(--accent)', padding: '13px', borderRadius: 10, fontSize: 13, fontWeight: 700, fontFamily: "'Cinzel', serif", letterSpacing: 2, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  spinner: { width: 18, height: 18, border: '2px solid rgba(93,232,184,0.3)', borderTop: '2px solid #5de8b8', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' },
};
