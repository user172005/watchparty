import { useEffect, useRef, useState } from 'react';

export default function Chat({ messages, onSend, currentUser }) {
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend(e) {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText('');
  }

  function formatTime(ts) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <span style={s.headerIcon}>💬</span>
        <span style={s.headerTitle}>Chat</span>
      </div>

      <div style={s.messages}>
        {messages.map((msg, i) => {
          if (msg.type === 'system') {
            return (
              <div key={i} style={s.sysMsg}>
                <span style={s.sysDot}>—</span>
                {msg.text}
              </div>
            );
          }
          const isMe = msg.userId === currentUser?.id;
          return (
            <div key={msg.id || i} style={{ ...s.msg, ...(isMe ? s.msgMe : {}) }}>
              {!isMe && <div style={s.username}>{msg.username}</div>}
              <div style={{ ...s.bubble, ...(isMe ? s.bubbleMe : s.bubbleThem) }}>
                {msg.text}
              </div>
              <div style={{ ...s.time, ...(isMe ? { textAlign: 'right' } : {}) }}>
                {formatTime(msg.timestamp)}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} style={s.inputRow}>
        <input
          style={s.input}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Say something..."
          maxLength={500}
        />
        <button type="submit" style={s.sendBtn} disabled={!text.trim()}>
          ↑
        </button>
      </form>
    </div>
  );
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'center', gap: 8, padding: '14px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 },
  headerIcon: { fontSize: 15 },
  headerTitle: { fontSize: 13, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.8 },
  messages: { flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 },
  sysMsg: { display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text3)', fontSize: 11, textAlign: 'center', justifyContent: 'center' },
  sysDot: { color: 'var(--border2)' },
  msg: { display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '88%', alignSelf: 'flex-start' },
  msgMe: { alignSelf: 'flex-end' },
  username: { fontSize: 11, color: 'var(--accent2)', fontWeight: 600, paddingLeft: 2 },
  bubble: { padding: '8px 12px', borderRadius: 12, fontSize: 14, lineHeight: 1.45, wordBreak: 'break-word' },
  bubbleThem: { background: 'var(--bg3)', color: 'var(--text)', borderBottomLeftRadius: 4 },
  bubbleMe: { background: 'var(--accent)', color: '#fff', borderBottomRightRadius: 4 },
  time: { fontSize: 10, color: 'var(--text3)', paddingLeft: 2 },
  inputRow: { display: 'flex', gap: 8, padding: '12px 14px', borderTop: '1px solid var(--border)', flexShrink: 0 },
  input: { flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', color: 'var(--text)', fontSize: 14 },
  sendBtn: { background: 'var(--accent)', color: '#fff', borderRadius: 8, width: 38, height: 38, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
};
