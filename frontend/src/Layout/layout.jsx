import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollTop';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-text selection:bg-primary selection:text-bg">

      {/* Scrol to Top */}
      <ScrollToTop/>

      {/* 🚨 THE GLOBAL TOASTER: Set zIndex high so it floats over the Navbar */}
      <Toaster
        containerStyle={{ zIndex: 99999 }}
      />

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