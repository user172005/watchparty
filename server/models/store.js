// In-memory store (replace with MongoDB for production)

const users = new Map(); // username -> { id, username, passwordHash }
const rooms = new Map(); // roomId -> room object
const socketToUser = new Map(); // socketId -> { userId, username, roomId }

function createRoom(roomId, hostId, hostUsername) {
  const room = {
    roomId,
    hostId,
    users: [{ id: hostId, username: hostUsername, socketId: null }],
    currentVideo: null,
    playbackState: {
      playing: false,
      currentTime: 0,
      lastUpdated: Date.now(),
    },
    playRequest: null, // { videoId, title, thumbnail, requestedBy, responses: Map }
    messages: [],
    createdAt: Date.now(),
  };
  rooms.set(roomId, room);
  return room;
}

function getRoom(roomId) {
  return rooms.get(roomId);
}

function deleteRoom(roomId) {
  rooms.delete(roomId);
}

function getUserByUsername(username) {
  return users.get(username.toLowerCase());
}

function createUser(id, username, passwordHash) {
  const user = { id, username, passwordHash };
  users.set(username.toLowerCase(), user);
  return user;
}

module.exports = {
  users,
  rooms,
  socketToUser,
  createRoom,
  getRoom,
  deleteRoom,
  getUserByUsername,
  createUser,
};
