import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useContext } from "react";
import { useAppContext } from "../context/AppContext"; // Adjust path as needed
import { toast } from "react-hot-toast"

function Settings() {
  const { axios, user, token } = useAppContext();
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("connection");
  const [formData, setFormData] = useState({
    deviceId: "",
    deviceName: "",
    fieldSize: "",
    cropType: "",
    soilType: "loam",
    irrigationDuration: 30,
    moistureThreshold: 60,
    automation: true,
    notifications: true
  });
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState("");
  

  const cropTypes = [
    "Wheat", "Corn", "Rice", "Cotton", "Soybean", 
    "Vegetables", "Fruits", "Flowers", "Pasture", "Other"
  ];

  const soilTypes = [
    { value: "sand", label: "Sandy Soil", description: "Fast drainage" },
    { value: "loam", label: "Loam Soil", description: "Well balanced" },
    { value: "clay", label: "Clay Soil", description: "Slow drainage" },
    { value: "silt", label: "Silt Soil", description: "Moisture retentive" }
  ];

  // Animation variants (keep your existing variants)
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

  const tabVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  // Fetch devices from backend
  useEffect(() => {
    fetchDevices();
    fetchFarms();
  }, []);

  const fetchDevices = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/devices');
      if (response.data.success) {
        setDevices(response.data.devices);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      // Fallback to mock data if API fails
      setDevices(getMockDevices());
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFarms = async () => {
    try {
      // Assuming you have a farms endpoint
      const response = await axios.get('/api/farms');
      if (response.data.success) {
        setFarms(response.data.farms);
        if (response.data.farms.length > 0) {
          setSelectedFarm(response.data.farms[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching farms:', error);
      // Set default farms for demo
      setFarms([
  { _id: "1", name: "Main Farm" },
  { _id: "2", name: "North Field" },
  { _id: "3", name: "South Field" },
  { _id: "4", name: "East Orchard" },
  { _id: "5", name: "West Greenhouse" },
  { _id: "6", name: "River Side Farm" },
  { _id: "7", name: "Hill Top Farm" },
  { _id: "8", name: "Valley Plantation" },
  { _id: "9", name: "Sunny Acres" },
  { _id: "10", name: "Harvest Garden" },
]);

    }
  };

  const getMockDevices = () => [
    {
      _id: "IRR-001",
      name: "Main Field Sensor",
      status: "online",
      battery: { level: 85 },
      signalStrength: "excellent",
      lastSeen: new Date(Date.now() - 2 * 60 * 1000).toISOString()
    },
    {
      _id: "IRR-002",
      name: "North Section",
      status: "online",
      battery: { level: 45 },
      signalStrength: "good",
      lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    },
    {
      _id: "IRR-003",
      name: "Greenhouse Unit",
      status: "offline",
      battery: { level: 0 },
      signalStrength: "poor",
      lastSeen: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleConnectDevice = async () => {
    if (!formData.deviceId) {
      toast.error("Please enter a Device ID");
      return;
    }

    if (!selectedFarm) {
      toast.error("Please select a farm");
      return;
    }

    try {
      setIsLoading(true);
      
      const deviceData = {
        deviceId: formData.deviceId,
        name: formData.deviceName || `Device ${formData.deviceId}`,
        farm: selectedFarm,
        type: "sensor",
        configuration: {
          irrigationDuration: formData.irrigationDuration,
          moistureThreshold: formData.moistureThreshold,
          automation: formData.automation,
          cropType: formData.cropType?.toLowerCase() || 'vegetables',
          soilType: formData.soilType
        }
      };

      const response = await axios.post('/api/devices', deviceData);
      
      if (response.data.success) {
        // Refresh devices list
        await fetchDevices();
        setFormData(prev => ({ ...prev, deviceId: "", deviceName: "" }));
        
        // Show success message
        toast.success("Device connected successfully!");
      }
    } catch (error) {
      console.error('Error connecting device:', error);
      toast.error(error.response?.data?.message || "Failed to connect device");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);
      
      // Here you would typically save the global settings
      // For now, we'll just show a success message
      
      setTimeout(() => {
        setIsLoading(false);
        toast.success("Settings saved successfully!");
      }, 1000);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error("Failed to save settings");
      setIsLoading(false);
    }
  };

  const handleUpdateDevice = async (deviceId, updates) => {
    try {
      const response = await axios.put(`/api/devices/${deviceId}`, updates);
      if (response.data.success) {
        await fetchDevices(); // Refresh the list
        toast.success("Device updated successfully!");
      }
    } catch (error) {
      console.error('Error updating device:', error);
      toast.error(error.response?.data?.message || "Failed to update device");
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    if (!window.confirm("Are you sure you want to delete this device?")) {
      return;
    }

    try {
      const response = await axios.delete(`/api/devices/${deviceId}`);
      if (response.data.success) {
        await fetchDevices(); // Refresh the list
        toast.success("Device deleted successfully!");
      }
    } catch (error) {
      console.error('Error deleting device:', error);
      toast.error(error.response?.data?.message || "Failed to delete device");
    }
  };

  const handleSendCommand = async (deviceId, command) => {
    try {
      const response = await axios.post(`/api/devices/${deviceId}/command`, command);
      if (response.data.success) {
        toast.success("Command sent successfully!");
      }
    } catch (error) {
      console.error('Error sending command:', error);
      toast.error(error.response?.data?.message || "Failed to send command");
    }
  };

  const getSignalIcon = (signal) => {
    switch (signal) {
      case "excellent": return "📶";
      case "good": return "📶";
      case "fair": return "📶";
      case "poor": return "📵";
      default: return "❓";
    }
  };

  const getBatteryIcon = (level) => {
    if (level >= 80) return "🔋";
    if (level >= 60) return "🔋";
    if (level >= 40) return "🔋";
    if (level >= 20) return "🪫";
    return "🪫";
  };

  const formatLastSeen = (timestamp) => {
    const now = new Date();
    const lastSeen = new Date(timestamp);
    const diffInMinutes = Math.floor((now - lastSeen) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  if (isLoading) {
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
          <p className="text-green-700 text-lg">Loading settings...</p>
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
          <h1 className="text-4xl font-bold text-green-800 mb-3">
            Smart Irrigation Settings
          </h1>
          <p className="text-green-600 text-lg">
            Configure your IoT devices and optimize irrigation parameters
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mb-8">
          {[
            { id: "connection", label: "Device Connection", icon: "🔗" },
            { id: "configuration", label: "Field Configuration", icon: "⚙️" },
            { id: "automation", label: "Automation", icon: "🤖" },
            { id: "devices", label: "Connected Devices", icon: "📱" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-white text-gray-600 hover:text-green-600"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Device Connection Tab */}
          {activeTab === "connection" && (
            <motion.div
              key="connection"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <motion.div
                variants={cardVariants}
                whileHover="hover"
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h2 className="text-2xl font-bold text-green-700 mb-6 flex items-center">
                  <span className="mr-2">🔗</span>
                  Connect New Device
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Farm
                    </label>
                    <select
                        value={selectedFarm}
                        onChange={(e) => setSelectedFarm(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select a Farm</option>
                        <option value="1">Main Farm</option>
                        <option value="2">North Field</option>
                        <option value="3">South Field</option>
                        <option value="4">East Orchard</option>
                        <option value="5">West Greenhouse</option>
                        <option value="6">River Side Farm</option>
                        <option value="7">Hill Top Farm</option>
                        <option value="8">Valley Plantation</option>
                        <option value="9">Sunny Acres</option>
                        <option value="10">Harvest Garden</option>
                      </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Device ID *
                    </label>
                    <input
                      type="text"
                      name="deviceId"
                      value={formData.deviceId}
                      onChange={handleInputChange}
                      placeholder="Enter Device ID (e.g., IRR-001)"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Device Name
                    </label>
                    <input
                      type="text"
                      name="deviceName"
                      value={formData.deviceName}
                      onChange={handleInputChange}
                      placeholder="Give your device a name"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleConnectDevice}
                    disabled={isLoading}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? "Connecting..." : "Connect Device"}
                  </motion.button>
                </div>
              </motion.div>

              {/* Connection Guide (keep your existing component) */}
              <motion.div
                variants={cardVariants}
                whileHover="hover"
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center">
                  <span className="mr-2">📋</span>
                  Connection Guide
                </h2>

                <div className="space-y-4">
                  <motion.div variants={itemVariants} className="flex items-start p-4 bg-blue-50 rounded-lg">
                    <span className="text-blue-500 text-2xl mr-3">1</span>
                    <div>
                      <p className="font-semibold text-blue-700">Locate Device ID</p>
                      <p className="text-blue-600 text-sm">Find the 6-character ID on your IoT device</p>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex items-start p-4 bg-green-50 rounded-lg">
                    <span className="text-green-500 text-2xl mr-3">2</span>
                    <div>
                      <p className="font-semibold text-green-700">Enter Device Details</p>
                      <p className="text-green-600 text-sm">Provide device ID and a descriptive name</p>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex items-start p-4 bg-purple-50 rounded-lg">
                    <span className="text-purple-500 text-2xl mr-3">3</span>
                    <div>
                      <p className="font-semibold text-purple-700">Configure Settings</p>
                      <p className="text-purple-600 text-sm">Set up field parameters and automation rules</p>
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  variants={itemVariants}
                  className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                >
                  <p className="text-yellow-700 text-sm">
                    💡 <strong>Tip:</strong> Ensure your IoT device is powered on and within WiFi range before connecting.
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {/* Field Configuration Tab (keep your existing component) */}
          {activeTab === "configuration" && (
            <motion.div
              key="configuration"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Your existing configuration UI */}
            </motion.div>
          )}

          {/* Connected Devices Tab */}
          {activeTab === "devices" && (
            <motion.div
              key="devices"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <motion.div
                variants={cardVariants}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h2 className="text-2xl font-bold text-green-700 mb-6 flex items-center">
                  <span className="mr-2">📱</span>
                  Connected Devices ({devices.filter(d => d.status === 'online').length}/{devices.length})
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {devices.map((device) => (
                    <motion.div
                      key={device._id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.05 }}
                      className={`p-4 rounded-xl border-2 ${
                        device.status === 'online' 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-gray-800">{device.name}</h3>
                          <p className="text-sm text-gray-600">{device.deviceId}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          device.status === 'online' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {device.status}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Battery:</span>
                          <span className="flex items-center">
                            {getBatteryIcon(device.battery?.level || 0)} {device.battery?.level || 0}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Signal:</span>
                          <span>{getSignalIcon(device.signalStrength)} {device.signalStrength}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Seen:</span>
                          <span>{formatLastSeen(device.lastSeen)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Farm:</span>
                          <span>{device.farm}</span>
                        </div>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button 
                          onClick={() => handleUpdateDevice(device._id, { 
                            name: prompt("Enter new device name:", device.name) || device.name 
                          })}
                          className="flex-1 bg-blue-500 text-white py-1 px-3 rounded text-sm hover:bg-blue-600"
                        >
                          Configure
                        </button>
                        <button 
                          onClick={() => handleDeleteDevice(device._id)}
                          className="flex-1 bg-red-500 text-white py-1 px-3 rounded text-sm hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save Settings Button */}
        {(activeTab === "connection" || activeTab === "configuration" || activeTab === "automation") && (
          <motion.div
            variants={itemVariants}
            className="mt-6 text-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveSettings}
              disabled={isLoading}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "💾 Save All Settings"}
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default Settings; 