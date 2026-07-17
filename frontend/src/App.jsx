import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setCredentials, logout } from './redux/authSlice';

// Import your layout and pages
import Layout from './Layout/layout';
import Register from './pages/Register';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import Home from './pages/Home';

export default function App() {
  const dispatch = useDispatch();
  const backendUrl = import.meta.env.VITE_backendUrl || '';
  
  // Loading state to prevent UI flashing before auth is confirmed
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

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
        console.log("Session expired or unauthorized");
        dispatch(logout());
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, [dispatch, backendUrl]);

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

          {/* Add the dynamic profile route! */}
          <Route path="profile/:username" element={<Profile />} />
          
          {/* 404 Catch-all */}
          <Route path="*" element={<NotFound/>} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}