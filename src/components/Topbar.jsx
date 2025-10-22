// src/components/Topbar.jsx
import { FaBell, FaPlus } from "react-icons/fa";

const Topbar = () => {
  return (
    <header className="flex justify-between items-center bg-white shadow px-6 py-4">
      <input
        type="text"
        placeholder="Search..."
        className="border rounded-lg px-4 py-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <div className="flex items-center space-x-6">
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition">
          <FaPlus /> Add New
        </button>
        <FaBell className="text-gray-500 text-xl cursor-pointer" />
        <div className="flex items-center space-x-2">
          <img
            src="https://i.pravatar.cc/40"
            alt="User"
            className="rounded-full w-8 h-8"
          />
          <div>
            <p className="text-sm font-semibold">John Doe</p>
            <p className="text-xs text-gray-500">Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
