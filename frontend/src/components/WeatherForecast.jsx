import React from 'react'

// components/WeatherForecast.jsx
const WeatherForecast = ({ data }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">3-Day Forecast</h3>
      <div className="space-y-4">
        {data.map((day, index) => (
          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <span className="text-3xl">{day.icon}</span>
              <div>
                <div className="font-semibold text-gray-800">{day.day}</div>
                <div className="text-sm text-gray-600">{day.condition}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-800 text-lg">{day.temp}</div>
              <div className="text-sm text-blue-600 font-medium">{day.rain} rain</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherForecast