import React from 'react'

const SystemStatus = () => {
  const status = {
    system: "online",
    sensors: "8/8 active",
    pumps: "standby",
    connectivity: "stable"
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">System Status</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Overall System</span>
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Online</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Sensors</span>
          <span className="text-green-600 font-medium">8/8 Active</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Pump Status</span>
          <span className="text-blue-600 font-medium">Standby</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Connectivity</span>
          <span className="text-green-600 font-medium">Stable</span>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus