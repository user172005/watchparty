const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../controllers/authController');
const { getRoom, deleteRoom, socketToUser } = require('../models/store');

const PLAY_REQUEST_TIMEOUT = 15000; // 15 seconds
const MAJORITY_THRESHOLD = 0.5; // >50% accept = start

module.exports = function initSockets(io) {
  // Auth middleware for sockets
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('No token'));
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.user.username} (${socket.id})`);

    // ─── JOIN ROOM ───────────────────────────────────────────────────
    socket.on('join_room', ({ roomId }) => {
      const room = getRoom(roomId?.toUpperCase());
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      const code = roomId.toUpperCase();
      socket.join(code);

      // Update or add user in room
      const existingIdx = room.users.findIndex((u) => u.id === socket.user.id);
      if (existingIdx >= 0) {
        room.users[existingIdx].socketId = socket.id;
        room.users[existingIdx].online = true;
      } else {
        room.users.push({ id: socket.user.id, username: socket.user.username, socketId: socket.id, online: true });
      }

      socketToUser.set(socket.id, { userId: socket.user.id, username: socket.user.username, roomId: code });

      // Send current state to the joining user
      socket.emit('room_state', {
        roomId: code,
        hostId: room.hostId,
        users: room.users.map((u) => ({ id: u.id, username: u.username, online: u.online })),
        currentVideo: room.currentVideo,
        playbackState: room.playbackState,
        messages: room.messages.slice(-50),
      });

      // Notify others
      socket.to(code).emit('user_joined', {
        user: { id: socket.user.id, username: socket.user.username },
        users: room.users.map((u) => ({ id: u.id, username: u.username, online: u.online })),
      });

      // System message
      const sysMsg = { type: 'system', text: `${socket.user.username} joined the room`, timestamp: Date.now() };
      room.messages.push(sysMsg);
      io.to(code).emit('receive_message', sysMsg);
    });

    // ─── SEND CHAT MESSAGE ───────────────────────────────────────────
    socket.on('send_message', ({ roomId, text }) => {
      const room = getRoom(roomId);
      if (!room || !text?.trim()) return;

      const message = {
        type: 'chat',
        id: Date.now() + Math.random(),
        userId: socket.user.id,
        username: socket.user.username,
        text: text.trim().slice(0, 500),
        timestamp: Date.now(),
      };

      room.messages.push(message);
      if (room.messages.length > 200) room.messages = room.messages.slice(-200);

      io.to(roomId).emit('receive_message', message);
    });

    // ─── PLAY REQUEST ────────────────────────────────────────────────
    socket.on('play_request', ({ roomId, videoId, title, thumbnail }) => {
      const room = getRoom(roomId);
      if (!room) return;

      // Cancel existing pending request
      if (room.playRequest?.timeout) clearTimeout(room.playRequest.timeout);

      const requestId = Date.now().toString();
      const responses = new Map(); // userId -> 'accept' | 'reject'

      const timeoutHandle = setTimeout(() => {
        if (room.playRequest?.requestId !== requestId) return;

        const accepts = [...responses.values()].filter((r) => r === 'accept').length;
        const total = room.users.filter((u) => u.online).length;

        if (total === 0 || accepts / total > MAJORITY_THRESHOLD) {
          startVideo(io, room, roomId, videoId, title, thumbnail);
        } else {
          io.to(roomId).emit('play_request_expired', { requestId, message: 'Not enough accepts — video skipped.' });
        }
        room.playRequest = null;
      }, PLAY_REQUEST_TIMEOUT);

      room.playRequest = { requestId, videoId, title, thumbnail, requestedBy: socket.user.username, requestedById: socket.user.id, responses, timeout: timeoutHandle };

      io.to(roomId).emit('play_request', {
        requestId,
        videoId,
        title,
        thumbnail,
        requestedBy: socket.user.username,
        timeoutMs: PLAY_REQUEST_TIMEOUT,
      });
    });

    // ─── PLAY REQUEST RESPONSE ───────────────────────────────────────
    socket.on('play_request_response', ({ roomId, requestId, response }) => {
      const room = getRoom(roomId);
      if (!room || !room.playRequest || room.playRequest.requestId !== requestId) return;

      room.playRequest.responses.set(socket.user.id, response);

      const onlineUsers = room.users.filter((u) => u.online);
      const accepts = [...room.playRequest.responses.values()].filter((r) => r === 'accept').length;
      const rejects = [...room.playRequest.responses.values()].filter((r) => r === 'reject').length;
      const total = onlineUsers.length;
      const responded = accepts + rejects;

      // Broadcast response tally
      io.to(roomId).emit('play_request_tally', { requestId, accepts, rejects, total });

      // All accepted
      if (accepts === total) {
        clearTimeout(room.playRequest.timeout);
        startVideo(io, room, roomId, room.playRequest.videoId, room.playRequest.title, room.playRequest.thumbnail);
        room.playRequest = null;
        return;
      }

      // Majority rejected
      if (rejects > total * MAJORITY_THRESHOLD) {
        clearTimeout(room.playRequest.timeout);
        io.to(roomId).emit('play_request_rejected', { requestId, message: 'Majority rejected the video.' });
        room.playRequest = null;
        return;
      }

      // All responded but no majority
      if (responded === total) {
        clearTimeout(room.playRequest.timeout);
        if (accepts > rejects) {
          startVideo(io, room, roomId, room.playRequest.videoId, room.playRequest.title, room.playRequest.thumbnail);
        } else {
          io.to(roomId).emit('play_request_rejected', { requestId, message: 'Majority rejected the video.' });
        }
        room.playRequest = null;
      }
    });

    // ─── PLAYBACK CONTROLS ───────────────────────────────────────────
    socket.on('play', ({ roomId, currentTime }) => {
      const room = getRoom(roomId);
      if (!room) return;
      room.playbackState.playing = true;
      room.playbackState.currentTime = currentTime;
      room.playbackState.lastUpdated = Date.now();
      socket.to(roomId).emit('play', { currentTime, by: socket.user.username });
    });

    socket.on('pause', ({ roomId, currentTime }) => {
      const room = getRoom(roomId);
      if (!room) return;
      room.playbackState.playing = false;
      room.playbackState.currentTime = currentTime;
      room.playbackState.lastUpdated = Date.now();
      socket.to(roomId).emit('pause', { currentTime, by: socket.user.username });
    });

    socket.on('seek', ({ roomId, currentTime }) => {
      const room = getRoom(roomId);
      if (!room) return;
      room.playbackState.currentTime = currentTime;
      room.playbackState.lastUpdated = Date.now();
      socket.to(roomId).emit('seek', { currentTime, by: socket.user.username });
    });

    // ─── PERIODIC SYNC ───────────────────────────────────────────────
    socket.on('sync_time', ({ roomId, currentTime }) => {
      const room = getRoom(roomId);
      if (!room) return;
      // Only host syncs time for others
      if (room.hostId === socket.user.id) {
        room.playbackState.currentTime = currentTime;
        room.playbackState.lastUpdated = Date.now();
        socket.to(roomId).emit('sync_time', { currentTime });
      }
    });

    // ─── DISCONNECT ──────────────────────────────────────────────────
    socket.on('disconnect', () => {
      const info = socketToUser.get(socket.id);
      if (!info) return;

      const { roomId, userId, username } = info;
      socketToUser.delete(socket.id);

      const room = getRoom(roomId);
      if (!room) return;

      const userIdx = room.users.findIndex((u) => u.id === userId);
      if (userIdx >= 0) room.users[userIdx].online = false;

      const onlineUsers = room.users.filter((u) => u.online);

      // If no one left, clean up room after delay
      if (onlineUsers.length === 0) {
        setTimeout(() => {
          const r = getRoom(roomId);
          if (r && r.users.filter((u) => u.online).length === 0) {
            deleteRoom(roomId);
            console.log(`[Room] ${roomId} deleted (empty)`);
          }
        }, 30000);
      }

      // Transfer host if host left
      if (room.hostId === userId && onlineUsers.length > 0) {
        room.hostId = onlineUsers[0].id;
        io.to(roomId).emit('host_changed', { newHostId: room.hostId, newHostUsername: onlineUsers[0].username });
      }

      const sysMsg = { type: 'system', text: `${username} left the room`, timestamp: Date.now() };
      room.messages.push(sysMsg);
      io.to(roomId).emit('receive_message', sysMsg);

      io.to(roomId).emit('user_left', {
        userId,
        username,
        users: room.users.map((u) => ({ id: u.id, username: u.username, online: u.online })),
        newHostId: room.hostId,
      });
    });

    socket.on('leave_room', ({ roomId }) => {
      socket.leave(roomId);
      socket.emit('left_room');
    });
  });
};

function startVideo(io, room, roomId, videoId, title, thumbnail) {
  room.currentVideo = { videoId, title, thumbnail };
  room.playbackState = { playing: true, currentTime: 0, lastUpdated: Date.now() };
  io.to(roomId).emit('start_video', { videoId, title, thumbnail });
}
