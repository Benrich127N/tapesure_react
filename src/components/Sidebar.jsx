// src/components/Sidebar.jsx
import { FaProjectDiagram, FaUsers, FaFileInvoice, FaHome } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const { pathname } = useLocation();
  const navItems = [
    { name: "Overview", icon: <FaHome />, path: "/" },
    { name: "Project", icon: <FaProjectDiagram />, path: "/dashboard" },
    { name: "Client", icon: <FaUsers />, path: "/clients" },
    { name: "Invoice", icon: <FaFileInvoice />, path: "/invoices" },
  ];

  return (
    <aside className="bg-purple-700 text-white w-64 min-h-screen p-5 flex flex-col">
      <div className="text-2xl font-bold mb-10">Tapsure</div>
      <nav className="flex flex-col space-y-3">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
              pathname === item.path ? "bg-purple-900" : "hover:bg-purple-800"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto text-sm text-gray-300">© 2025 Tapsure</div>
    </aside>
  );
};

export default Sidebar;
