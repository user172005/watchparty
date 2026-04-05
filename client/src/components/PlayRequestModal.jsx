import { useEffect, useState } from 'react';

export default function PlayRequestModal({ request, onRespond, currentUserId }) {
  const [timeLeft, setTimeLeft] = useState(15);

  useEffect(() => {
    if (!request) return;
    setTimeLeft(Math.floor((request.timeoutMs || 15000) / 1000));
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [request?.requestId]);

  if (!request) return null;

  const hasResponded = !!request.myResponse;
  const accepts = request.accepts || 0;
  const rejects = request.rejects || 0;
  const total = request.total || 1;
  const acceptPct = Math.round((accepts / total) * 100);
  const timerPct = (timeLeft / ((request.timeoutMs || 15000) / 1000)) * 100;
  const isRequester = request.requestedById === currentUserId;

  return (
    <div style={s.overlay}>
      <div style={s.modal} className="fade-in">
        {/* Timer bar */}
        <div style={s.timerBarWrap}>
          <div style={{ ...s.timerBar, width: `${timerPct}%`, background: timeLeft > 8 ? 'var(--accent)' : timeLeft > 4 ? 'var(--yellow)' : 'var(--red)' }} />
        </div>

        <div style={s.body}>
          <div style={s.badge}>
            <span style={s.badgeDot} />
            Play Request
          </div>

          <p style={s.requestedBy}>
            <strong style={{ color: 'var(--accent2)' }}>{request.requestedBy}</strong> wants to watch:
          </p>

          <div style={s.videoCard}>
            {request.thumbnail && <img src={request.thumbnail} alt={request.title} style={s.thumb} />}
            <p style={s.videoTitle}>{request.title}</p>
          </div>

          {/* Vote tally */}
          <div style={s.tally}>
            <div style={s.tallyBar}>
              <div style={{ ...s.tallyFill, width: `${acceptPct}%` }} />
            </div>
            <div style={s.tallyCounts}>
              <span style={{ color: 'var(--green)' }}>✓ {accepts} accept</span>
              <span style={{ color: 'var(--text3)' }}>{timeLeft}s left</span>
              <span style={{ color: 'var(--red)' }}>{rejects} reject ✗</span>
            </div>
          </div>

          {hasResponded ? (
            <div style={{ ...s.responded, ...(request.myResponse === 'accept' ? s.respondedAccept : s.respondedReject) }}>
              {request.myResponse === 'accept' ? '✓ You accepted — waiting for others...' : '✗ You rejected the request'}
            </div>
          ) : isRequester ? (
            <div style={s.waitingMsg}>You sent this request — waiting for responses...</div>
          ) : (
            <div style={s.actions}>
              <button style={{ ...s.btn, ...s.btnReject }} onClick={() => onRespond(request.requestId, 'reject')}>
                ✗ Reject
              </button>
              <button style={{ ...s.btn, ...s.btnAccept }} onClick={() => onRespond(request.requestId, 'accept')}>
                ✓ Accept
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modal: { background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 16, width: '100%', maxWidth: 440, overflow: 'hidden', animation: 'modalIn 0.25s ease forwards' },
  timerBarWrap: { height: 3, background: 'var(--bg4)', position: 'relative' },
  timerBar: { height: '100%', transition: 'width 1s linear, background 0.5s ease' },
  body: { padding: '24px 28px 28px' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.25)', borderRadius: 20, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: 'var(--accent2)', marginBottom: 18, letterSpacing: 0.5 },
  badgeDot: { width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1.5s infinite' },
  requestedBy: { fontSize: 15, color: 'var(--text2)', marginBottom: 16 },
  videoCard: { background: 'var(--bg3)', borderRadius: 10, overflow: 'hidden', marginBottom: 20 },
  thumb: { width: '100%', height: 140, objectFit: 'cover', display: 'block' },
  videoTitle: { padding: '10px 14px 12px', fontSize: 14, color: 'var(--text)', fontWeight: 500, lineHeight: 1.4 },
  tally: { marginBottom: 20 },
  tallyBar: { height: 6, background: 'var(--bg4)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  tallyFill: { height: '100%', background: 'var(--green)', borderRadius: 3, transition: 'width 0.4s ease' },
  tallyCounts: { display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, fontFamily: 'Space Mono, monospace' },
  actions: { display: 'flex', gap: 10 },
  btn: { flex: 1, padding: '13px', borderRadius: 10, fontSize: 15, fontWeight: 700 },
  btnAccept: { background: 'var(--green)', color: '#000' },
  btnReject: { background: 'var(--bg4)', color: 'var(--red)', border: '1px solid rgba(255,85,101,0.3)' },
  responded: { padding: '13px 16px', borderRadius: 10, fontSize: 14, fontWeight: 600, textAlign: 'center' },
  respondedAccept: { background: 'rgba(74,222,128,0.1)', color: 'var(--green)', border: '1px solid rgba(74,222,128,0.25)' },
  respondedReject: { background: 'rgba(255,85,101,0.1)', color: 'var(--red)', border: '1px solid rgba(255,85,101,0.25)' },
  waitingMsg: { color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: '12px', background: 'var(--bg3)', borderRadius: 10 },
};
