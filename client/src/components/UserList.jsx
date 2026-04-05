export default function UserList({ users = [], hostId, currentUserId }) {
  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <span style={s.headerIcon}>👥</span>
        <span style={s.headerTitle}>Viewers</span>
        <span style={s.count}>{users.filter((u) => u.online !== false).length}</span>
      </div>
      <div style={s.list}>
        {users.map((u) => {
          const isHost = u.id === hostId;
          const isYou = u.id === currentUserId;
          const online = u.online !== false;
          return (
            <div key={u.id} style={{ ...s.user, ...(!online ? s.offline : {}) }}>
              <div style={{ ...s.avatar, ...(isHost ? s.avatarHost : {}) }}>
                {u.username[0].toUpperCase()}
              </div>
              <div style={s.info}>
                <span style={s.name}>
                  {u.username}
                  {isYou && <span style={s.you}> (you)</span>}
                </span>
                {isHost && <span style={s.hostBadge}>HOST</span>}
              </div>
              <div style={{ ...s.statusDot, ...(online ? s.dotOnline : s.dotOffline) }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', alignItems: 'center', gap: 8, padding: '14px 16px', borderBottom: '1px solid var(--border)' },
  headerIcon: { fontSize: 15 },
  headerTitle: { fontSize: 13, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.8, flex: 1 },
  count: { background: 'var(--bg4)', color: 'var(--text3)', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, fontFamily: 'Space Mono, monospace' },
  list: { display: 'flex', flexDirection: 'column', gap: 2, padding: '10px 10px' },
  user: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px', borderRadius: 8, transition: 'opacity 0.2s' },
  offline: { opacity: 0.4 },
  avatar: { width: 32, height: 32, borderRadius: '50%', background: 'var(--bg4)', border: '2px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--text2)', flexShrink: 0 },
  avatarHost: { borderColor: 'var(--accent)', color: 'var(--accent)' },
  info: { flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6 },
  name: { fontSize: 13, color: 'var(--text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  you: { color: 'var(--text3)', fontWeight: 400 },
  hostBadge: { fontSize: 9, fontWeight: 700, letterSpacing: 1, color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 4, padding: '1px 5px', fontFamily: 'Space Mono, monospace' },
  statusDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  dotOnline: { background: 'var(--green)', boxShadow: '0 0 6px var(--green)' },
  dotOffline: { background: 'var(--border2)' },
};
