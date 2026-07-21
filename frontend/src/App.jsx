import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, logout } from './redux/authSlice';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

// Import your layout and pages
import Layout from './Layout/layout';
import Register from './pages/Register';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import Home from './pages/Home';
import OtherUser from './components/OtherUser';
import UserListPage from './components/UserListPage';
import Explore from './pages/Explore';
import Alerts from './components/Alert';
import ChatRoom from './components/ChatRoom';
import Messages from './pages/Message';
import { ProtectedRoute, GuestRoute } from '../src/components/RouteProtection'

export default function App() {
  const dispatch = useDispatch();

  // Grab the user from Redux to use their ID for the socket connection & route protection
  const { user } = useSelector((state) => state.auth);
  const backendUrl = import.meta.env.VITE_backendUrl || 'http://localhost:3000';

  // Loading state to prevent UI flashing before auth is confirmed
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // --- 1. AUTHENTICATION CHECK ---
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/auth/me`, {
          withCredentials: true,
        });
        dispatch(setCredentials(response.data));
      } catch (error) {
        console.log("Session expired or unauthorized", error.message);
        dispatch(logout());
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, [dispatch, backendUrl]);

  // --- 2. SOCKET.IO REAL-TIME NOTIFICATIONS ---
  useEffect(() => {
    let socket;

    if (user) {
      socket = io(backendUrl, {
        query: { userId: user._id },
      });

      socket.on("newNotification", (notification) => {
        toast(notification.message, {
          icon: notification.type === 'follow' ? '👤' : notification.type === 'like' ? '❤️' : '💬',
          style: {
            borderRadius: '10px',
            background: '#FF6B5E',
            color: '#fff',
          },
        });
      });
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [user, backendUrl]);

  // Show a full-screen loader during the initial API call
  if (isCheckingAuth) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-bg text-text">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-white/10 border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm font-bold animate-pulse text-muted">Securing session...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>

          {/* Public / Semi-Public Pages */}
          <Route index element={<Home />} />
          <Route path="explore" element={<Explore />} />
          <Route path="profile/:username" element={<OtherUser />} />
          <Route path="profile/:username/followers" element={<UserListPage />} />
          <Route path="profile/:username/following" element={<UserListPage />} />

          {/* Guest-Only Pages (Login / Register) */}
          <Route path="register" element={<GuestRoute user={user}><Register /></GuestRoute>} />
          <Route path="login" element={<GuestRoute user={user}><Login /></GuestRoute>} />

          {/* Protected Pages (Require Login) */}
          <Route path="profile" element={<ProtectedRoute user={user}><Profile /></ProtectedRoute>} />
          <Route path="notifications" element={<ProtectedRoute user={user}><Alerts /></ProtectedRoute>} />
          <Route path="messages" element={<ProtectedRoute user={user}><Messages /></ProtectedRoute>} />
          <Route path="messages/:id" element={<ProtectedRoute user={user}><ChatRoom /></ProtectedRoute>} />

          {/* 404 Catch-all */}
          <Route path="*" element={<NotFound />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}