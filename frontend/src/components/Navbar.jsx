import { Link, useLocation, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

function Navbar() {
  const { user, logout,  } = useAppContext();
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileDropdownRef = useRef(null);
  const location = useLocation();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Navigation items
  const navItems = [
    { path: "/", label: "Home" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/weather", label: "Weather" },
    { path: "/reports", label: "Reports" },
    { path: "/settings", label: "Settings" },
    { path: "/contact", label: "Contact" }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const logoVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        delay: 0.2
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.3
      }
    }
  };

  const navItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.3 + i * 0.1,
        duration: 0.4
      }
    }),
    hover: {
      scale: 1.1,
      color: "#fef08a",
      y: -2,
      transition: {
        duration: 0.2
      }
    },
    tap: {
      scale: 0.95
    }
  };

  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      x: "100%",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const mobileItemVariants = {
    closed: { opacity: 0, x: 50 },
    open: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.1 + i * 0.1,
        duration: 0.3
      }
    }),
    hover: {
      x: 10,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      transition: {
        duration: 0.2
      }
    }
  };

  const profileDropdownVariants = {
    closed: {
      opacity: 0,
      scale: 0.8,
      y: -10,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    },
    open: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    navigate("/")
  };

  const handleProfileClick = () => {
    navigate("/my-profile");
    setIsProfileDropdownOpen(false);
  };

  return (
    <motion.nav
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-gradient-to-r from-green-700 to-green-600 text-white shadow-2xl sticky top-0 z-50 py-3"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <motion.div
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer group"
            variants={logoVariants}
            whileHover="hover"
          >
            <motion.img
              src={assets.cropped_circle_image}
              alt="Smart Irrigation Logo"
              className="w-8 h-8 sm:w-12 sm:h-12"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            />
            <motion.h1 
              className="text-xl sm:text-2xl font-bold playfair-headline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              SMART <span className="text-blue-300">IRRIGATION</span>
            </motion.h1>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-6">
            <motion.div 
              className="flex space-x-2 lg:space-x-4"
              variants={containerVariants}
            >
              {navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={navItemVariants}
                >
                  <Link to={item.path}>
                    <motion.span
                      className="px-3 py-2 rounded-lg font-medium montserrat-subhead text-sm lg:text-base relative group"
                      variants={navItemVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      {item.label}
                      {/* Active page underline */}
                      {location.pathname === item.path && (
                        <motion.span
                          className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-200"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                      {/* Hover underline effect */}
                      {location.pathname !== item.path && (
                        <motion.span
                          className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-200 group-hover:w-full"
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </motion.span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Profile Dropdown */}
            {user ? (
              <motion.div 
                className="relative ml-4"
                ref={profileDropdownRef}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <motion.button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg bg-green-800 hover:bg-green-900 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center">
                    <span className="text-green-800 font-bold text-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <motion.span
                    animate={{ rotate: isProfileDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    ▼
                  </motion.span>
                </motion.button>

                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      variants={profileDropdownVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-2xl border border-green-200 overflow-hidden"
                    >
                      {/* Profile Header */}
                      <div className="p-4 bg-green-50 border-b border-green-200">
                        <p className="font-semibold text-green-800 text-sm truncate">
                          {user.name || 'User'}
                        </p>
                        <p className="text-green-600 text-xs truncate">
                          {user.email}
                        </p>
                        {user.farmName && (
                          <p className="text-green-500 text-xs mt-1 truncate">
                            🚜 {user.farmName}
                          </p>
                        )}
                      </div>

                      {/* Dropdown Items */}
                      <div className="py-1">
                        <motion.button
                          onClick={handleProfileClick}
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-green-50 transition-colors flex items-center gap-3"
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <span className="w-5 h-5">👤</span>
                          My Profile
                        </motion.button>

                        <motion.button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <span className="w-5 h-5">🚪</span>
                          Logout
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              // Login/Signup buttons when not logged in
              <motion.div 
                className="flex items-center gap-2 ml-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <motion.button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 bg-blue-200 text-green-900 rounded-lg cursor-pointer font-semibold hover:bg-yellow-300 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Login
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.div
            className="md:hidden flex items-center gap-3"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {user && (
  <motion.div 
    className="relative"
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
  >
    <div
      onClick={() => setShowProfileMenu(!showProfileMenu)}
      className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center cursor-pointer"
    >
      <span className="text-green-800 font-bold text-sm">
        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
      </span>
    </div>

    {showProfileMenu && (
      <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg py-2 z-50">
        <Link
          to="/my-profile"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          onClick={() => setShowProfileMenu(false)}
        >
          👤 My Profile
        </Link>
        <button
          onClick={() => {
            handleLogout();
            setShowProfileMenu(false);
          }}
          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
        >
          🚪 Logout
        </button>
      </div>
    )}
  </motion.div>
)}

            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-green-800 hover:bg-green-900 transition-colors"
            >
              <div className="w-6 h-6 flex flex-col justify-between">
                <motion.span
                  animate={isMobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                  className="w-full h-0.5 bg-white block"
                />
                <motion.span
                  animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                  className="w-full h-0.5 bg-white block"
                />
                <motion.span
                  animate={isMobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                  className="w-full h-0.5 bg-white block"
                />
              </div>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Mobile Menu */}
            <motion.div
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-0 right-0 h-full w-64 bg-gradient-to-b from-green-700 to-green-800 shadow-2xl z-50 md:hidden"
            >
              <div className="flex flex-col h-full pt-20 px-6">
                {/* Close Button */}
                <motion.button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="absolute top-4 right-4 p-2"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <span className="text-2xl">×</span>
                </motion.button>

                {/* User Info in Mobile Menu */}
                {user && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6 p-4 bg-green-600 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center">
                        <span className="text-green-800 font-bold">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">
                          {user.name || 'User'}
                        </p>
                        <p className="text-green-200 text-xs">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Mobile Navigation Items */}
                <div className="space-y-4">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.path}
                      custom={index}
                      variants={mobileItemVariants}
                      initial="closed"
                      animate="open"
                      whileHover="hover"
                    >
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`block py-3 px-4 rounded-lg text-lg font-medium montserrat-subhead border-l-4 transition-all ${
                          location.pathname === item.path 
                            ? "border-yellow-200 bg-green-600" 
                            : "border-transparent hover:border-yellow-200"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}

                  {/* Mobile Auth Buttons */}
                  {!user ? (
                    <motion.div
                      variants={mobileItemVariants}
                      initial="closed"
                      animate="open"
                      custom={navItems.length}
                    >
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          navigate("/login");
                        }}
                        className="w-full text-left py-3 px-4 rounded-lg text-lg font-medium montserrat-subhead bg-yellow-400 text-green-900 hover:bg-yellow-300 transition-colors"
                      >
                        Login / Sign Up
                      </button>
                    </motion.div>
                  ) : (
                    <>
                      <motion.div
                        variants={mobileItemVariants}
                        initial="closed"
                        animate="open"
                        custom={navItems.length}
                      >
                        <Link
                          to="/my-profile"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block py-3 px-4 rounded-lg text-lg font-medium montserrat-subhead border-l-4 border-transparent hover:border-yellow-200 transition-all"
                        >
                          👤 My Profile
                        </Link>
                      </motion.div>
                      <motion.div
                        variants={mobileItemVariants}
                        initial="closed"
                        animate="open"
                        custom={navItems.length + 1}
                      >
                        <button
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            handleLogout();
                          }}
                          className="w-full text-left py-3 px-4 rounded-lg text-lg font-medium montserrat-subhead text-red-300 hover:bg-red-900 transition-colors"
                        >
                          🚪 Logout
                        </button>
                      </motion.div>
                    </>
                  )}
                </div>

                {/* Additional Mobile Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mt-auto pb-8"
                >
                  <div className="text-center text-green-200 text-sm">
                    <p>Smart Irrigation System</p>
                    <p className="mt-2">🌱 Grow Smart, Save Water 💧</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Water Drop Indicator */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-300 to-yellow-200"
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ delay: 1, duration: 1, ease: "easeOut" }}
      />
    </motion.nav>
  );
}

export default Navbar;