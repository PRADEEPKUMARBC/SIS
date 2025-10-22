import React from 'react'

import { motion } from "framer-motion";

const QuickActions = () => {
  const actions = [
    { icon: "🚰", label: "Start Irrigation", action: "start", color: "green" },
    { icon: "⏸️", label: "Pause System", action: "pause", color: "yellow" },
    { icon: "📊", label: "Generate Report", action: "report", color: "blue" },
    { icon: "🔔", label: "Test Alerts", action: "alerts", color: "purple" }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((action, index) => (
          <motion.button
            key={action.label}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-3 rounded-xl bg-${action.color}-50 border border-${action.color}-200 text-${action.color}-700 hover:bg-${action.color}-100 transition-colors`}
          >
            <div className="text-2xl mb-1">{action.icon}</div>
            <span className="text-sm font-medium">{action.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions