import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

function ProfilePage() {
  const { user, setUser } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [message, setMessage] = useState({ text: "", type: "" });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    farmName: "",
    location: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        farmName: user.farmName || "",
        location: user.location || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        "http://localhost:5000/api/auth/profile",
        {
          name: formData.name,
          farmName: formData.farmName,
          location: formData.location
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        setUser(res.data.user);
        showMessage("Profile updated successfully! 🌟", "success");
        setIsEditing(false);
      }
    } catch (error) {
      showMessage(error.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      showMessage("Passwords don't match! 🔒", "error");
      return;
    }

    if (formData.newPassword.length < 6) {
      showMessage("Password must be at least 6 characters", "error");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        "http://localhost:5000/api/auth/change-password",
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        showMessage("Password updated successfully! 🔑", "success");
        setFormData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }));
      }
    } catch (error) {
      showMessage(error.response?.data?.message || "Failed to change password", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const tabContentVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-2xl text-emerald-600 flex items-center gap-3"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full"
          />
          Loading your profile...
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-cyan-50 py-8"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.h1 
            className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-4"
            whileHover={{ scale: 1.02 }}
          >
            My Profile
          </motion.h1>
          <p className="text-emerald-600 text-xl font-light">
            Manage your irrigation system account
          </p>
        </motion.div>

        {/* Message Alert */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className={`mb-8 p-4 rounded-2xl border-l-4 ${
                message.type === "error" 
                  ? "bg-red-50 border-red-400 text-red-700" 
                  : "bg-emerald-50 border-emerald-400 text-emerald-700"
              } shadow-lg`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">
                  {message.type === "error" ? "⚠️" : "✅"}
                </span>
                <span className="font-medium">{message.text}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Profile Card */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-1"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sticky top-8 border border-white/20">
              {/* Profile Avatar */}
              <motion.div 
                className="text-center mb-8"
                whileHover={{ scale: 1.05 }}
              >
                <div className="relative inline-block">
                  <motion.div
                    className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full mx-auto flex items-center justify-center mb-6 shadow-2xl"
                    whileHover={{ rotate: 5 }}
                  >
                    <span className="text-4xl font-bold text-white">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </motion.div>
                  <motion.div 
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-white"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{user.name}</h2>
                <p className="text-emerald-600 font-medium break-words max-w-full ">{user.email}</p>
                {user.farmName && (
                  <p className="text-gray-600 mt-3 flex items-center justify-center gap-2">
                    <span className="text-xl">🌾</span>
                    {user.farmName}
                  </p>
                )}
              </motion.div>

              {/* Account Stats */}
              <div className="space-y-4">
                <motion.div 
                  className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-100"
                  whileHover={{ scale: 1.02 }}
                >
                  <p className="text-sm text-emerald-700 font-semibold">Account Role</p>
                  <p className="text-emerald-800 font-bold capitalize">{user.role || "Farmer"}</p>
                </motion.div>
                
                <motion.div 
                  className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-100"
                  whileHover={{ scale: 1.02 }}
                >
                  <p className="text-sm text-blue-700 font-semibold">Subscription</p>
                  <p className="text-blue-800 font-bold capitalize">{user.subscription || "Premium"}</p>
                </motion.div>

                {user.lastLogin && (
                  <motion.div 
                    className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-100"
                    whileHover={{ scale: 1.02 }}
                  >
                    <p className="text-sm text-amber-700 font-semibold">Last Active</p>
                    <p className="text-amber-800 font-medium">
                      {new Date(user.lastLogin).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Main Content Area */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-3"
          >
            {/* Tab Navigation */}
            <motion.div 
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-2 mb-8 border border-white/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex space-x-2">
                {[
                  { id: "profile", label: "📝 Profile", icon: "👤" },
                  { id: "security", label: "🔒 Security", icon: "🛡️" },
                  { id: "stats", label: "📊 Statistics", icon: "🌱" }
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg"
                        : "text-gray-600 hover:text-emerald-600 hover:bg-white/50"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    {tab.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-8"
              >
                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <motion.div
                    variants={cardVariants}
                    className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20"
                  >
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                        Profile Information
                      </h3>
                      <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.4)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsEditing(!isEditing)}
                        className={`px-6 py-3 rounded-2xl font-semibold transition-all ${
                          isEditing 
                            ? "bg-gray-500 text-white hover:bg-gray-600" 
                            : "bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600"
                        }`}
                      >
                        {isEditing ? "Cancel Editing" : "Edit Profile"}
                      </motion.button>
                    </div>

                    <form onSubmit={handleProfileUpdate}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          { label: "Full Name", name: "name", type: "text", icon: "👤" },
                          { label: "Email", name: "email", type: "email", icon: "📧", disabled: true },
                          { label: "Farm Name", name: "farmName", type: "text", icon: "🌾" },
                          { label: "Location", name: "location", type: "text", icon: "📍" }
                        ].map((field) => (
                          <motion.div
                            key={field.name}
                            className="space-y-2"
                            whileHover={{ y: -2 }}
                          >
                            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                              <span>{field.icon}</span>
                              {field.label}
                            </label>
                            <input
                              type={field.type}
                              name={field.name}
                              value={formData[field.name]}
                              onChange={handleInputChange}
                              disabled={!isEditing || field.disabled}
                              className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 disabled:bg-gray-100 disabled:text-gray-500"
                              placeholder={`Enter your ${field.label.toLowerCase()}`}
                            />
                          </motion.div>
                        ))}
                      </div>

                      {isEditing && (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          type="submit"
                          disabled={isLoading}
                          className="mt-8 w-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-emerald-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 shadow-lg"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <motion.span
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                              />
                              Saving Changes...
                            </span>
                          ) : (
                            "💾 Save Profile Changes"
                          )}
                        </motion.button>
                      )}
                    </form>
                  </motion.div>
                )}

                {/* Security Tab */}
                {activeTab === "security" && (
                  <motion.div
                    variants={cardVariants}
                    className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20"
                  >
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-8">
                      Security Settings
                    </h3>
                    
                    <form onSubmit={handlePasswordChange}>
                      <div className="space-y-6 max-w-2xl">
                        {[
                          { label: "Current Password", name: "currentPassword", placeholder: "Enter your current password" },
                          { label: "New Password", name: "newPassword", placeholder: "Enter your new password" },
                          { label: "Confirm New Password", name: "confirmPassword", placeholder: "Re-enter your new password" }
                        ].map((field, index) => (
                          <motion.div
                            key={field.name}
                            className="space-y-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <label className="block text-sm font-semibold text-gray-700">
                              {field.label}
                            </label>
                            <input
                              type="password"
                              name={field.name}
                              value={formData[field.name]}
                              onChange={handleInputChange}
                              className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                              placeholder={field.placeholder}
                            />
                          </motion.div>
                        ))}

                        <motion.button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 shadow-lg mt-6"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <motion.span
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                              />
                              Updating Password...
                            </span>
                          ) : (
                            "🔄 Update Password"
                          )}
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Statistics Tab */}
                {activeTab === "stats" && (
                  <motion.div
                    variants={cardVariants}
                    className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20"
                  >
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-8">
                      Farm Statistics
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {[
                        { label: "Active Devices", value: "12", color: "emerald", icon: "💧" },
                        { label: "Irrigation Zones", value: "8", color: "blue", icon: "🌿" },
                        { label: "Water Saved", value: "5.2k", unit: "L", color: "cyan", icon: "💦" },
                        { label: "Active Days", value: "45", unit: "d", color: "amber", icon: "📅" }
                      ].map((stat, index) => (
                        <motion.div
                          key={stat.label}
                          className={`bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 rounded-2xl p-6 text-center border border-${stat.color}-200 shadow-lg`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ 
                            scale: 1.05,
                            y: -5,
                            transition: { duration: 0.2 }
                          }}
                        >
                          <div className="text-3xl mb-2">{stat.icon}</div>
                          <div className={`text-4xl font-bold text-${stat.color}-600 mb-1`}>
                            {stat.value}
                            {stat.unit && <span className="text-lg">{stat.unit}</span>}
                          </div>
                          <div className={`text-sm font-semibold text-${stat.color}-700`}>
                            {stat.label}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Progress Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl border border-emerald-200"
                    >
                      <h4 className="text-xl font-bold text-emerald-800 mb-4 flex items-center gap-2">
                        🌟 System Efficiency
                      </h4>
                      <div className="space-y-4">
                        {[
                          { label: "Water Usage", percentage: 85, color: "emerald" },
                          { label: "Energy Efficiency", percentage: 72, color: "blue" },
                          { label: "Crop Health", percentage: 91, color: "green" }
                        ].map((item, index) => (
                          <div key={item.label} className="space-y-2">
                            <div className="flex justify-between text-sm font-medium text-gray-700">
                              <span>{item.label}</span>
                              <span>{item.percentage}%</span>
                            </div>
                            <motion.div 
                              className="h-3 bg-gray-200 rounded-full overflow-hidden"
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                              transition={{ delay: 0.7 + index * 0.1, duration: 1 }}
                            >
                              <motion.div
                                className={`h-full bg-${item.color}-500 rounded-full`}
                                initial={{ width: 0 }}
                                animate={{ width: `${item.percentage}%` }}
                                transition={{ delay: 0.9 + index * 0.1, duration: 1.5, ease: "easeOut" }}
                              />
                            </motion.div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default ProfilePage;