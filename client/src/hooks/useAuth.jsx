import { createContext, useContext, useState, useEffect } from 'react';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('wp_token');
    const u = localStorage.getItem('wp_user');
    if (t && u) {
      setToken(t);
      setUser(JSON.parse(u));
      connectSocket(t);
    }
    setLoading(false);
  }, []);

  function authLogin(data) {
    localStorage.setItem('wp_token', data.token);
    localStorage.setItem('wp_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    connectSocket(data.token);
  }

  function authLogout() {
    localStorage.removeItem('wp_token');
    localStorage.removeItem('wp_user');
    setToken(null);
    setUser(null);
    disconnectSocket();
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, authLogin, authLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
