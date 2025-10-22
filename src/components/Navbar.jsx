// src/components/Navbar.jsx
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md py-4 px-8 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-blue-600">Tapsure</h1>
      <ul className="flex space-x-6">
        <li><Link to="/" className="hover:text-blue-600">Home</Link></li>
        <li><Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
