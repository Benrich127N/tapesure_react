import React from 'react';
import {
  Home,
  Users,
  Briefcase,
  ClipboardList,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react'; 

const navItems = [
  { name: 'Dashboard', icon: Home, href: '#', current: true },
  { name: 'Projects', icon: Briefcase, href: '#', current: false },
  { name: 'Clients', icon: Users, href: '#', current: false },
  { name: 'Invoices', icon: ClipboardList, href: '#', current: false },
  { name: 'Settings', icon: Settings, href: '#', current: false },
];

const Sidebar = () => {
  // Primary Black Background
  const primaryBg = 'bg-black'; 
  // Active Link: Use a subtle dark gray for the background and bright indigo for the accent border and text.
  const activeLink = 'bg-gray-900 text-indigo-400 border-l-4 border-indigo-500'; 
  // Default Link: Light gray text that brightens on hover.
  const defaultLink = 'text-gray-400 hover:bg-gray-900 hover:text-white';
  
  return (
    <div className={`w-64 ${primaryBg} flex flex-col min-h-screen transition-all duration-300 shadow-2xl`}>
      {/* Sidebar Header/Logo */}
      <div className="flex items-center justify-center h-20 border-b border-gray-900">
        <span className="text-xl font-bold text-white tracking-wider">
          Axzar<span className="text-indigo-400">Panel</span>
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className={`
              flex items-center p-3 rounded-lg text-sm font-medium transition-colors duration-200
              ${item.current ? activeLink : defaultLink}
            `}
            aria-current={item.current ? 'page' : undefined}
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.name}
          </a>
        ))}

        {/* Logout Section */}
        <div className="pt-4 mt-4 border-t border-gray-800">
             <a
            href="#"
            className={`
              flex items-center p-3 rounded-lg text-sm font-medium transition-colors duration-200
              ${defaultLink}
            `}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </a>
        </div>
      </nav>
      
      {/* User Profile Footer */}
      <div className={`p-4 border-t border-gray-800 ${defaultLink} flex items-center cursor-pointer`}>
        <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                JD
            </div>
        </div>
        <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">John Doe</p>
            <p className="text-xs text-gray-400 truncate">john.doe@example.com</p>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400 ml-2" />
      </div>
    </div>
  );
};

export default Sidebar;