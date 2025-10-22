import React from 'react'

// components/WaterUsageCard.jsx
const WaterUsageCard = ({ today, weekly, saved, efficiency }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Water Usage</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{today}</div>
          <div className="text-sm text-blue-800">Today</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{saved}</div>
          <div className="text-sm text-green-800">Water Saved</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{weekly}</div>
          <div className="text-sm text-purple-800">This Week</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{efficiency}</div>
          <div className="text-sm text-yellow-800">Efficiency</div>
        </div>
      </div>
    </div>
  );
};

export default WaterUsageCard