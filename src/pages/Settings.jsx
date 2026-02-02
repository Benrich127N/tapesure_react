import React, { useState,  } from "react";
import { auth } from "../../firebase";
import { updateProfile } from "firebase/auth";
import { User, Mail, Lock, Bell, Moon, Save } from "lucide-react";

const Settings = () => {
  const user = auth.currentUser;
  
  // State for form fields
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [email] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);

  // Preferences state
  const [darkMode, setDarkMode] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName
      });
      alert("Profile updated! Refresh to see changes in the Sidebar.");
    } catch (error) {
      console.error("Update failed", error);
      alert("Error updating profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage your account and app preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Account Settings */}
        <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <User className="text-indigo-400" size={20} /> Account
          </h2>

          <form onSubmit={handleUpdateAccount} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Full Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Email Address (Read Only)</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-500 cursor-not-allowed"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-lg text-white font-medium transition active:scale-95 flex items-center gap-2"
            >
              <Save size={18} /> {loading ? "Saving..." : "Save Name"}
            </button>
          </form>
        </div>

        {/* Preferences */}
        <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Moon className="text-indigo-400" size={20} /> Preferences
          </h2>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Dark Mode</span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-all ${
                  darkMode ? "bg-indigo-600" : "bg-gray-600"
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${darkMode ? "translate-x-6" : ""}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-300">Email Notifications</span>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={() => setEmailNotifications(!emailNotifications)}
                className="w-5 h-5 accent-indigo-600 rounded bg-gray-800 border-gray-700"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-300">SMS Notifications</span>
              <input
                type="checkbox"
                checked={smsNotifications}
                onChange={() => setSmsNotifications(!smsNotifications)}
                className="w-5 h-5 accent-indigo-600 rounded bg-gray-800 border-gray-700"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;