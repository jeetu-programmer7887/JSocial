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

export default function App() {
  const dispatch = useDispatch();
  // Grab the user from Redux to use their ID for the socket connection
  const { user } = useSelector((state) => state.auth);
  // Change it to explicitly use 5000 as the fallback!
  const backendUrl = import.meta.env.VITE_backendUrl || 'http://localhost:3000';

  // Loading state to prevent UI flashing before auth is confirmed
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // --- 1. AUTHENTICATION CHECK ---
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Ping the backend to verify the httpOnly cookie
        const response = await axios.get(`${backendUrl}/api/auth/me`, {
          withCredentials: true,
        });

        // If successful, update Redux with fresh user data
        dispatch(setCredentials(response.data));

      } catch (error) {
        // If unauthorized (cookie expired/missing), wipe the frontend state
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

    // Only connect if the user is successfully logged in
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

    // Cleanup: Disconnect when the component unmounts or user logs out
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
        {/* The parent Route uses the Layout component. 
            Everything nested inside it will render where the <Outlet /> is.
        */}
        <Route path="/" element={<Layout />}>

          {/* Default page (the feed) */}
          <Route index element={<Home />} />

          {/* Auth pages */}
          <Route path="register" element={<Register />} />
          <Route path="login" element={<Login />} />
          <Route path="profile" element={<Profile />} />

          {/* Add the dynamic routes! */}
          <Route path="profile/:username" element={<OtherUser />} />
          <Route path="/profile/:username/followers" element={<UserListPage />} />
          <Route path="/profile/:username/following" element={<UserListPage />} />

          {/* Other Pages */}
          <Route path="explore" element={<Explore />} />
          <Route path="notifications" element={<Alerts />} />

          {/* 404 Catch-all */}
          <Route path="*" element={<NotFound />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}