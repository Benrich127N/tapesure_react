import React from "react";

const Settings = () => {
  return (
    <div className="flex min-h-screen bg-black text-white p-8">
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg max-w-2xl">
          <form className="space-y-6">
            <div>
              <label className="block text-gray-300 text-sm mb-2">Company Name</label>
              <input
                type="text"
                placeholder="Enter company name"
                className="w-full bg-gray-800 text-white rounded-md p-3 border border-gray-700 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-2">Email</label>
              <input
                type="email"
                placeholder="Enter email"
                className="w-full bg-gray-800 text-white rounded-md p-3 border border-gray-700 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-2">Password</label>
              <input
                type="password"
                placeholder="Enter password"
                className="w-full bg-gray-800 text-white rounded-md p-3 border border-gray-700 focus:border-indigo-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
