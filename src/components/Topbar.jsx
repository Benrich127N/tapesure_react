// src/components/Topbar.jsx
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { auth } from "../../firebase";
import { Plus, Search, Menu } from "lucide-react"; // Added Menu icon
import { useState } from "react";

const Topbar = ({ onMenuClick }) => { // Add this prop
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    
    if (window.location.pathname !== "/outfits" && val.length > 0) {
      navigate(`/outfits?q=${val}`);
    } else {
      setSearchParams(val ? { q: val } : {});
    }
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 sm:px-6 lg:px-8 shrink-0 z-10">
      <div className="flex items-center justify-between gap-3">
        
        {/* Mobile Menu Button + Search Bar */}
        <div className="flex items-center gap-3 min-w-0 flex-1 max-w-lg">
          {/* Hamburger Menu - Only visible on mobile */}
          <button
            onClick={onMenuClick}
            aria-controls="workspace-navigation"
            className="lg:hidden text-gray-400 hover:text-white transition p-2"
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>

          {/* Search Bar */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
              <Search size={18} />
            </span>
            <input
              type="text"
              aria-label="Search orders"
              placeholder="Search orders..."
              value={query}
              onChange={handleSearch}
              className="w-full bg-gray-900 text-white placeholder-gray-500 border border-gray-800 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Action Area */}
        <div className="flex items-center justify-end shrink-0 gap-2 sm:gap-4">
          
          {/* Quick Add Button */}
          <button
            onClick={() => navigate("/outfits/new")}
            aria-label="New order"
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-500 transition active:scale-95  font-medium text-sm"
          >
            <Plus size={18} /> <span className="hidden sm:inline">New Order</span>
          </button>

          {/* Notifications */}
          {/* <div className="relative cursor-pointer text-gray-400 hover:text-white transition">
            <Bell size={22} />
            <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full border-2 border-black"></span>
          </div> */}

          {/* User Info */}
          <div className="flex items-center space-x-3 sm:border-l border-gray-800 sm:pl-4">
            <div className="text-right hidden xl:block">
              <p className="text-sm font-semibold text-white">
                {user?.displayName || "Tailor"}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">
                Pro Account
              </p>
            </div>

            <button
              type="button"
              aria-label="Account settings"
              onClick={() => navigate("/settings")}
              className="w-9 h-9 rounded-full bg-indigo-600 p-0.5 cursor-pointer hover:opacity-80 transition"
            >
              <div className="bg-black w-full h-full rounded-full flex items-center justify-center text-xs font-bold text-white uppercase">
                {user?.email?.charAt(0) || "U"}
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
