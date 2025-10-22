import { motion } from "framer-motion";
import { useState } from "react";

const IrrigationControl = ({ 
  status, 
  nextSchedule, 
  duration, 
  zone, 
  waterAmount, 
  efficiency, 
  aiEnabled,
  onStartNow,
  onSettings,
  loading = false
}) => {
  const [currentStatus, setCurrentStatus] = useState(status);

  const handleStartNow = () => {
    if (onStartNow) {
      onStartNow();
    } else {
      console.log("Start irrigation manually");
      // Fallback action
    }
  };

  const handleSettings = () => {
    if (onSettings) {
      onSettings();
    } else {
      console.log("Open settings");
      // Fallback action
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Irrigation Control</h3>
        {aiEnabled && (
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <span>🤖</span>
            AI Powered
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* Current Mode */}
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-600">Current Mode</span>
          <span className="font-semibold text-green-600 capitalize">{currentStatus}</span>
        </div>

        {/* Next Schedule */}
        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
          <span className="text-gray-600">Next Schedule</span>
          <span className="font-semibold text-blue-600">{nextSchedule}</span>
        </div>

        {/* Duration */}
        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
          <span className="text-gray-600">Duration</span>
          <span className="font-semibold text-green-600">{duration}</span>
        </div>

        {/* Active Zone */}
        <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
          <span className="text-gray-600">Active Zone</span>
          <span className="font-semibold text-yellow-600">{zone}</span>
        </div>

        {/* Water Amount */}
        {waterAmount && (
          <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
            <span className="text-gray-600">Water Amount</span>
            <span className="font-semibold text-purple-600">{waterAmount}</span>
          </div>
        )}

        {/* Efficiency */}
        {efficiency && (
          <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
            <span className="text-gray-600">Efficiency</span>
            <span className="font-semibold text-indigo-600">{efficiency}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStartNow}
          disabled={loading}
          className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <span>🚰</span>
              Start Now
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSettings}
          className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
        >
          <span>⚙️</span>
          Settings
        </motion.button>
      </div>
    </motion.div>
  );
};

export default IrrigationControl;