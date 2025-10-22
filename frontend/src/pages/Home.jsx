import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { useContext } from "react";


// Custom font styles using your specified fonts
const fontStyles = {
  mainHeadline: {
    fontFamily: "'Playfair', serif",
    fontWeight: 700
  },
  sectionHeadline: {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 700
  },
  subHeadline: {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 600
  },
  content: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 400
  },
  button: {
    fontFamily: "'Manrope', sans-serif",
    fontWeight: 600
  },
  featureTitle: {
    fontFamily: "'Open Sans', sans-serif",
    fontWeight: 600
  }
};

// Animation variants
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
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const cardVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.05,
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    transition: {
      duration: 0.2
    }
  }
};

// Custom hook for scroll animations
const useScrollAnimation = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return { ref, inView };
};

// Updated HeroImage component with header image
const HeroImage = () => (
  <motion.div
    className="relative"
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8, delay: 0.5 }}
  >
    <div className="relative w-full max-w-2xl mx-auto ml-1">
      {/* Header Image */}
          <motion.img
      src={assets.header}
      alt="Smart Irrigation System - Modern Farming Technology"
      className="w-full h-auto rounded-2xl shadow-2xl object-cover "
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.7 }}
      style={{
        maxHeight: "500px",
        minHeight: "300px",
      }}
    />
      
      {/* Floating Water Drop */}
      <motion.div
        className="absolute -top-4 -right-4 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
        animate={{
          scale: [1, 1.1, 1],
          y: [0, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        <span className="text-xl sm:text-2xl lg:text-3xl">💧</span>
      </motion.div>

      {/* Image Overlay Text */}
      
    </div>
  </motion.div>
);

const FeatureImage = ({ emoji, delay = 0 }) => (
  <motion.div
    className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto"
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ duration: 0.6, delay, type: "spring", stiffness: 100 }}
    whileHover={{ scale: 1.2 }}
  >
    <span className="text-xl sm:text-2xl">{emoji}</span>
  </motion.div>
);

function Home() {
  const heroSection = useScrollAnimation();
  const introSection = useScrollAnimation();
  const consequencesSection = useScrollAnimation();
  const visionSection = useScrollAnimation();
  const howItWorksSection = useScrollAnimation();
  const benefitsSection = useScrollAnimation();
  const featuresSection = useScrollAnimation();
  const scopeSection = useScrollAnimation();
  const { user } = useContext(AppContext);


  return (
    <div className="bg-gradient-to-b from-green-50 to-white min-h-screen overflow-hidden">
      {/* Hero Section */}
      <motion.section
        ref={heroSection.ref}
        initial="hidden"
        animate={heroSection.inView ? "visible" : "hidden"}
        variants={containerVariants}
        className="flex flex-col lg:flex-row items-center justify-between min-h-screen px-4 sm:px-6 lg:px-8 xl:px-20 py-8 sm:py-10 lg:py-12"
      >
        <motion.div className="lg:w-1/2 text-center lg:text-left mb-8 lg:mb-0" variants={itemVariants}>
          <motion.h1 
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-green-700 mb-4 sm:mb-6 leading-tight"
            style={fontStyles.mainHeadline}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Smart Irrigation
            <motion.span 
              className="block text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-green-600 mt-2"
              style={fontStyles.mainHeadline}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              System
            </motion.span>
          </motion.h1>
          
          <motion.p 
            className="text-gray-700 text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 leading-relaxed"
            style={fontStyles.content}
            variants={itemVariants}
          >
            Revolutionizing agriculture with AI-powered irrigation to help farmers save water, 
            reduce effort, and maximize crop yield.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
            <Link to="/login" className="flex-1">
              <motion.button 
                className="bg-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl text-base sm:text-lg w-full shadow-lg hover:bg-green-700 transition-colors"
                style={fontStyles.button}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 25px rgba(34, 197, 94, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Today
              </motion.button> 
            </Link>
            <Link to="/dashboard" className="flex-1">
              <motion.button 
                className="bg-white text-green-600 border-2 border-green-600 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl text-base sm:text-lg w-full shadow-lg hover:bg-green-50 transition-colors"
                style={fontStyles.button}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 25px rgba(34, 197, 94, 0.2)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                View Demo
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
        
        <motion.div className="lg:w-1/2 w-full mt-8 lg:mt-0 flex justify-center" variants={itemVariants}>
          <HeroImage />
        </motion.div>
      </motion.section>

      {/* Introduction Section */}
      <motion.section
        ref={introSection.ref}
        initial="hidden"
        animate={introSection.inView ? "visible" : "hidden"}
        variants={containerVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20"
      >
        <motion.h2 
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-700 text-center mb-12 sm:mb-16 leading-tight"
          style={fontStyles.sectionHeadline}
          variants={itemVariants}
        >
          Transforming Agriculture Through Smart Technology
        </motion.h2>
        
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
  <motion.div 
    className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-green-100"
    variants={cardVariants}
    whileHover="hover"
  >
    <FeatureImage emoji="👨‍🌾" delay={0.1} />
    <h3 
      className="text-xl sm:text-2xl font-semibold text-green-800 mb-4 text-center"
      style={fontStyles.subHeadline}
    >
      Who Uses Smart Irrigation?
    </h3>
    <ul className="list-disc list-inside text-gray-700 text-base sm:text-lg space-y-2 sm:space-y-3" style={fontStyles.content}>
      <li><strong>Small to Large-Scale Farmers</strong> - Efficient water management</li>
      <li><strong>Agricultural Corporations</strong> - Centralized farm monitoring</li>
      <li><strong>Greenhouse Operators</strong> - Precision climate control</li>
      <li><strong>Research Institutions</strong> - Agricultural data collection</li>
      <li><strong>Government Departments</strong> - Water conservation initiatives</li>
    </ul>
  </motion.div>

  <motion.div 
    className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-green-100"
    variants={cardVariants}
    whileHover="hover"
  >
    <FeatureImage emoji="💡" delay={0.2} />
    <h3 
      className="text-xl sm:text-2xl font-semibold text-green-800 mb-4 text-center"
      style={fontStyles.subHeadline}
    >
      Why Smart Irrigation is Essential
    </h3>
    <ul className="list-disc list-inside text-gray-700 text-base sm:text-lg space-y-2 sm:space-y-3" style={fontStyles.content}>
      <li>Traditional irrigation methods often lead to <strong>significant water </strong>.</li>
      <li>Causes <strong>uneven watering</strong> across crop fields.</li>
      <li>Results in <strong>reduced crop quality</strong> and inconsistent yields.</li>
      <li>With <strong>changing climate patterns</strong>, efficient irrigation is vital.</li>
      <li>Helps tackle <strong>increasing water scarcity</strong> challenges.</li>
    </ul>
  </motion.div>
</div>


        {/* Consequences Section */}
        <motion.div
          ref={consequencesSection.ref} 
          initial="hidden"
          animate={consequencesSection.inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-12 sm:mb-16 bg-red-50 p-6 sm:p-8 rounded-2xl border-l-4 border-red-500 shadow-lg"
        >
          <motion.h3 
            className="text-xl sm:text-2xl font-semibold text-red-800 mb-6 text-center"
            style={fontStyles.subHeadline}
            variants={itemVariants}
          >
            Consequences of Traditional Irrigation Methods
          </motion.h3>
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
            <motion.div variants={itemVariants}>
              <h4 
                className="text-lg sm:text-xl font-semibold text-red-700 mb-3"
                style={fontStyles.featureTitle}
              >
                Economic Impact on Farmers:
              </h4>
              <ul className="list-disc list-inside text-gray-700 text-sm sm:text-base space-y-2" style={fontStyles.content}>
                <li>Higher water bills and pumping costs</li>
                <li>Reduced crop yields due to improper watering</li>
                <li>Increased labor costs for manual irrigation</li>
                <li>Crop loss from overwatering or underwatering</li>
                <li>Lower quality produce fetching reduced prices</li>
              </ul>
            </motion.div>
            <motion.div variants={itemVariants}>
              <h4 
                className="text-lg sm:text-xl font-semibold text-red-700 mb-3"
                style={fontStyles.featureTitle}
              >
                Environmental Impact:
              </h4>
              <ul className="list-disc list-inside text-gray-700 text-sm sm:text-base space-y-2" style={fontStyles.content}>
                <li>Water wastage contributing to resource depletion</li>
                <li>Soil degradation from erosion and nutrient leaching</li>
                <li>Groundwater contamination from fertilizer runoff</li>
                <li>Increased energy consumption for water pumping</li>
                <li>Reduced agricultural sustainability</li>
              </ul>
            </motion.div>
          </div>
        </motion.div>

        {/* Vision Section */}
        <motion.div
          ref={visionSection.ref}
          initial="hidden"
          animate={visionSection.inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-12 sm:mb-16 bg-gradient-to-r from-green-100 to-emerald-100 p-6 sm:p-8 lg:p-10 rounded-2xl shadow-lg"
        >
          <motion.h3 
            className="text-2xl sm:text-3xl lg:text-3xl font-bold text-green-800 text-center mb-6 sm:mb-8 leading-tight"
            style={fontStyles.sectionHeadline}
            variants={itemVariants}
          >
            Our Vision & Project Theme
          </motion.h3>
          <motion.p 
            className="text-gray-700 text-base sm:text-lg leading-relaxed text-center max-w-4xl mx-auto"
            style={fontStyles.content}
            variants={itemVariants}
          >
            Our Smart Irrigation System represents the convergence of agriculture and technology - "AgriTech". 
            We aim to democratize smart farming by making advanced irrigation technology accessible and 
            affordable for farmers of all scales. Our theme centers on{" "}
            <strong className="text-green-700" style={fontStyles.content}>Sustainability, Efficiency, and Empowerment</strong> - 
            creating a future where technology serves those who feed the world.
          </motion.p>
        </motion.div>

        {/* How It Works */}
        <motion.section
          ref={howItWorksSection.ref}
          initial="hidden"
          animate={howItWorksSection.inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-12 sm:mb-16"
        >
          <motion.h3 
            className="text-xl sm:text-2xl font-semibold text-green-800 mb-6 text-center"
            style={fontStyles.subHeadline}
            variants={itemVariants}
          >
            How It Works
          </motion.h3>
          <motion.p 
            className="text-gray-700 text-base sm:text-lg leading-relaxed text-center max-w-4xl mx-auto mb-8"
            style={fontStyles.content}
            variants={itemVariants}
          >
            Our system uses IoT sensors to monitor soil moisture, temperature, humidity, and sunlight in real-time. 
            Advanced AI algorithms analyze this data along with weather forecasts to determine the optimal watering 
            schedule for specific crops.
          </motion.p>
          
          {/* Process Steps */}
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-10">
            {[
              { step: "1", title: "Data Collection", desc: "IoT sensors gather real-time farm data", emoji: "📊" },
              { step: "2", title: "AI Analysis", desc: "Algorithms process data for optimal decisions", emoji: "🤖" },
              { step: "3", title: "Automated Action", desc: "System controls irrigation automatically", emoji: "🚀" }
            ].map((process, index) => (
              <motion.div
                key={process.step}
                className="bg-white p-4 sm:p-6 rounded-xl shadow-md text-center"
                variants={cardVariants}
                whileHover="hover"
                custom={index}
              >
                <motion.div 
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 text-white rounded-full flex items-center justify-center text-base sm:text-lg font-bold mx-auto mb-3 sm:mb-4"
                  style={fontStyles.button}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.2 + 0.5, type: "spring" }}
                >
                  {process.step}
                </motion.div>
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{process.emoji}</div>
                <h4 
                  className="text-lg sm:text-xl font-semibold text-green-700 mb-2"
                  style={fontStyles.featureTitle}
                >
                  {process.title}
                </h4>
                <p className="text-gray-600 text-sm sm:text-base" style={fontStyles.content}>{process.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Benefits */}
        <motion.section
          ref={benefitsSection.ref}
          initial="hidden"
          animate={benefitsSection.inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-12 sm:mb-16"
        >
          <motion.h3 
            className="text-xl sm:text-2xl font-semibold text-green-800 mb-6 sm:mb-8 text-center"
            style={fontStyles.subHeadline}
            variants={itemVariants}
          >
            Benefits
          </motion.h3>
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
            <motion.ul className="space-y-3 sm:space-y-4" variants={itemVariants}>
              {[
                "Save 30-50% water by watering only when necessary",
                "Reduce manual labor by up to 70% through automation",
                "Increase crop yield by 15-25% with optimal conditions",
                "Improve crop quality and consistency"
              ].map((benefit, index) => (
                <motion.li 
                  key={index}
                  className="flex items-center text-gray-700 text-base sm:text-lg"
                  style={fontStyles.content}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <motion.span 
                    className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0"
                    whileHover={{ scale: 1.2 }}
                  >
                    <span className="text-white text-xs sm:text-sm" style={fontStyles.button}>✓</span>
                  </motion.span>
                  {benefit}
                </motion.li>
              ))}
            </motion.ul>
            <motion.ul className="space-y-3 sm:space-y-4" variants={itemVariants}>
              {[
                "Remote monitoring via mobile or web applications",
                "Real-time alerts for abnormal conditions",
                "Data-driven insights for better decision making",
                "Reduced fertilizer and energy costs"
              ].map((benefit, index) => (
                <motion.li 
                  key={index}
                  className="flex items-center text-gray-700 text-base sm:text-lg"
                  style={fontStyles.content}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (index + 4) * 0.1 }}
                >
                  <motion.span 
                    className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0"
                    whileHover={{ scale: 1.2 }}
                  >
                    <span className="text-white text-xs sm:text-sm" style={fontStyles.button}>✓</span>
                  </motion.span>
                  {benefit}
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </motion.section>

        {/* Features */}
        <motion.section
          ref={featuresSection.ref}
          initial="hidden"
          animate={featuresSection.inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-12 sm:mb-16"
        >
          <motion.h3 
            className="text-xl sm:text-2xl font-semibold text-green-800 mb-6 sm:mb-8 text-center"
            style={fontStyles.subHeadline}
            variants={itemVariants}
          >
            Key Features
          </motion.h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { title: "Real-time Monitoring", desc: "Continuous tracking of soil conditions", emoji: "📱" },
              { title: "AI-Powered Scheduling", desc: "Intelligent adaptive algorithms", emoji: "🧠" },
              { title: "Automated Control", desc: "Hands-free irrigation management", emoji: "⚡" },
              { title: "Smart Alerts", desc: "Instant notifications for issues", emoji: "🔔" },
              { title: "User-Friendly Dashboard", desc: "Intuitive farm management interface", emoji: "🎛️" },
              { title: "Data Analytics", desc: "Historical insights for improvement", emoji: "📈" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white p-4 sm:p-6 rounded-xl shadow-md text-center border border-green-50"
                variants={cardVariants}
                whileHover="hover"
                custom={index}
              >
                <motion.div 
                  className="text-3xl sm:text-4xl mb-3 sm:mb-4"
                  animate={{ 
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.2
                  }}
                >
                  {feature.emoji}
                </motion.div>
                <h4 
                  className="text-lg sm:text-xl font-semibold text-green-700 mb-2"
                  style={fontStyles.featureTitle}
                >
                  {feature.title}
                </h4>
                <p className="text-gray-600 text-sm sm:text-base" style={fontStyles.content}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Project Scope */}
        <motion.section
          ref={scopeSection.ref}
          initial="hidden"
          animate={scopeSection.inView ? "visible" : "hidden"}
          variants={containerVariants}
          className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 sm:p-8 lg:p-10 rounded-2xl shadow-lg"
        >
          <motion.h3 
            className="text-xl sm:text-2xl font-semibold text-blue-800 mb-6 sm:mb-8 text-center"
            style={fontStyles.subHeadline}
            variants={itemVariants}
          >
            Project Scope & Future Enhancements
          </motion.h3>
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
            <motion.div variants={itemVariants}>
              <h4 
                className="text-lg sm:text-xl font-semibold text-blue-700 mb-3 sm:mb-4"
                style={fontStyles.featureTitle}
              >
                Current Implementation:
              </h4>
              <ul className="list-disc list-inside text-gray-700 text-sm sm:text-base space-y-2" style={fontStyles.content}>
                <li>Soil moisture-based automated irrigation</li>
                <li>Basic weather integration</li>
                <li>Web and mobile dashboard</li>
                <li>Manual override capabilities</li>
                <li>Basic alert system</li>
              </ul>
            </motion.div>
            <motion.div variants={itemVariants}>
              <h4 
                className="text-lg sm:text-xl font-semibold text-blue-700 mb-3 sm:mb-4"
                style={fontStyles.featureTitle}
              >
                Future Enhancements:
              </h4>
              <ul className="list-disc list-inside text-gray-700 text-sm sm:text-base space-y-2" style={fontStyles.content}>
                <li>Integration with drone imagery for crop health</li>
                <li>Predictive analytics for pest and disease control</li>
                <li>Multi-language support for wider accessibility</li>
                <li>Blockchain for supply chain transparency</li>
                <li>Expansion to fertigation (fertilizer + irrigation)</li>
              </ul>
            </motion.div>
          </div>
        </motion.section>
      </motion.section>

      {/* Floating CTA */}
      {!user && (
  <motion.div
    className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 z-50"
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 1, type: "spring" }}
  >
    <Link to="/login">
      <motion.button
        className="bg-green-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full shadow-lg flex items-center space-x-2 text-sm sm:text-base"
        style={fontStyles.button}
        whileHover={{ scale: 1.1, backgroundColor: "#16a34a" }}
        whileTap={{ scale: 0.9 }}
      >
        <span>Start Saving Water</span>
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          💧
        </motion.span>
      </motion.button>
    </Link>
  </motion.div>
)}
    </div>
  );
}

export default Home;