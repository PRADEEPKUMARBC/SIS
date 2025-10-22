import { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AppContext } from "../context/AppContext";
import { toast } from "react-hot-toast"; // ✅ added toast import

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [farmName, setFarmName] = useState("");
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useContext(AppContext);

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login logic
        const res = await axios.post("http://localhost:5000/api/auth/login", { 
          email, 
          password 
        });
        
        if (res.data.success) {
          localStorage.setItem("token", res.data.token);
          setUser(res.data.user);

          toast.success(res.data.message || "Login successful!"); // ✅ success toast
          navigate("/");
        } else {
          toast.error(res.data.message || "Login failed!"); // ✅ error toast
        }
      } else {
        // Signup logic
        if (password !== confirmPassword) {
          toast.error("Passwords don't match!"); // ✅ error toast
          setIsLoading(false);
          return;
        }

        if (password.length < 6) {
          toast.error("Password must be at least 6 characters long!"); // ✅ error toast
          setIsLoading(false);
          return;
        }

        const res = await axios.post("http://localhost:5000/api/auth/signup", { 
          name, 
          email, 
          password,
          farmName,
          location
        });
        
        if (res.data.success) { 
          localStorage.setItem("token", res.data.token);
          setUser(res.data.user);

          toast.success(res.data.message || "Signup successful!"); // ✅ success toast
          navigate("/");
        } else {
          toast.error(res.data.message || "Signup failed!"); // ✅ error toast
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || (isLogin ? "Login failed!" : "Signup failed!")); // ✅
      } else {
        toast.error("Network error. Please try again."); // ✅
      }
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5, when: "beforeChildren", staggerChildren: 0.1 }
    },
    exit: { opacity: 0, transition: { duration: 0.3, when: "afterChildren" } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
    exit: { y: -20, opacity: 0, transition: { duration: 0.3 } }
  };

  const formVariants = {
    hidden: { x: isLogin ? -100 : 100, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    exit: { 
      x: isLogin ? 100 : -100, 
      opacity: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        className="absolute top-10 left-10 w-20 h-20 bg-green-200 rounded-full opacity-20"
        animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-32 h-32 bg-blue-200 rounded-full opacity-20"
        animate={{ y: [0, 20, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 relative z-10">
        {/* Toggle Switch */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-md transition-all duration-300 ${
              isLogin 
                ? "bg-green-600 text-white shadow-md" 
                : "text-gray-600 hover:text-green-700"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-md transition-all duration-300 ${
              !isLogin 
                ? "bg-green-600 text-white shadow-md" 
                : "text-gray-600 hover:text-green-700"
            }`}
          >
            Sign Up
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? "login" : "signup"}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-3xl font-bold mb-6 text-center text-green-700"
            >
              {isLogin ? "Farmer Login" : "Create Account"}
            </motion.h2>

            <motion.form onSubmit={handleAuth} variants={formVariants}>
              {!isLogin && (
                <>
                  <motion.input
                    variants={itemVariants}
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    className="border border-gray-300 w-full mb-4 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                  />
                  <motion.input
                    variants={itemVariants}
                    type="text"
                    placeholder="Farm Name"
                    value={farmName}
                    className="border border-gray-300 w-full mb-4 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    onChange={(e) => setFarmName(e.target.value)}
                    required={!isLogin}
                  />
                  <motion.input
                    variants={itemVariants}
                    type="text"
                    placeholder="Location"
                    value={location}
                    className="border border-gray-300 w-full mb-4 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </>
              )}

              <motion.input
                variants={itemVariants}
                type="email"
                placeholder="Email"
                value={email}
                className="border border-gray-300 w-full mb-4 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <motion.input
                variants={itemVariants}
                type="password"
                placeholder="Password"
                value={password}
                className="border border-gray-300 w-full mb-4 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {!isLogin && (
                <motion.input
                  variants={itemVariants}
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  className="border border-gray-300 w-full mb-4 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required={!isLogin}
                />
              )}

              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(34, 197, 94, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                  isLoading 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
                type="submit"
              >
                {isLoading ? "Processing..." : (isLogin ? "Login" : "Create Account")}
              </motion.button>
            </motion.form>

            <motion.div variants={itemVariants} className="text-center mt-6 text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-green-600 font-semibold hover:text-green-700 underline transition-colors duration-300"
              >
                {isLogin ? "Click here to sign up" : "Click here to login"}
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default AuthPage;
