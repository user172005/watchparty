const { createRoom, getRoom } = require('../models/store');

function createRoomHandler(req, res) {
  const { roomId } = req.body;
  const { id: hostId, username } = req.user;

  if (!roomId || roomId.trim().length < 3)
    return res.status(400).json({ error: 'Room code must be at least 3 characters' });

  const code = roomId.trim().toUpperCase();

  if (getRoom(code))
    return res.status(409).json({ error: 'Room code already in use' });

  const room = createRoom(code, hostId, username);
  res.json({ roomId: room.roomId, hostId: room.hostId });
}

function getRoomHandler(req, res) {
  const { roomId } = req.params;
  const room = getRoom(roomId.toUpperCase());
  if (!room) return res.status(404).json({ error: 'Room not found' });

  res.json({
    roomId: room.roomId,
    hostId: room.hostId,
    users: room.users.map((u) => ({ id: u.id, username: u.username })),
    currentVideo: room.currentVideo,
    playbackState: room.playbackState,
  });
}

function validateRoomHandler(req, res) {
  const { roomId } = req.params;
  const room = getRoom(roomId.toUpperCase());
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json({ valid: true, roomId: room.roomId });
}

module.exports = { createRoomHandler, getRoomHandler, validateRoomHandler };
