import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRoom } from '../hooks/useRoom';
import YouTubePlayer from '../components/YouTubePlayer';
import VideoSearch from '../components/VideoSearch';
import Chat from '../components/Chat';
import UserList from '../components/UserList';
import PlayRequestModal from '../components/PlayRequestModal';
import Notification from '../components/Notification';
import { getSocket } from '../services/socket';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';

const SIDEBAR_W = 320;

export default function RoomPage() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(true);

  const { roomState, messages, playRequest, notification, sendMessage, requestPlay, respondToRequest, emitPlay, emitPause, emitSeek } = useRoom(roomId);
  const socket = getSocket();

  useEffect(() => {
    if (!socket) { toast.error('Not connected. Please log in again.'); navigate('/'); }
  }, [socket]);

  function handleVideoSelect(video) {
    requestPlay(video);
    toast.success(`Play request sent for "${video.title.slice(0, 40)}..."`, { duration: 3000 });
  }

  function handleLeave() {
    socket?.emit('leave_room', { roomId });
    navigate('/lobby');
  }

  const isHost = roomState?.hostId === user?.id;
  const videoId = roomState?.currentVideo?.videoId;

  return (
    <div style={s.page}>
      {playRequest && <PlayRequestModal request={playRequest} onRespond={respondToRequest} currentUserId={user?.id} />}
      <Notification notification={notification} />

      <header style={s.header}>
        <div style={s.headerLeft}>
          <Logo size="sm" showName={false} />
          <span style={s.roomCode} className="mono">{roomId}</span>
          {isHost && <span style={s.hostTag}>HOST</span>}
        </div>

        <div style={s.headerCenter}>
          {roomState?.currentVideo && (
            <div style={s.nowPlaying}>
              <span style={s.npDot} />
              <span style={s.npText}>{roomState.currentVideo.title?.slice(0, 60)}{roomState.currentVideo.title?.length > 60 ? '…' : ''}</span>
            </div>
          )}
        </div>

        <div style={s.headerRight}>
          <button onClick={() => { navigator.clipboard.writeText(roomId); toast.success('Room code copied!'); }} style={s.copyBtn}>
            Copy Code
          </button>
          <button onClick={handleLeave} style={s.leaveBtn}>Leave →</button>
        </div>
      </header>

      <div style={s.layout}>
        <div style={s.main}>
          <div style={s.playerWrap}>
            <YouTubePlayer roomId={roomId} videoId={videoId} hostId={roomState?.hostId} userId={user?.id} onPlay={emitPlay} onPause={emitPause} onSeek={emitSeek} />
          </div>
          <div style={s.bottomPanel}>
            <div style={s.tabs}>
              <button style={{ ...s.tabBtn, ...(showSearch ? s.tabBtnActive : {}) }} onClick={() => setShowSearch(true)}>
                🔍 Search Videos
              </button>
              <button style={{ ...s.tabBtn, ...(!showSearch ? s.tabBtnActive : {}) }} onClick={() => setShowSearch(false)}>
                👥 Viewers ({roomState?.users?.filter(u => u.online !== false).length || 0})
              </button>
            </div>
            <div style={s.tabContent}>
              {showSearch ? <VideoSearch onSelect={handleVideoSelect} /> : <UserList users={roomState?.users || []} hostId={roomState?.hostId} currentUserId={user?.id} />}
            </div>
          </div>
        </div>

        <aside style={s.sidebar}>
          <Chat messages={messages} onSend={sendMessage} currentUser={user} />
        </aside>
      </div>
    </div>
  );
}

const s = {
  page: { height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 54, borderBottom: '1px solid var(--border)', flexShrink: 0, background: 'rgba(10,26,20,0.85)', backdropFilter: 'blur(6px)', gap: 16 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 },
  roomCode: { fontSize: 15, fontWeight: 700, letterSpacing: 3, color: 'var(--text)' },
  hostTag: { fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid rgba(93,232,184,0.3)', borderRadius: 4, padding: '2px 7px', fontFamily: 'Space Mono, monospace' },
  headerCenter: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 },
  nowPlaying: { display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 },
  npDot: { width: 7, height: 7, borderRadius: '50%', background: 'var(--red)', animation: 'pulse 1.5s infinite', flexShrink: 0 },
  npText: { fontSize: 13, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
  copyBtn: { background: 'rgba(15,45,34,0.6)', border: '1px solid var(--border)', color: 'var(--text2)', borderRadius: 7, padding: '6px 14px', fontSize: 13 },
  leaveBtn: { background: 'rgba(255,85,101,0.1)', border: '1px solid rgba(255,85,101,0.25)', color: 'var(--red)', borderRadius: 7, padding: '6px 14px', fontSize: 13, fontWeight: 600 },
  layout: { flex: 1, display: 'flex', overflow: 'hidden' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 },
  playerWrap: { flex: '0 0 auto', aspectRatio: '16/9', background: '#000', width: '100%', maxHeight: 'calc(100vh - 54px - 220px)' },
  bottomPanel: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderTop: '1px solid var(--border)' },
  tabs: { display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', flexShrink: 0 },
  tabBtn: { flex: 1, padding: '10px 16px', background: 'transparent', color: 'var(--text3)', fontSize: 13, fontWeight: 500, borderBottom: '2px solid transparent', transition: 'all 0.15s', borderRadius: 0 },
  tabBtnActive: { color: 'var(--accent)', borderBottomColor: 'var(--accent)', background: 'var(--accent-dim)' },
  tabContent: { flex: 1, overflow: 'auto', padding: 14 },
  sidebar: { width: SIDEBAR_W, flexShrink: 0, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'rgba(13,34,51,0.5)' },
};
