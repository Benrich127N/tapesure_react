// src/components/Topbar.jsx
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { auth } from "../../firebase";
import { Bell, Plus, Search } from "lucide-react"; // Switched to lucide-react 
// import { useState } from "react";
import { useState } from "react";



const Topbar = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");


const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    

    // If user is NOT on the outfits page, send them there with the search query
    if (window.location.pathname !== "/outfits" && val.length > 0) {
      navigate(`/outfits?q=${val}`);
    } else {
      setSearchParams(val ? { q: val } : {});
    }
    // Update the URL immediately as you type
    // This adds ?q=name to your address bar
    if (val) {
      setSearchParams({ q: val });
    } else {
      setSearchParams({});
    }
  };


  return (
    <header className="flex justify-between items-center bg-black border-b border-gray-900 px-6 py-4 sticky top-0 z-10">
      {/* Search Bar Area */}
      <div className="relative w-1/3">
      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
        <Search size={18} />
      </span>
      <input
        type="text"
        placeholder="Search projects or clients..."
        value={query}
        onChange={handleSearch}
        className="w-full bg-gray-900 text-white placeholder-gray-500 border border-gray-800 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
      />
    </div>

      {/* Action Area */}
      <div className="flex items-center space-x-6">
        {/* Quick Add Button */}
        <button 
          onClick={() => navigate("/outfits/new")}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-500 transition active:scale-95 shadow-lg shadow-indigo-500/20 font-medium text-sm"
        >
          <Plus size={18} /> Add Order
        </button>

        {/* Notifications */}
        <div className="relative cursor-pointer text-gray-400 hover:text-white transition">
          <Bell size={22} />
          <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full border-2 border-black"></span>
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-3 border-l border-gray-800 pl-6">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-white">
              {user?.displayName || "Tailor"}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">
              Pro Account
            </p>
          </div>
          <div 
            onClick={() => navigate("/settings")}
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 cursor-pointer hover:opacity-80 transition"
          >
            <div className="bg-black w-full h-full rounded-full flex items-center justify-center text-xs font-bold text-white uppercase">
              {user?.email?.charAt(0) || "U"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;