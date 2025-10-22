import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm px-6 py-3 flex justify-between items-center">
      <h1 className="text-xl font-semibold text-purple-700">Tapsure</h1>
      <div className="space-x-4">
        <Link to="/" className="text-gray-700 hover:text-purple-600">Home</Link>
        <Link to="/dashboard" className="text-gray-700 hover:text-purple-600">Dashboard</Link>
      </div>
    </nav>
  );
};

export default Navbar;
