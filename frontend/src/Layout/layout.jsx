import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-text selection:bg-primary selection:text-bg">
      
      {/* Floating Navbar */}
      <Navbar />

      {/* Dynamic Page Content */}
      <main className="grow flex flex-col relative pt-24">
        <Outlet />
      </main>

      {/* Insert the premium Footer component */}
      <Footer />

    </div>
  );
}