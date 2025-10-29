import React, { useState } from "react";

const Settings = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  return (
    <div className="p-6 min-h-screen bg-gray-950 text-gray-200">
      {/* Page Header */}
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

      {/* Settings Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Account Settings */}
        <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">Account</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="john.doe@example.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <button className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-white font-medium transition-colors duration-200">
              Save Changes
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">Preferences</h2>

          <div className="space-y-6">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between">
              <span>Dark Mode</span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-all ${
                  darkMode ? "bg-indigo-500" : "bg-gray-600"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    darkMode ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>

            {/* Email Notifications */}
            <div className="flex items-center justify-between">
              <span>Email Notifications</span>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={() => setEmailNotifications(!emailNotifications)}
                className="w-5 h-5 accent-indigo-500"
              />
            </div>

            {/* SMS Notifications */}
            <div className="flex items-center justify-between">
              <span>SMS Notifications</span>
              <input
                type="checkbox"
                checked={smsNotifications}
                onChange={() => setSmsNotifications(!smsNotifications)}
                className="w-5 h-5 accent-indigo-500"
              />
            </div>
          </div>

          <button className="mt-6 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-white font-medium transition-colors duration-200">
            Update Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
