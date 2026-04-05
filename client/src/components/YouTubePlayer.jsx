import { useEffect, useRef, useState } from 'react';
import { getSocket } from '../services/socket';

// Load YouTube IFrame API
function loadYTAPI() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) return resolve(window.YT);
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => resolve(window.YT);
  });
}

export default function YouTubePlayer({ roomId, videoId, hostId, userId, onPlay, onPause, onSeek }) {
  const playerRef = useRef(null);
  const playerInstanceRef = useRef(null);
  const isSyncing = useRef(false); // prevent echo loops
  const isHost = userId === hostId;
  const [playerReady, setPlayerReady] = useState(false);
  const socket = getSocket();

  // Init player
  useEffect(() => {
    let destroyed = false;
    loadYTAPI().then((YT) => {
      if (destroyed) return;
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
      }
      playerInstanceRef.current = new YT.Player('yt-player', {
        height: '100%',
        width: '100%',
        videoId: videoId || '',
        playerVars: { autoplay: 1, controls: 1, rel: 0, modestbranding: 1 },
        events: {
          onReady: () => setPlayerReady(true),
          onStateChange: handleStateChange,
        },
      });
    });
    return () => {
      destroyed = true;
    };
  }, []);

  // Load new video when videoId changes
  useEffect(() => {
    if (playerInstanceRef.current && playerReady && videoId) {
      playerInstanceRef.current.loadVideoById(videoId);
    }
  }, [videoId, playerReady]);

  // Handle local player events → emit to socket
  function handleStateChange(event) {
    if (isSyncing.current) return;
    const YT = window.YT;
    const currentTime = playerInstanceRef.current?.getCurrentTime?.() || 0;

    if (event.data === YT.PlayerState.PLAYING) onPlay?.(currentTime);
    if (event.data === YT.PlayerState.PAUSED) onPause?.(currentTime);
  }

  // Socket events → control player
  useEffect(() => {
    if (!socket || !playerReady) return;

    const applySync = (fn) => {
      isSyncing.current = true;
      fn();
      setTimeout(() => { isSyncing.current = false; }, 500);
    };

    socket.on('play', ({ currentTime }) => {
      applySync(() => {
        playerInstanceRef.current?.seekTo(currentTime, true);
        playerInstanceRef.current?.playVideo();
      });
    });

    socket.on('pause', ({ currentTime }) => {
      applySync(() => {
        playerInstanceRef.current?.seekTo(currentTime, true);
        playerInstanceRef.current?.pauseVideo();
      });
    });

    socket.on('seek', ({ currentTime }) => {
      applySync(() => {
        playerInstanceRef.current?.seekTo(currentTime, true);
      });
    });

    socket.on('sync_time', ({ currentTime }) => {
      const myTime = playerInstanceRef.current?.getCurrentTime?.() || 0;
      if (Math.abs(myTime - currentTime) > 2) {
        applySync(() => playerInstanceRef.current?.seekTo(currentTime, true));
      }
    });

    socket.on('start_video', ({ videoId }) => {
      applySync(() => {
        playerInstanceRef.current?.loadVideoById(videoId);
      });
    });

    return () => {
      socket.off('play');
      socket.off('pause');
      socket.off('seek');
      socket.off('sync_time');
      socket.off('start_video');
    };
  }, [socket, playerReady]);

  // Host periodically syncs time for others
  useEffect(() => {
    if (!isHost || !playerReady) return;
    const interval = setInterval(() => {
      const t = playerInstanceRef.current?.getCurrentTime?.();
      if (t !== undefined) socket?.emit('sync_time', { roomId, currentTime: t });
    }, 5000);
    return () => clearInterval(interval);
  }, [isHost, playerReady, roomId, socket]);

  return (
    <div style={{ width: '100%', height: '100%', background: '#000', position: 'relative' }}>
      <div id="yt-player" style={{ width: '100%', height: '100%' }} />
      {!videoId && (
        <div style={s.placeholder}>
          <div style={s.placeholderIcon}>▶</div>
          <p style={s.placeholderText}>Search for a video and send a play request</p>
          <p style={s.placeholderSub}>Everyone needs to accept before playback starts</p>
        </div>
      )}
    </div>
  );
}

const s = {
  placeholder: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg2)', gap: 12 },
  placeholderIcon: { fontSize: 56, color: 'var(--border2)', marginBottom: 8 },
  placeholderText: { color: 'var(--text2)', fontSize: 16, fontWeight: 500 },
  placeholderSub: { color: 'var(--text3)', fontSize: 13 },
};
