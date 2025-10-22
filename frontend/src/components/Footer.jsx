import { motion } from "framer-motion";
import { assets } from "../assets/assets";
import { useInView } from "react-intersection-observer";

const Footer = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const linkVariants = {
    hidden: { x: -10, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.4
      }
    },
    hover: {
      x: 5,
      color: "#16a34a",
      transition: {
        duration: 0.2
      }
    }
  };

  const linkSections = [
    {
      title: "Quick Links",
      links: [
        { name: "Home", path: "/" },
        { name: "Dashboard", path: "/dashboard" },
        { name: "Weather Data", path: "/weather" },
        { name: "Crop Reports", path: "/reports" },
        { name: "System Settings", path: "/settings" },
        { name: "Contact Us", path: "/contact" }
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "User Guide", path: "/guide" },
        { name: "Troubleshooting", path: "/help" },
        { name: "Watering Tips", path: "/tips" },
        { name: "Sensor Setup", path: "/setup" },
        { name: "Support Center", path: "/support" }
      ]
    },
    {
      title: "Connect With Us",
      links: [
        { name: "LinkedIn", path: "https://www.linkedin.com/in/pradeepkumar-b-c-355801312?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app", icon: "💼" },
        { name: "Twitter", path: "", icon: "🐦" },
        { name: "Whatsapp", path: "www.whatsapp.com", icon: "👥" },
        { name: "YouTube", path: "https://youtube.com/@code-quests5e?si=0V89auU_1rw_wFuW", icon: "🎥" }
      ]
    }
  ];



  return (
    <motion.footer
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={containerVariants}
      className="bg-gradient-to-b from-green-50 to-green-100 text-gray-700 border-t border-green-200"
    >
      <div className="px-6 md:px-16 lg:px-24 xl:px-32">
        {/* Features Banner */}
        

        {/* Main Footer Content */}
        <motion.div
          variants={containerVariants}
          className="flex flex-col md:flex-row items-start justify-between gap-10 py-12"
        >
          {/* Logo & About */}
          <motion.div
            variants={itemVariants}
            className="flex-1"
          >
            <motion.div
              className="flex items-center gap-3 cursor-pointer mb-6"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.img
                src={assets.cropped_circle_image}
                alt="Smart Irrigation Logo"
                className="w-12 h-12"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              />
              <motion.h1
                className="text-3xl font-bold playfair-headline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                SMART <span className="text-blue-400">IRRIGATION</span>
              </motion.h1>
            </motion.div>
            
            <motion.p
              variants={itemVariants}
              className="max-w-[400px] mt-4 text-gray-600 leading-relaxed outfit-content"
            >
              Revolutionizing agriculture with AI-powered irrigation systems that help farmers 
              save up to 50% water, improve crop yield by 25%, and monitor fields in real-time 
              using advanced IoT technology.
            </motion.p>
            
            {/* Contact Info */}
            <motion.div
              variants={itemVariants}
              className="mt-6 space-y-2"
            >
              <p className="flex items-center gap-2 text-sm">
                <span className="text-green-600">📧</span>
                pradeepkumarbc138@gmail.com
              </p>
              <p className="flex items-center gap-2 text-sm">
                <span className="text-green-600">📞</span>
                +91 6361736795
              </p>
            </motion.div>
          </motion.div>

          {/* Link Sections */}
          <motion.div
            variants={containerVariants}
            className="flex flex-wrap justify-between w-full md:w-[60%] gap-8"
          >
            {linkSections.map((section, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex-1 min-w-[150px]"
              >
                <motion.h3
                  className="font-semibold text-lg text-green-800 mb-6 montserrat-subhead"
                  whileHover={{ color: "#16a34a" }}
                >
                  {section.title}
                </motion.h3>
                <motion.ul className="space-y-3">
                  {section.links.map((link, i) => (
                    <motion.li key={i}>
                      <motion.a
                        href={link.path}
                        className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors outfit-content"
                        variants={linkVariants}
                        whileHover="hover"
                      >
                        {link.icon && <span>{link.icon}</span>}
                        {link.name}
                      </motion.a>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Copyright & Bottom Section */}
        <motion.div
          variants={containerVariants}
          className="py-6 border-t border-green-200"
        >
          <motion.div
            variants={itemVariants}
            className="flex flex-col md:flex-row justify-between items-center gap-4"
          >
            <motion.p
              className="text-sm text-gray-500 text-center md:text-left outfit-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              © 2025 Smart Irrigation System | Made by Pradeepkumar B C. All Rights Reserved.
            </motion.p>
            
            {/* Additional Links */}
            <motion.div
              className="flex gap-6"
              variants={itemVariants}
            >
              {[
                { name: "Privacy Policy", path: "/privacy" },
                { name: "Terms of Service", path: "/terms" },
                { name: "Sitemap", path: "/sitemap" }
              ].map((link, index) => (
                <motion.a
                  key={index}
                  href={link.path}
                  className="text-sm text-gray-500 hover:text-green-600 transition-colors outfit-content"
                  whileHover={{ scale: 1.05 }}
                >
                  {link.name}
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Water Drop */}
      <motion.div
        className="fixed bottom-4 left-4 z-50"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, type: "spring" }}
      >
        <motion.div
          className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
          whileHover={{ scale: 1.2, backgroundColor: "#16a34a" }}
          whileTap={{ scale: 0.9 }}
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <span className="text-white text-xl">💧</span>
        </motion.div>
      </motion.div>
    </motion.footer>
  );
};

export default Footer;