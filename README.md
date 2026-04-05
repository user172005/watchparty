# ◈ WatchParty

Watch YouTube together in real-time — with synchronized playback, a play-request voting system, and live chat.

---

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Real-time**: Socket.IO
- **Auth**: JWT
- **Video**: YouTube IFrame API + YouTube Data API v3

---

## Project Structure

```
watchparty/
├── server/
│   ├── index.js                  # Entry point
│   ├── controllers/
│   │   ├── authController.js     # JWT signup/login
│   │   └── roomController.js     # Create/get/validate rooms
│   ├── models/
│   │   └── store.js              # In-memory data store
│   ├── routes/
│   │   ├── auth.js
│   │   └── rooms.js
│   └── sockets/
│       └── socketHandler.js      # All real-time logic
│
└── client/
    └── src/
        ├── App.jsx
        ├── pages/
        │   ├── AuthPage.jsx       # Login / Signup
        │   ├── LobbyPage.jsx      # Create / Join room
        │   └── RoomPage.jsx       # Watch party UI
        ├── components/
        │   ├── YouTubePlayer.jsx  # IFrame API + sync
        │   ├── VideoSearch.jsx    # YouTube search
        │   ├── Chat.jsx           # Real-time chat
        │   ├── UserList.jsx       # Online users
        │   ├── PlayRequestModal.jsx # Accept/reject modal
        │   └── Notification.jsx   # Toast notifications
        ├── hooks/
        │   ├── useAuth.jsx        # Auth context
        │   └── useRoom.js         # Room socket events
        └── services/
            ├── api.js             # Axios + YouTube API
            └── socket.js         # Socket singleton
```

---

## Setup Instructions

### 1. Get a YouTube Data API v3 Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → Enable **YouTube Data API v3**
3. Create an API key under Credentials

### 2. Install & Run the Server

```bash
cd server
npm install
npm run dev
```

Server runs on `http://localhost:3001`

### 3. Install & Run the Client

```bash
cd client
cp .env.example .env
# Edit .env and paste your YouTube API key
npm install
npm run dev
```

Client runs on `http://localhost:5173`

---

## How It Works

### Auth
- Sign up / log in with username + password
- JWT stored in localStorage, sent with every request

### Rooms
- Create a room with a custom code (e.g. `MOVIE123`)
- Share the code with friends
- Friends enter the code manually to join (no auto-join)

### Play Requests
1. Search for a YouTube video
2. Click **Request ▶**
3. A modal appears for **all users** with Accept / Reject
4. Video starts when **all accept** OR **majority accept**
5. If no majority in 15 seconds → request expires

### Playback Sync
- Play / Pause / Seek events are broadcast to all users via Socket.IO
- Host syncs timestamps every 5 seconds to prevent drift
- Users more than 2 seconds out of sync are automatically corrected

### Chat
- Real-time via Socket.IO
- System messages for join/leave events
- Last 200 messages kept per room

### Edge Cases Handled
- User disconnects → marked offline, host reassigned if needed
- Empty room → deleted after 30 seconds
- Invalid room code → error shown before joining
- Play request timeout → majority vote triggers or expires

---

## Socket Events Reference

| Event | Direction | Description |
|-------|-----------|-------------|
| `join_room` | client → server | Join a room |
| `room_state` | server → client | Full room state on join |
| `user_joined` / `user_left` | server → all | Presence updates |
| `send_message` | client → server | Send chat message |
| `receive_message` | server → all | Broadcast message |
| `play_request` | client → server | Request to play a video |
| `play_request` | server → all | Broadcast request + modal |
| `play_request_response` | client → server | Accept or reject |
| `play_request_tally` | server → all | Live vote count |
| `start_video` | server → all | Begin playing video |
| `play` / `pause` / `seek` | client ↔ server | Playback control |
| `sync_time` | host → server → all | Periodic time correction |
| `host_changed` | server → all | New host assigned |

---

## Environment Variables

### client/.env
```
VITE_YOUTUBE_API_KEY=your_key_here
VITE_SERVER_URL=http://localhost:3001
```

### server (optional)
```
PORT=3001
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_secret_here
```

---

## Production Notes

- Replace in-memory store (`server/models/store.js`) with MongoDB
- Set a strong `JWT_SECRET` environment variable
- Restrict YouTube API key to your domain in Google Cloud Console
- Use `pm2` or similar to run the server in production
