import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Weather from "./pages/Weather";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Contact from "./pages/Contact";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollTop from "./components/ScrollToTop";
import { Toaster } from 'react-hot-toast'
import ProfilePage from "./components/ProfilePage";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  const location = useLocation();

  // Hide Navbar, Footer, and ScrollTop on login page
  const hideNavbarFooter = location.pathname === "/login";

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Navbar */}
      {!hideNavbarFooter && <Navbar />}
      <Toaster position="top-right" reverseOrder={false} />


      {/* Page Content */}
      <div className="flex-grow">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/my-profile" element={<ProfilePage />} />
        </Routes>
      </div>

      {/* Footer */}
      {!hideNavbarFooter && <Footer />}

      {/* Scroll to Top Button */}
      {!hideNavbarFooter && <ScrollTop />}
    </div>
  );
}

export default App;
