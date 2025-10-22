import { motion } from "framer-motion";

const SensorCard = ({ title, value, optimal, status, icon, aiPrediction }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'optimal': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white rounded-2xl shadow-lg p-6 border-2 border-transparent hover:border-green-300 transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>
      
      <div className="text-3xl font-bold text-green-700 mb-2">{value}</div>
      <p className="text-sm text-gray-600 mb-2">Optimal: {optimal}</p>
      
      {aiPrediction && (
        <div className="flex items-center gap-2 mt-3 p-2 bg-blue-50 rounded-lg">
          <span className="text-sm">🤖</span>
          <span className="text-xs text-blue-700">{aiPrediction}</span>
        </div>
      )}
    </motion.div>
  );
};

export default SensorCard;