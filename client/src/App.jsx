import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import AuthPage from './pages/AuthPage';
import LobbyPage from './pages/LobbyPage';
import RoomPage from './pages/RoomPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text2)', fontFamily: "'Cinzel', serif", letterSpacing: 3, fontSize: 13 }}>
      LOADING...
    </div>
  );
  return user ? children : <Navigate to="/" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/lobby" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            style: { background: 'rgba(13,34,51,0.95)', color: '#d4f5e8', border: '1px solid rgba(60,180,130,0.3)', fontFamily: 'Lato, sans-serif', fontSize: 14, backdropFilter: 'blur(8px)' },
            success: { iconTheme: { primary: '#5de8b8', secondary: 'rgba(13,34,51,0.95)' } },
            error: { iconTheme: { primary: '#ff5565', secondary: 'rgba(13,34,51,0.95)' } },
          }}
        />
        <Routes>
          <Route path="/" element={<PublicRoute><AuthPage /></PublicRoute>} />
          <Route path="/lobby" element={<ProtectedRoute><LobbyPage /></ProtectedRoute>} />
          <Route path="/room/:roomId" element={<ProtectedRoute><RoomPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
