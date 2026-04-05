import { useEffect, useState } from 'react';

const typeStyles = {
  info:    { border: 'rgba(108,99,255,0.4)', icon: 'ℹ', color: 'var(--accent2)' },
  success: { border: 'rgba(74,222,128,0.4)', icon: '✓', color: 'var(--green)' },
  warning: { border: 'rgba(251,191,36,0.4)', icon: '⚠', color: 'var(--yellow)' },
  error:   { border: 'rgba(255,85,101,0.4)', icon: '✗', color: 'var(--red)' },
};

export default function Notification({ notification }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!notification) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(t);
  }, [notification?.id]);

  if (!notification || !visible) return null;

  const t = typeStyles[notification.type] || typeStyles.info;

  return (
    <div style={{ ...s.toast, borderColor: t.border }} className="fade-in">
      <span style={{ color: t.color, fontWeight: 700 }}>{t.icon}</span>
      <span style={s.msg}>{notification.msg}</span>
    </div>
  );
}

const s = {
  toast: { position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: 'var(--bg2)', border: '1px solid', borderRadius: 10, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 10, zIndex: 2000, boxShadow: '0 4px 24px rgba(0,0,0,0.4)', maxWidth: 380, animation: 'fadeIn 0.2s ease' },
  msg: { fontSize: 14, color: 'var(--text)' },
};
