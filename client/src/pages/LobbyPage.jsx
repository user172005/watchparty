import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom, validateRoom } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function LobbyPage() {
  const { user, authLogout } = useAuth();
  const navigate = useNavigate();

  const [createCode, setCreateCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    if (!createCode.trim()) return;
    setCreateLoading(true);
    try {
      await createRoom(createCode.trim().toUpperCase());
      navigate(`/room/${createCode.trim().toUpperCase()}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create room');
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleJoin(e) {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setJoinLoading(true);
    try {
      await validateRoom(joinCode.trim().toUpperCase());
      navigate(`/room/${joinCode.trim().toUpperCase()}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Room not found');
    } finally {
      setJoinLoading(false);
    }
  }

  return (
    <div style={s.page}>
      <div style={s.glow} />

      <header style={s.header}>
        <div style={s.logo}>
          <span style={s.logoIcon}>◈</span>
          <span style={s.logoText} className="mono">WATCHPARTY</span>
        </div>
        <div style={s.headerRight}>
          <span style={s.userBadge}>
            <span style={s.dot} />
            {user?.username}
          </span>
          <button onClick={authLogout} style={s.logoutBtn}>Log out</button>
        </div>
      </header>

      <main style={s.main}>
        <div style={s.hero} className="fade-in">
          <h1 style={s.headline}>Watch together,<br /><span style={s.accent}>in sync.</span></h1>
          <p style={s.sub}>Create a room or join an existing one with a room code.</p>
        </div>

        <div style={s.cards} className="fade-in">
          {/* Create Room */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardIcon}>⊕</span>
              <h2 style={s.cardTitle}>Create Room</h2>
            </div>
            <p style={s.cardDesc}>Start a new watch party and invite your friends.</p>
            <form onSubmit={handleCreate} style={s.form}>
              <input
                style={s.input}
                value={createCode}
                onChange={(e) => setCreateCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                placeholder="ROOM CODE (e.g. MOVIE123)"
                maxLength={12}
                className="mono"
              />
              <button type="submit" style={{ ...s.btn, ...s.btnPrimary }} disabled={createLoading}>
                {createLoading ? <Spinner /> : 'Create Room →'}
              </button>
            </form>
          </div>

          <div style={s.divider}>
            <span style={s.dividerText}>or</span>
          </div>

          {/* Join Room */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardIcon}>⊞</span>
              <h2 style={s.cardTitle}>Join Room</h2>
            </div>
            <p style={s.cardDesc}>Enter a room code shared by your friend.</p>
            <form onSubmit={handleJoin} style={s.form}>
              <input
                style={s.input}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                placeholder="ENTER ROOM CODE"
                maxLength={12}
                className="mono"
              />
              <button type="submit" style={{ ...s.btn, ...s.btnSecondary }} disabled={joinLoading}>
                {joinLoading ? <Spinner /> : 'Join Room →'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

function Spinner() {
  return <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />;
}

const s = {
  page: { minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' },
  glow: { position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 70%)', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', borderBottom: '1px solid var(--border)', position: 'relative', zIndex: 10 },
  logo: { display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: { fontSize: 24, color: 'var(--accent)' },
  logoText: { fontSize: 16, fontWeight: 700, letterSpacing: 3, color: 'var(--text)' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 16 },
  userBadge: { display: 'flex', alignItems: 'center', gap: 7, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 20, padding: '6px 14px', fontSize: 14, color: 'var(--text2)' },
  dot: { width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)' },
  logoutBtn: { background: 'transparent', color: 'var(--text3)', fontSize: 14, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', zIndex: 1 },
  hero: { textAlign: 'center', marginBottom: 56 },
  headline: { fontSize: 52, fontWeight: 700, lineHeight: 1.15, marginBottom: 16, color: 'var(--text)', letterSpacing: -1 },
  accent: { color: 'var(--accent)' },
  sub: { fontSize: 17, color: 'var(--text2)' },
  cards: { display: 'flex', alignItems: 'stretch', gap: 0, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 18, overflow: 'hidden', width: '100%', maxWidth: 700 },
  card: { flex: 1, padding: '36px 36px 32px' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  cardIcon: { fontSize: 22, color: 'var(--accent)' },
  cardTitle: { fontSize: 20, fontWeight: 700, color: 'var(--text)' },
  cardDesc: { fontSize: 14, color: 'var(--text2)', marginBottom: 24, lineHeight: 1.6 },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  input: { background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 9, padding: '12px 16px', color: 'var(--text)', fontSize: 15, letterSpacing: 2, width: '100%' },
  btn: { padding: '13px', borderRadius: 9, fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnPrimary: { background: 'var(--accent)', color: '#fff' },
  btnSecondary: { background: 'var(--bg4)', color: 'var(--text)', border: '1px solid var(--border2)' },
  divider: { width: 1, background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  dividerText: { background: 'var(--bg2)', color: 'var(--text3)', fontSize: 12, padding: '6px 0', position: 'absolute', letterSpacing: 1 },
};
