import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function signup(username, password) {
  const { data } = await api.post('/auth/signup', { username, password });
  return data;
}

export async function login(username, password) {
  const { data } = await api.post('/auth/login', { username, password });
  return data;
}

export async function createRoom(roomId) {
  const { data } = await api.post('/rooms/create', { roomId });
  return data;
}

export async function validateRoom(roomId) {
  const { data } = await api.get(`/rooms/${roomId}/validate`);
  return data;
}

export async function getRoomInfo(roomId) {
  const { data } = await api.get(`/rooms/${roomId}`);
  return data;
}

export async function searchYouTube(query) {
  const key = import.meta.env.VITE_YOUTUBE_API_KEY;
  if (!key) throw new Error('YouTube API key not set. Add VITE_YOUTUBE_API_KEY to .env');
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=8&q=${encodeURIComponent(query)}&key=${key}`;
  const { data } = await axios.get(url);
  return data.items.map((item) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails.medium.url,
  }));
}

export default api;
