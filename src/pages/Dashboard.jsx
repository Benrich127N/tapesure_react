import Sidebar from "../components/Sidebar";

const Dashboard = () => {
  return (
    // Main background set to black
    <div className="flex min-h-screen bg-black"> 
      <Sidebar /> 

      {/* Main Content */}
      
      <div className="flex-1 p-8">
        {/* Main heading text set to white */}
        <h1 className="text-3xl font-bold text-white mb-8">Dashboard Overview</h1>

        {/* Dashboard Cards */}
        <div className="card grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Uses a dark gray background (bg-gray-900) */}
          <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800"> 
            <h2 className="text-xl font-semibold text-gray-300 mb-2">Projects</h2>
            <p className="text-3xl font-bold text-indigo-400">12</p>
            <p className="text-gray-500">Active Projects</p>
          </div>
          
          {/* Card 2 */}
          <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800">
            <h2 className="text-xl font-semibold text-gray-300 mb-2">Clients</h2>
            <p className="text-3xl font-bold text-green-400">8</p>
            <p className="text-gray-500">Active Clients</p>
          </div>
          
          {/* Card 3 */}
          <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800">
            <h2 className="text-xl font-semibold text-gray-300 mb-2">Invoices</h2>
            <p className="text-3xl font-bold text-red-400">5</p>
            <p className="text-gray-500">Pending</p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Dashboard;