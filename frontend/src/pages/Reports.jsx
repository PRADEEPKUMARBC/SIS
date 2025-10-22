import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { toast } from "react-hot-toast";

function Reports() {
  const { axios } = useAppContext();
  const [selectedPeriod, setSelectedPeriod] = useState("weekly");
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [stats, setStats] = useState(null);

  // Mock data as fallback
  const mockReportData = {
    weekly: {
      waterUsed: 150,
      irrigations: 2,
      efficiency: 17,
      savings: 30,
      previousWaterUsed: 180,
      previousIrrigations: 3,
      recommendations: [
        "Reduced irrigation due to rainfall",
        "Optimal soil moisture maintained",
        "Water savings achieved through smart scheduling"
      ]
    },
    monthly: {
      waterUsed: 650,
      irrigations: 8,
      efficiency: 22,
      savings: 180,
      previousWaterUsed: 830,
      previousIrrigations: 12,
      recommendations: [
        "Adjusted schedule for seasonal changes",
        "Implemented moisture-based irrigation",
        "Reduced water waste by 22%"
      ]
    },
    yearly: {
      waterUsed: 7200,
      irrigations: 95,
      efficiency: 35,
      savings: 3800,
      previousWaterUsed: 11000,
      previousIrrigations: 140,
      recommendations: [
        "Annual water savings: 3,800L",
        "Smart system optimization successful",
        "Consistent efficiency improvements"
      ]
    }
  };

  // Fetch irrigation stats from backend
  const fetchIrrigationStats = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/irrigation/stats');
      
      if (response.data.success) {
        setStats(response.data);
        // Transform API data to match our frontend structure
        transformApiData(response.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching irrigation stats:', error);
      toast.error('Using demo data - ' + (error.response?.data?.message || 'Failed to load reports'));
      // Use mock data as fallback
      setReportData(mockReportData);
    } finally {
      setIsLoading(false);
    }
  };

  // Transform API data to match frontend structure
  const transformApiData = (apiData) => {
    const { stats, dailyStats } = apiData;
    
    // Calculate different periods based on daily stats
    const weeklyData = calculatePeriodData(dailyStats, 7);
    const monthlyData = calculatePeriodData(dailyStats, 30);
    const yearlyData = calculateYearlyData(stats);

    const transformedData = {
      weekly: weeklyData,
      monthly: monthlyData,
      yearly: yearlyData
    };

    setReportData(transformedData);
  };

  // Calculate data for a specific period
  const calculatePeriodData = (dailyStats, days) => {
    const recentDays = dailyStats.slice(-days);
    
    const waterUsed = recentDays.reduce((sum, day) => sum + (day.waterUsed || 0), 0);
    const waterSaved = recentDays.reduce((sum, day) => sum + (day.waterSaved || 0), 0);
    const irrigations = recentDays.reduce((sum, day) => sum + (day.irrigations || 0), 0);
    
    // Calculate previous period for comparison
    const previousDays = dailyStats.slice(-days * 2, -days);
    const previousWaterUsed = previousDays.reduce((sum, day) => sum + (day.waterUsed || 0), 0) || waterUsed * 1.2;
    const previousIrrigations = previousDays.reduce((sum, day) => sum + (day.irrigations || 0), 0) || irrigations * 1.5;
    
    const efficiency = previousWaterUsed > 0 ? Math.round(((previousWaterUsed - waterUsed) / previousWaterUsed) * 100) : 0;

    return {
      waterUsed: Math.round(waterUsed),
      irrigations,
      efficiency: Math.max(0, efficiency),
      savings: Math.round(waterSaved),
      previousWaterUsed: Math.round(previousWaterUsed),
      previousIrrigations,
      recommendations: generateRecommendations(waterUsed, waterSaved, efficiency)
    };
  };

  // Calculate yearly data
  const calculateYearlyData = (stats) => {
    const waterUsed = stats.totalWaterUsed || 0;
    const waterSaved = stats.totalWaterSaved || 0;
    const irrigations = stats.totalIrrigations || 0;
    
    // Estimate yearly data based on 30-day stats
    const yearlyMultiplier = 12; // Approximate for demo
    const yearlyWaterUsed = waterUsed * yearlyMultiplier;
    const yearlyWaterSaved = waterSaved * yearlyMultiplier;
    const yearlyIrrigations = irrigations * yearlyMultiplier;
    
    const previousYearWaterUsed = yearlyWaterUsed * 1.3; // Estimate 30% more for previous year
    const previousYearIrrigations = yearlyIrrigations * 1.4; // Estimate 40% more irrigations
    
    const efficiency = Math.round(((previousYearWaterUsed - yearlyWaterUsed) / previousYearWaterUsed) * 100);

    return {
      waterUsed: Math.round(yearlyWaterUsed),
      irrigations: Math.round(yearlyIrrigations),
      efficiency: Math.max(0, efficiency),
      savings: Math.round(yearlyWaterSaved),
      previousWaterUsed: Math.round(previousYearWaterUsed),
      previousIrrigations: Math.round(previousYearIrrigations),
      recommendations: generateRecommendations(yearlyWaterUsed, yearlyWaterSaved, efficiency, true)
    };
  };

  // Generate smart recommendations based on data
  const generateRecommendations = (waterUsed, waterSaved, efficiency, isYearly = false) => {
    const recommendations = [];

    if (efficiency > 20) {
      recommendations.push("Excellent water efficiency maintained");
    } else if (efficiency > 10) {
      recommendations.push("Good efficiency - continue current practices");
    } else {
      recommendations.push("Consider optimizing irrigation schedules");
    }

    if (waterSaved > 100) {
      recommendations.push(`Significant water conservation: ${Math.round(waterSaved)}L saved`);
    }

    if (efficiency > 15) {
      recommendations.push("Smart irrigation system performing optimally");
    }

    if (isYearly) {
      recommendations.push("Annual review completed - system operating efficiently");
      recommendations.push("Consider expanding smart irrigation to other areas");
    } else {
      recommendations.push("Regular monitoring shows consistent performance");
    }

    return recommendations.slice(0, 3); // Return top 3 recommendations
  };

  // Fetch data when component mounts or period changes
  useEffect(() => {
    fetchIrrigationStats();
  }, []);

  // Use current data or fallback to mock data
  const currentData = reportData?.[selectedPeriod] || mockReportData[selectedPeriod];

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
      scale: 1.02,
      boxShadow: "0px 10px 30px rgba(0,0,0,0.1)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const handleRefresh = () => {
    fetchIrrigationStats();
    toast.success('Reports data refreshed!');
  };

  if (isLoading && !reportData) {
    return (
      <div className="p-8 bg-green-50 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full mx-auto mb-4"
          />
          <p className="text-green-700 text-lg">Loading reports...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-green-50 to-blue-50 min-h-screen">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-center mb-4 gap-4">
            <h1 className="text-4xl font-bold text-green-800 mb-3">
              Smart Irrigation Analytics
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isLoading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <span>🔄</span>
              {isLoading ? 'Refreshing...' : 'Refresh Data'}
            </motion.button>
          </div>
          <p className="text-green-600 text-lg">
            Comprehensive reports and performance insights for your irrigation system
          </p>
          {stats && (
            <p className="text-green-700 font-semibold mt-2">
              📊 Data for last {stats.period || '30 days'}
            </p>
          )}
        </motion.div>

        {/* Period Selector */}
        <motion.div variants={itemVariants} className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-2 inline-flex">
            {["weekly", "monthly", "yearly"].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  selectedPeriod === period
                    ? "bg-green-500 text-white shadow-md"
                    : "text-gray-600 hover:text-green-600"
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Key Metrics Card */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-green-700 mb-6 flex items-center">
              <span className="mr-2">📊</span>
              Key Performance Metrics
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={itemVariants} className="bg-green-50 p-4 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-green-600 font-semibold">Water Used</span>
                  <span className="text-2xl font-bold text-green-700">
                    {currentData.waterUsed.toLocaleString()}
                    {selectedPeriod === 'yearly' ? 'L' : 'L'}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Previous: {currentData.previousWaterUsed.toLocaleString()}L
                </div>
                <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((currentData.waterUsed / currentData.previousWaterUsed) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-green-500 h-2 rounded-full"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-blue-50 p-4 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-blue-600 font-semibold">Irrigation Sessions</span>
                  <span className="text-2xl font-bold text-blue-700">
                    {currentData.irrigations.toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Previous: {currentData.previousIrrigations.toLocaleString()}
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((currentData.irrigations / currentData.previousIrrigations) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: 0.7 }}
                    className="bg-blue-500 h-2 rounded-full"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-yellow-50 p-4 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-yellow-600 font-semibold">Efficiency Improvement</span>
                  <span className="text-2xl font-bold text-yellow-700">
                    +{currentData.efficiency}%
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Compared to previous period
                </div>
                <div className="w-full bg-yellow-200 rounded-full h-2 mt-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(currentData.efficiency, 100)}%` }}
                    transition={{ duration: 1, delay: 0.9 }}
                    className="bg-yellow-500 h-2 rounded-full"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-purple-50 p-4 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-purple-600 font-semibold">Water Savings</span>
                  <span className="text-2xl font-bold text-purple-700">
                    {currentData.savings.toLocaleString()}L
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Total water conserved
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((currentData.savings / currentData.previousWaterUsed) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: 1.1 }}
                    className="bg-purple-500 h-2 rounded-full"
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Efficiency Card */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="bg-gradient-to-br from-green-500 to-blue-500 text-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <span className="mr-2">🌿</span>
              Efficiency Score
            </h2>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="text-center my-8"
            >
              <div className="relative inline-block">
                <motion.div
                  initial={{ strokeDashoffset: 283 }}
                  animate={{ strokeDashoffset: 283 - (283 * currentData.efficiency) / 100 }}
                  transition={{ duration: 2, delay: 0.5 }}
                  className="w-32 h-32"
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="white"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray="283"
                      initial={{ strokeDashoffset: 283 }}
                      animate={{ strokeDashoffset: 283 - (283 * currentData.efficiency) / 100 }}
                      transition={{ duration: 2, delay: 0.5 }}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                </motion.div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">{currentData.efficiency}%</span>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center">
              <p className="text-lg font-semibold mb-2">
                {currentData.efficiency >= 20 ? "Excellent Performance! 🎉" : 
                 currentData.efficiency >= 10 ? "Good Performance! 👍" : 
                 "Needs Improvement 📈"}
              </p>
              <p className="text-green-100 text-sm">
                Your irrigation system is operating {currentData.efficiency}% more efficiently than previous period
              </p>
            </motion.div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recommendations Card */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center">
              <span className="mr-2">💡</span>
              Smart Recommendations
            </h2>
            
            <motion.div variants={containerVariants} className="space-y-4">
              {currentData.recommendations.map((recommendation, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="flex items-start p-4 bg-green-50 rounded-lg"
                >
                  <span className="text-green-500 mr-3 mt-1">✓</span>
                  <p className="text-gray-700">{recommendation}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
            >
              <p className="text-blue-700 font-semibold flex items-center">
                <span className="mr-2">🚀</span>
                Next Step Optimization
              </p>
              <p className="text-blue-600 text-sm mt-1">
                {currentData.efficiency >= 20 
                  ? "Consider integrating weather forecasting for predictive irrigation"
                  : "Review irrigation schedules and consider soil moisture sensor integration"
                }
              </p>
            </motion.div>
          </motion.div>

          {/* Environmental Impact Card */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center">
              <span className="mr-2">🌍</span>
              Environmental Impact
            </h2>
            
            <motion.div variants={containerVariants} className="space-y-4">
              <motion.div variants={itemVariants} className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <span className="text-green-600">Water Conserved</span>
                <span className="font-bold text-green-700">
                  {currentData.savings.toLocaleString()} Liters
                </span>
              </motion.div>
              
              <motion.div variants={itemVariants} className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <span className="text-blue-600">Energy Saved</span>
                <span className="font-bold text-blue-700">
                  {Math.round(currentData.savings * 0.002).toLocaleString()} kWh
                </span>
              </motion.div>
              
              <motion.div variants={itemVariants} className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <span className="text-purple-600">CO₂ Reduction</span>
                <span className="font-bold text-purple-700">
                  {Math.round(currentData.savings * 0.0003).toLocaleString()} kg
                </span>
              </motion.div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200"
            >
              <p className="text-yellow-700 text-sm">
                💡 <strong>Did you know?</strong> Your water savings are equivalent to filling {Math.round(currentData.savings / 150).toLocaleString()} standard bathtubs!
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Data Source Info */}
        <motion.div
          variants={cardVariants}
          className="mt-6 bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-700">Data Source</h3>
              <p className="text-gray-600 text-sm">
                {stats 
                  ? `Real irrigation data from your system (Last ${stats.period})`
                  : 'Demo data - Connect your irrigation system for real-time analytics'
                }
              </p>
            </div>
            <div className="text-right">
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                stats 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {stats ? 'Live Data' : 'Demo Mode'}
              </div>
              <p className="text-gray-500 text-xs mt-1">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Reports;