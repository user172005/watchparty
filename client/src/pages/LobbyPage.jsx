import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom, validateRoom } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';

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
    } finally { setCreateLoading(false); }
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
    } finally { setJoinLoading(false); }
  }

  return (
    <div style={s.page}>
      <Starfield />
      <div style={s.glow} />

      <header style={s.header}>
        <Logo size="sm" showName={true} />
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
          <h1 style={s.headline}>Watch together,<br /><span style={s.accentText}>in sync.</span></h1>
          <p style={s.sub}>Create a room or join an existing one with a room code.</p>
        </div>

        <div style={s.cards} className="fade-in">
          {/* Create Room */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardIcon}>✦</span>
              <h2 style={s.cardTitle}>CREATE ROOM</h2>
            </div>
            <p style={s.cardDesc}>Start a new watch party and invite your friends.</p>
            <form onSubmit={handleCreate} style={s.form}>
              <input style={s.input} value={createCode}
                onChange={(e) => setCreateCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                placeholder="ROOM CODE (e.g. MOVIE123)" maxLength={12} className="mono" />
              <button type="submit" style={{ ...s.btn, ...s.btnPrimary }} disabled={createLoading}>
                {createLoading ? <Spinner /> : 'CREATE ROOM →'}
              </button>
            </form>
          </div>

          <div style={s.divider}><span style={s.dividerText}>or</span></div>

          {/* Join Room */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardIcon}>✧</span>
              <h2 style={s.cardTitle}>JOIN ROOM</h2>
            </div>
            <p style={s.cardDesc}>Enter a room code shared by your friend.</p>
            <form onSubmit={handleJoin} style={s.form}>
              <input style={s.input} value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                placeholder="ENTER ROOM CODE" maxLength={12} className="mono" />
              <button type="submit" style={{ ...s.btn, ...s.btnSecondary }} disabled={joinLoading}>
                {joinLoading ? <Spinner /> : 'JOIN ROOM →'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

function Starfield() {
  const stars = Array.from({ length: 35 }, (_, i) => ({
    id: i, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
    size: Math.random() * 2 + 1, delay: `${Math.random() * 4}s`, duration: `${2 + Math.random() * 3}s`,
  }));
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {stars.map(s => (
        <div key={s.id} style={{
          position: 'absolute', top: s.top, left: s.left, width: s.size, height: s.size,
          borderRadius: '50%', background: '#5de8b8',
          animation: `twinkle ${s.duration} ease-in-out infinite`, animationDelay: s.delay, opacity: 0.4,
        }} />
      ))}
    </div>
  );
}

function Spinner() {
  return <span style={{ width: 16, height: 16, border: '2px solid rgba(93,232,184,0.3)', borderTop: '2px solid #5de8b8', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />;
}

const s = {
  page: { minHeight: '100vh', background: '#070e14', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' },
  glow: { position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(93,232,184,0.07) 0%, transparent 70%)', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 0 },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid var(--border)', position: 'relative', zIndex: 10, background: 'rgba(10,26,20,0.7)', backdropFilter: 'blur(6px)' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 16 },
  userBadge: { display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(15,45,34,0.6)', border: '1px solid var(--border)', borderRadius: 20, padding: '6px 14px', fontSize: 13, color: 'var(--text2)' },
  dot: { width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)' },
  logoutBtn: { background: 'transparent', color: 'var(--text3)', fontSize: 13, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', zIndex: 1 },
  hero: { textAlign: 'center', marginBottom: 52 },
  headline: { fontSize: 50, fontWeight: 700, lineHeight: 1.15, marginBottom: 16, color: '#d4f5e8', letterSpacing: -1, fontFamily: "'Cinzel', serif" },
  accentText: { color: '#5de8b8' },
  sub: { fontSize: 15, color: 'var(--text2)', fontWeight: 300, letterSpacing: 0.5 },
  cards: { display: 'flex', alignItems: 'stretch', gap: 0, background: 'rgba(13,34,51,0.65)', border: '1px solid var(--border)', borderRadius: 18, overflow: 'hidden', width: '100%', maxWidth: 700, backdropFilter: 'blur(8px)' },
  card: { flex: 1, padding: '36px 36px 32px' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  cardIcon: { fontSize: 20, color: 'var(--accent)' },
  cardTitle: { fontSize: 15, fontWeight: 700, color: 'var(--text)', fontFamily: "'Cinzel', serif", letterSpacing: 2 },
  cardDesc: { fontSize: 13, color: 'var(--text2)', marginBottom: 24, lineHeight: 1.6, fontWeight: 300 },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  input: { background: 'rgba(15,45,34,0.6)', border: '1px solid var(--border)', borderRadius: 9, padding: '12px 16px', color: 'var(--text)', fontSize: 14, letterSpacing: 2, width: '100%' },
  btn: { padding: '12px', borderRadius: 9, fontSize: 13, fontWeight: 700, fontFamily: "'Cinzel', serif", letterSpacing: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnPrimary: { background: 'rgba(93,232,184,0.18)', border: '1px solid rgba(93,232,184,0.45)', color: 'var(--accent)' },
  btnSecondary: { background: 'rgba(15,56,40,0.5)', border: '1px solid var(--border)', color: 'var(--text2)' },
  divider: { width: 1, background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  dividerText: { background: 'rgba(13,34,51,0.9)', color: 'var(--text3)', fontSize: 11, padding: '6px 4px', position: 'absolute', letterSpacing: 1 },
};
