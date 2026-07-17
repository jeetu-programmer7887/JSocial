import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import your layout and pages
import Layout from './Layout/layout';
import Register from './pages/Register';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Create a dummy Home component just to test the default route
const Home = () => (
  <div className="flex items-center justify-center grow p-8">
    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary">
      Welcome to your Feed
    </h1>
  </div>
);

export default function App() {
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
          
          {/* 404 Catch-all */}
          <Route path="*" element={<NotFound/>} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}