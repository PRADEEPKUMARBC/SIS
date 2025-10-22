import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useContext } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useAppContext } from "../context/AppContext";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    urgency: "normal"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const { axios } = useAppContext()

  // API base URL - change this to your backend URL
  // const VITE_BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Support features carousel
  const supportFeatures = [
    {
      icon: "🤝",
      title: "24/7 Expert Support",
      description: "Our irrigation specialists are available round the clock to assist you"
    },
    {
      icon: "🚀",
      title: "Quick Response",
      description: "Average response time under 2 hours for urgent queries"
    },
    {
      icon: "💡",
      title: "Smart Solutions",
      description: "Get personalized recommendations for your irrigation system"
    },
    {
      icon: "📊",
      title: "Data Analysis",
      description: "We analyze your system data to provide optimal solutions"
    }
  ];

  // Team members
  const teamMembers = [
    {
      name: "Sarah Chen",
      role: "Senior Irrigation Specialist",
      email: "sarah@irrigate.com",
      expertise: ["Smart Systems", "Water Optimization"],
      avatar: "👩‍💼"
    },
    {
      name: "Mike Rodriguez",
      role: "Technical Support Lead",
      email: "mike@irrigate.com",
      expertise: ["IoT Devices", "Troubleshooting"],
      avatar: "👨‍🔧"
    },
    {
      name: "Emily Watson",
      role: "Customer Success Manager",
      email: "emily@irrigate.com",
      expertise: ["Training", "System Setup"],
      avatar: "👩‍🌾"
    }
  ];

  // FAQ items
  const faqItems = [
    {
      question: "How do I connect my IoT device?",
      answer: "Follow our step-by-step guide in the Settings page or contact us for personalized setup assistance."
    },
    {
      question: "What's the warranty on irrigation systems?",
      answer: "All our systems come with a 2-year comprehensive warranty and lifetime technical support."
    },
    {
      question: "Can I integrate with existing systems?",
      answer: "Yes! Our solutions are designed to work with most existing irrigation infrastructure."
    },
    {
      question: "How accurate are soil moisture sensors?",
      answer: "Our sensors have 98% accuracy and are calibrated for different soil types and conditions."
    }
  ];

  // Animation variants (same as before)
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
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    },
    hover: {
      scale: 1.05,
      y: -5,
      boxShadow: "0px 20px 40px rgba(0,0,0,0.1)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const floatingVariants = {
    float: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      x: 50,
      transition: {
        duration: 0.4
      }
    }
  };

  const successVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    }
  };

  // Contact handlers
  const handlePhoneClick = () => {
    window.open('tel:6361736795');
  };

  const handleEmailClick = () => {
    window.open('https://mail.google.com/mail/u/0/#inbox');
  };

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % supportFeatures.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
    if (submitError) {
      setSubmitError("");
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    if (!formData.subject.trim()) errors.subject = "Subject is required";
    if (!formData.message.trim()) errors.message = "Message is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setSubmitError("");

    try {
      const response = await axios.post(`/api/contact`, formData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Failed to submit form");
      }

      console.log("Form submitted successfully:", result);
      setIsLoading(false);
      setIsSubmitted(true);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        urgency: "normal",
      });
    } catch (error) {
      console.error("Error submitting form:", error);

      if (error.response) {
        console.error("Backend response:", error.response.data);
        setSubmitError(error.response.data.message || "Failed to send message.");
      } else if (error.request) {
        console.error("No response received:", error.request);
        setSubmitError("No response from server. Is backend running?");
      } else {
        setSubmitError(error.message);
      }

      setIsLoading(false);
    }
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full mx-auto mb-4"
          />
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-2xl font-bold text-green-700 mb-2"
          >
            Sending Your Message
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-green-600"
          >
            We're connecting you with our support team...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          variants={floatingVariants}
          animate="float"
          className="absolute top-20 left-10 w-8 h-8 bg-green-300 rounded-full opacity-20"
        />
        <motion.div
          variants={floatingVariants}
          animate="float"
          transition={{ delay: 1 }}
          className="absolute top-40 right-20 w-12 h-12 bg-blue-300 rounded-full opacity-20"
        />
        <motion.div
          variants={floatingVariants}
          animate="float"
          transition={{ delay: 2 }}
          className="absolute bottom-32 left-20 w-6 h-6 bg-purple-300 rounded-full opacity-20"
        />
      </div>

      <div className="relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-7xl mx-auto px-4 py-12"
        >
          {/* Header Section */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <motion.h1 
              className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-6"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
            >
              We're Here to Help
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Get expert support for your smart irrigation system. Our team is ready to assist you 24/7.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Contact Form */}
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-white rounded-3xl shadow-2xl p-8"
            >
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.div
                    key="form"
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                      <Send className="mr-3 text-green-600" size={32} />
                      Send Message
                    </h2>
                    <p className="text-gray-600 mb-8">We typically respond within 2 hours</p>

                    {submitError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center"
                      >
                        <AlertCircle className="text-red-500 mr-3" size={20} />
                        <span className="text-red-700">{submitError}</span>
                      </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Your Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                              formErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
                            }`}
                            placeholder="Enter your full name"
                          />
                          {formErrors.name && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-500 text-sm mt-2 flex items-center"
                            >
                              <AlertCircle size={16} className="mr-1" />
                              {formErrors.name}
                            </motion.p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                              formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                            }`}
                            placeholder="your.email@example.com"
                          />
                          {formErrors.email && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-500 text-sm mt-2 flex items-center"
                            >
                              <AlertCircle size={16} className="mr-1" />
                              {formErrors.email}
                            </motion.p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Subject *
                        </label>
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                            formErrors.subject ? 'border-red-300 bg-red-50' : 'border-gray-200'
                          }`}
                          placeholder="What's this regarding?"
                        />
                        {formErrors.subject && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-sm mt-2 flex items-center"
                          >
                            <AlertCircle size={16} className="mr-1" />
                            {formErrors.subject}
                          </motion.p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Urgency Level
                        </label>
                        <select
                          name="urgency"
                          value={formData.urgency}
                          onChange={handleInputChange}
                          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="low">Low - General Inquiry</option>
                          <option value="normal">Normal - Technical Question</option>
                          <option value="high">High - System Issue</option>
                          <option value="urgent">Urgent - Critical Problem</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Message *
                        </label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          rows="6"
                          className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none ${
                            formErrors.message ? 'border-red-300 bg-red-50' : 'border-gray-200'
                          }`}
                          placeholder="Describe your issue or question in detail..."
                        />
                        {formErrors.message && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-sm mt-2 flex items-center"
                            >
                            <AlertCircle size={16} className="mr-1" />
                            {formErrors.message}
                          </motion.p>
                        )}
                      </div>

                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                      >
                        Send Message
                      </motion.button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    variants={successVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-center py-12"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <CheckCircle className="text-green-600" size={48} />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                      Message Sent Successfully!
                    </h3>
                    <p className="text-gray-600 mb-6">
                      We've received your message and will get back to you within 2 hours.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsSubmitted(false)}
                      className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                    >
                      Send Another Message
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Contact Information & Features */}
            <div className="space-y-8">
              {/* Support Features Carousel */}
              <motion.div
                variants={cardVariants}
                className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-8 text-white"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeature}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                  >
                    <div className="text-4xl mb-4">{supportFeatures[activeFeature].icon}</div>
                    <h3 className="text-2xl font-bold mb-3">{supportFeatures[activeFeature].title}</h3>
                    <p className="text-blue-100">{supportFeatures[activeFeature].description}</p>
                  </motion.div>
                </AnimatePresence>
                <div className="flex justify-center space-x-2 mt-6">
                  {supportFeatures.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveFeature(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === activeFeature ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Contact Methods */}
              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <motion.div
                  variants={itemVariants}
                  whileHover="hover"
                  className="bg-white rounded-2xl shadow-lg p-6 text-center cursor-pointer"
                  onClick={handlePhoneClick}
                >
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="text-green-600" size={24} />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Call Us</h4>
                  <p className="text-gray-600 text-sm">24/7 Support Line</p>
                  <p className="text-green-600 font-semibold hover:text-green-700 transition-colors">
                    6361736795
                  </p>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  whileHover="hover"
                  className="bg-white rounded-2xl shadow-lg p-6 text-center cursor-pointer"
                  onClick={handleEmailClick}
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="text-blue-600" size={24} />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Email Us</h4>
                  <p className="text-gray-600 text-sm">Quick Response</p>
                  <p className="text-blue-600 font-semibold hover:text-blue-700 transition-colors break-all text-sm">
                    pradeepkumarbc138@gmail.com
                  </p>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  whileHover="hover"
                  className="bg-white rounded-2xl shadow-lg p-6 text-center"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="text-purple-600" size={24} />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Live Chat</h4>
                  <p className="text-gray-600 text-sm">Instant Help</p>
                  <p className="text-purple-600 font-semibold">Available 24/7</p>
                </motion.div>
              </motion.div>

              {/* Team Section */}
              <motion.div
                variants={cardVariants}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="mr-2">👥</span>
                  Your Support Team
                </h3>
                <div className="space-y-4">
                  {teamMembers.map((member, index) => (
                    <motion.div
                      key={member.name}
                      variants={itemVariants}
                      whileHover={{ x: 5 }}
                      className="flex items-center p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="text-3xl mr-4">{member.avatar}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{member.name}</h4>
                        <p className="text-sm text-gray-600">{member.role}</p>
                        <p className="text-xs text-green-600 mt-1">{member.expertise.join(" • ")}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* FAQ Section */}
          <motion.div
            variants={containerVariants}
            className="bg-white rounded-3xl shadow-2xl p-8 mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqItems.map((faq, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover="hover"
                  className="p-6 bg-gray-50 rounded-xl border-2 border-transparent hover:border-green-300 transition-all"
                >
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="text-green-600 mr-2">❓</span>
                    {faq.question}
                  </h4>
                  <p className="text-gray-600 text-sm">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Location & Hours */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <motion.div
              variants={cardVariants}
              className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-3xl shadow-2xl p-8 text-white"
            >
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <MapPin className="mr-3" size={28} />
                Our Location
              </h3>
              <p className="text-green-100 mb-4">
                123 Irrigation Way<br />
                Smart Farming District<br />
                AgriTech Park, CA 94203
              </p>
              <div className="bg-white/20 rounded-xl p-4">
                <h4 className="font-semibold mb-2">Office Hours</h4>
                <p className="text-green-100 text-sm">
                  Mon-Fri: 8:00 AM - 8:00 PM PST<br />
                  Sat-Sun: 9:00 AM - 6:00 PM PST<br />
                  <span className="font-semibold">24/7 Emergency Support Available</span>
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={cardVariants}
              className="bg-white rounded-3xl shadow-2xl p-8"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                🌟 Why Choose Us?
              </h3>
              <div className="space-y-4">
                {[
                  "15+ years of irrigation expertise",
                  "98% customer satisfaction rate",
                  "Average response time: 47 minutes",
                  "Custom solutions for every farm",
                  "Ongoing system optimization"
                ].map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center text-gray-700"
                  >
                    <CheckCircle className="text-green-500 mr-3 flex-shrink-0" size={20} />
                    <span>{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default Contact;