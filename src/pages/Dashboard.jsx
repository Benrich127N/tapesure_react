// src/pages/Dashboard.jsx
const Dashboard = () => {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-6 text-gray-700">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <h3 className="font-semibold text-lg mb-2">Total Clients</h3>
          <p className="text-3xl font-bold text-blue-600">24</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <h3 className="font-semibold text-lg mb-2">Pending Orders</h3>
          <p className="text-3xl font-bold text-yellow-500">8</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <h3 className="font-semibold text-lg mb-2">Completed</h3>
          <p className="text-3xl font-bold text-green-500">42</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
