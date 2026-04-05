import { useState, useEffect, useCallback, useRef } from 'react';
import { getSocket } from '../services/socket';

export function useRoom(roomId) {
  const [roomState, setRoomState] = useState(null);
  const [messages, setMessages] = useState([]);
  const [playRequest, setPlayRequest] = useState(null);
  const [notification, setNotification] = useState(null);
  const socket = getSocket();
  const myResponseRef = useRef(null);

  const notify = useCallback((msg, type = 'info') => {
    setNotification({ msg, type, id: Date.now() });
    setTimeout(() => setNotification(null), 3500);
  }, []);

  useEffect(() => {
    if (!socket || !roomId) return;

    socket.emit('join_room', { roomId });

    socket.on('room_state', (state) => {
      setRoomState(state);
      setMessages(state.messages || []);
    });

    socket.on('user_joined', ({ users }) => {
      setRoomState((prev) => prev ? { ...prev, users } : prev);
    });

    socket.on('user_left', ({ username, users, newHostId }) => {
      setRoomState((prev) => prev ? { ...prev, users, hostId: newHostId } : prev);
      notify(`${username} left the room`, 'warning');
    });

    socket.on('host_changed', ({ newHostUsername }) => {
      notify(`${newHostUsername} is now the host`, 'info');
    });

    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('play_request', (req) => {
      myResponseRef.current = null;
      setPlayRequest(req);
    });

    socket.on('play_request_tally', ({ accepts, rejects, total }) => {
      setPlayRequest((prev) => prev ? { ...prev, accepts, rejects, total } : prev);
    });

    socket.on('play_request_rejected', ({ message }) => {
      setPlayRequest(null);
      notify(message, 'error');
    });

    socket.on('play_request_expired', ({ message }) => {
      setPlayRequest(null);
      notify(message, 'warning');
    });

    socket.on('start_video', (video) => {
      setPlayRequest(null);
      setRoomState((prev) => prev ? { ...prev, currentVideo: video, playbackState: { playing: true, currentTime: 0 } } : prev);
    });

    socket.on('error', ({ message }) => notify(message, 'error'));

    return () => {
      socket.off('room_state');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('host_changed');
      socket.off('receive_message');
      socket.off('play_request');
      socket.off('play_request_tally');
      socket.off('play_request_rejected');
      socket.off('play_request_expired');
      socket.off('start_video');
      socket.off('error');
    };
  }, [socket, roomId]);

  const sendMessage = useCallback((text) => {
    socket?.emit('send_message', { roomId, text });
  }, [socket, roomId]);

  const requestPlay = useCallback((video) => {
    socket?.emit('play_request', { roomId, ...video });
  }, [socket, roomId]);

  const respondToRequest = useCallback((requestId, response) => {
    myResponseRef.current = response;
    socket?.emit('play_request_response', { roomId, requestId, response });
    setPlayRequest((prev) => prev ? { ...prev, myResponse: response } : prev);
  }, [socket, roomId]);

  const emitPlay = useCallback((currentTime) => socket?.emit('play', { roomId, currentTime }), [socket, roomId]);
  const emitPause = useCallback((currentTime) => socket?.emit('pause', { roomId, currentTime }), [socket, roomId]);
  const emitSeek = useCallback((currentTime) => socket?.emit('seek', { roomId, currentTime }), [socket, roomId]);
  const emitSync = useCallback((currentTime) => socket?.emit('sync_time', { roomId, currentTime }), [socket, roomId]);

  return { roomState, messages, playRequest, notification, sendMessage, requestPlay, respondToRequest, emitPlay, emitPause, emitSeek, emitSync };
}
