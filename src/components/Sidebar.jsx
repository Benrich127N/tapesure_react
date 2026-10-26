// src/components/Sidebar.jsx
import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom"; // Added useNavigate here
import { signOut } from "firebase/auth";
import {auth} from "../../firebase";
import {
  Calendar,
  MessageSquare,
  LogOut,
  Home,
  Briefcase,
  Users,
  ClipboardList,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Ruler
} from "lucide-react";


const navItems = [
  { name: "Dashboard", path: "/", icon: Home },
  { name: "Orders", path: "/outfits", icon: Briefcase },
  { name: "Calendar", path: "/calendar", icon: Calendar }, 
  { name: "Customers", path: "/clients", icon: Users },
  { name: "Invoices", path: "/invoices", icon: ClipboardList },
  { name: "Settings", path: "/settings", icon: Settings },
  { name: "Measurements", path: "/measurements", icon: Ruler },

];

const Sidebar = ({ mobileOpen, setMobileOpen }) => { // Change this line
  const [collapsed, setCollapsed] = useState(false);
  const drawerRef = useRef(null);
  useEffect(() => {
    const onResize = () => { if (window.innerWidth < 1024) setCollapsed(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.activeElement;
    drawerRef.current?.querySelector('button')?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') setMobileOpen(false);
      if (event.key === 'Tab' && window.innerWidth < 1024) {
        const items = Array.from(drawerRef.current?.querySelectorAll('a, button') || []).filter((item) => item.getClientRects().length > 0);
        const first = items?.[0]; const last = items?.[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); previous?.focus(); };
  }, [mobileOpen, setMobileOpen]);
  
  const navigate = useNavigate();
// 2. Feedback Configuration
  const whatsappNumber = "2349063420516"; // Replace with your number
  const feedbackMsg = encodeURIComponent("Hello! I'm using TapeSure and I have some feedback: ");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${feedbackMsg}`;



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


  const primaryBg = "bg-gray-900";
  const activeLink =
    "bg-indigo-500/15 text-indigo-300 ring-1 ring-inset ring-indigo-400/20";
  const defaultLink =
    "text-gray-400 hover:bg-gray-900 hover:text-white";

 return (
  <>
    {/* Mobile overlay */}
    <div
      onClick={toggleMobileSidebar}
      className={`fixed inset-0 bg-black/60 z-50 lg:hidden ${
        mobileOpen ? "block" : "hidden"
      }`}
    />
{/* Mobile sidebar */}
    <aside
      ref={drawerRef}
      id="workspace-navigation"
      aria-label="Workspace navigation"
      className={`
        workspace-sidebar fixed lg:relative shrink-0 z-[60]
      ${primaryBg} flex flex-col h-dvh border-r border-gray-800 transition-all duration-200
      ${collapsed ? "lg:w-20" : "lg:w-64"} w-64
      ${mobileOpen ? "translate-x-0 visible" : "-translate-x-full invisible lg:visible"}
      lg:translate-x-0

      `}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-20 border-b border-gray-900 px-4">
  {/* Mobile menu button */}
 <button
  onClick={toggleMobileSidebar}
   aria-label="Close navigation"
   className="lg:hidden p-2 text-gray-400 hover:text-white"

>

    <X className="w-5 h-5" />
  </button>

        {!collapsed && (
          <span className="text-xl font-bold text-white tracking-wider">
            Tape<span className="text-indigo-400">Sure</span>
          </span>
        )}
        <button
  aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
  aria-expanded={!collapsed}
  onClick={toggleSidebar}
  className="hidden lg:block p-2 text-gray-400 hover:text-white rounded-lg transition-colors duration-200"
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
            aria-label={item.name}
            title={collapsed ? item.name : ""}
          >
            <item.icon className="h-5 w-5" />
            {!collapsed && <span className="ml-3">{item.name}</span>}
          </NavLink>
        ))}


        {/* --- FEEDBACK BUTTON ADDED HERE --- */}
          <div className="pt-4 mt-4 border-t border-gray-800">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center p-3 rounded-lg text-sm font-medium transition-colors text-green-500 hover:bg-green-500/10`}
              aria-label="Give feedback"
              title={collapsed ? "Give Feedback" : ""}
            >
              <MessageSquare className="h-5 w-5" />
              {!collapsed && <span className="ml-3">Give Feedback</span>}
            </a>
          </div>

        {/* Logout Section */}
      <div className="pt-4 mt-4 border-t border-gray-800">
  <button type="button" 
    onClick={handleLogout}
    className={`
      flex items-center p-3 rounded-lg text-sm font-medium transition-colors duration-200
      ${defaultLink}
    `}
    aria-label="Logout"
    title={collapsed ? "Logout" : ""}
  >
    <LogOut className="h-5 w-5 text-red-500" />
    {!collapsed && <span className="ml-3">Logout</span>}
  </button>
</div>
      </nav>

      {/* User Profile Footer */}
      <div
        className={`p-4 border-t border-gray-800 ${defaultLink} flex items-center `}
        title={collapsed ? "Profile" : ""}
      >
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
            {(auth.currentUser?.displayName || auth.currentUser?.email || "T").charAt(0).toUpperCase()}
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

          </>
        )}
      </div>
    </aside>
    </>

  );
};

export default Sidebar;
