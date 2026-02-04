// src/components/Sidebar.jsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom"; // Added useNavigate here
import { signOut } from "firebase/auth";
import {auth} from "../../firebase"
import { LayoutDashboard, Calendar,  } from 'lucide-react';



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
  { name: "Outfits", path: "/outfits", icon: Briefcase },
  { name: "Calendar", path: "/calendar", icon: Calendar }, 
  { name: "Clients", path: "/clients", icon: Users },
  { name: "Invoices", path: "/invoices", icon: ClipboardList },
  { name: "Settings", path: "/settings", icon: Settings },
];

const Sidebar = () => {
const [collapsed, setCollapsed] = useState(false);
const [mobileOpen, setMobileOpen] = useState(false);


  const navigate = useNavigate(); // <-- Place it here

  // --- LOGOUT LOGIC START ---
  const handleLogout = async (e) => {
    e.preventDefault(); 
    try {
      await signOut(auth);
      console.log("Logged out successfully");
      navigate("/login"); 
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

const toggleSidebar = () => setCollapsed(!collapsed);
const toggleMobileSidebar = () => setMobileOpen(!mobileOpen);


  const primaryBg = "bg-black";
  const activeLink =
    "bg-gray-900 text-indigo-400 border-l-4 border-indigo-500";
  const defaultLink =
    "text-gray-400 hover:bg-gray-900 hover:text-white";

 return (
  <>
    {/* Mobile overlay */}
    <div
      onClick={toggleMobileSidebar}
      className={`fixed inset-0 bg-black/60 z-50 sm:hidden ${
        mobileOpen ? "block" : "hidden"
      }`}
    />
{/* Mobile sidebar */}
    <div
      className={`
        fixed sm:static z-[60]
      ${primaryBg} flex flex-col h-screen transition-all duration-300 shadow-2xl
      ${collapsed ? "w-20" : "w-64"}
      ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
      sm:translate-x-0

      `}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-20 border-b border-gray-900 px-4">
  {/* Mobile menu button */}
 <button
  onClick={toggleMobileSidebar}
  className="sm:hidden text-gray-400 hover:text-white absolute top-6 right-[-3rem]"
>

    <LayoutDashboard className="w-6 h-6" />
  </button>

        {!collapsed && (
          <span className="text-xl font-bold text-white tracking-wider">
            Tape<span className="text-indigo-400">Sure</span>
          </span>
        )}
        <button
  onClick={toggleSidebar}
  className="hidden sm:block p-2 text-gray-400 hover:text-white rounded-lg transition-colors duration-200"
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
  onClick={() => setMobileOpen(false)}

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
  <button type="button" 
    onClick={handleLogout}
    className={`
      flex items-center p-3 rounded-lg text-sm font-medium transition-colors duration-200
      ${defaultLink}
    `}
    title={collapsed ? "Logout" : ""}
  >
    <LogOut className="h-5 w-5 text-red-500" />
    {!collapsed && <span className="ml-3">Logout</span>}
  </button>
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
  {auth.currentUser?.displayName || "Tailor"}
</p>
<p className="text-xs text-gray-400 truncate">
  {auth.currentUser?.email || "Account"}
</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 ml-2" />
          </>
        )}
      </div>
    </div>
    </>

  );
};

export default Sidebar;
