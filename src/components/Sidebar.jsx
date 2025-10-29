// src/components/Sidebar.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Users,
  Briefcase,
  ClipboardList,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", path: "/", icon: Home },
  { name: "Projects", path: "/projects", icon: Briefcase },
  { name: "Clients", path: "/clients", icon: Users },
  { name: "Invoices", path: "/invoices", icon: ClipboardList },
  { name: "Settings", path: "/settings", icon: Settings },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => setCollapsed(!collapsed);

  const primaryBg = "bg-black";
  const activeLink =
    "bg-gray-900 text-indigo-400 border-l-4 border-indigo-500";
  const defaultLink =
    "text-gray-400 hover:bg-gray-900 hover:text-white";

  return (
    <div
      className={`
        ${primaryBg} flex flex-col min-h-screen transition-all duration-300 shadow-2xl
        ${collapsed ? "w-20" : "w-64"}
      `}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-20 border-b border-gray-900 px-4">
        {!collapsed && (
          <span className="text-xl font-bold text-white tracking-wider">
            Axzar<span className="text-indigo-400">Panel</span>
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors duration-200"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `
              flex items-center p-3 rounded-lg text-sm font-medium transition-colors duration-200
              ${isActive ? activeLink : defaultLink}
            `
            }
            end
            title={collapsed ? item.name : ""}
          >
            <item.icon className="h-5 w-5" />
            {!collapsed && <span className="ml-3">{item.name}</span>}
          </NavLink>
        ))}

        {/* Logout Section */}
        <div className="pt-4 mt-4 border-t border-gray-800">
          <a
            href="#"
            className={`
              flex items-center p-3 rounded-lg text-sm font-medium transition-colors duration-200
              ${defaultLink}
            `}
            title={collapsed ? "Logout" : ""}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="ml-3">Logout</span>}
          </a>
        </div>
      </nav>

      {/* User Profile Footer */}
      <div
        className={`p-4 border-t border-gray-800 ${defaultLink} flex items-center cursor-pointer`}
        title={collapsed ? "Profile" : ""}
      >
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
            JD
          </div>
        </div>
        {!collapsed && (
          <>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                John Doe
              </p>
              <p className="text-xs text-gray-400 truncate">
                john.doe@example.com
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 ml-2" />
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
