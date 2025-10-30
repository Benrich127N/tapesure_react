import React from "react";
import { CheckCircle, Clock, XCircle, Package } from "lucide-react";

const Outfits = () => {
  const outfitStats = [
    { title: "Total Outfits", value: "6,784", color: "text-indigo-400", bg: "bg-indigo-900/20", sub: "+15 today" },
    { title: "In Progress", value: "4,412", color: "text-yellow-400", bg: "bg-yellow-900/20", sub: "+4 today" },
    { title: "Delivered", value: "1,920", color: "text-green-400", bg: "bg-green-900/20", sub: "+2 today" },
    { title: "Delayed", value: "329", color: "text-red-400", bg: "bg-red-900/20", sub: "+1 today" },
  ];

  const outfitCards = [
    { client: "Sarah Johnson", type: "Ankara Gown", status: "In Progress", color: "yellow", progress: "65%", due: "Oct 25" },
    { client: "John Doe", type: "Senator Suit", status: "Delivered", color: "green", progress: "100%", due: "Oct 15" },
    { client: "Chika Ndu", type: "Wedding Dress", status: "Delayed", color: "red", progress: "40%", due: "Oct 30" },
    { client: "Mary Afolabi", type: "Office Skirt", status: "Pending", color: "gray", progress: "0%", due: "Oct 28" },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case "Delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "In Progress":
        return <Clock className="w-4 h-4" />;
      case "Delayed":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Outfit Management</h1>
          <p className="text-gray-400">Track, monitor, and manage all outfit projects in one place.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Today</p>
          <p className="text-lg font-semibold text-white">Wednesday, Oct 29, 2025</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {outfitStats.map((stat, index) => (
          <div key={index} className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <Package className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="text-sm text-gray-600">{stat.sub}</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">{stat.title}</h3>
            <p className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Outfits Table */}
      <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Recent Outfits</h2>
          <button className="text-sm text-indigo-400 hover:text-indigo-300">View All →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-xs font-semibold text-gray-400 pb-3">CLIENT</th>
                <th className="text-left text-xs font-semibold text-gray-400 pb-3">TYPE</th>
                <th className="text-left text-xs font-semibold text-gray-400 pb-3">STATUS</th>
                <th className="text-left text-xs font-semibold text-gray-400 pb-3">PROGRESS</th>
                <th className="text-left text-xs font-semibold text-gray-400 pb-3">DUE DATE</th>
              </tr>
            </thead>
            <tbody>
              {outfitCards.map((outfit, index) => (
                <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                  <td className="py-4 text-sm text-gray-300">{outfit.client}</td>
                  <td className="py-4 text-sm text-gray-400">{outfit.type}</td>
                  <td className="py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full 
                      ${outfit.color === 'green' ? 'bg-green-900/30 text-green-400 border border-green-700' : ''}
                      ${outfit.color === 'yellow' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-700' : ''}
                      ${outfit.color === 'red' ? 'bg-red-900/30 text-red-400 border border-red-700' : ''}
                      ${outfit.color === 'gray' ? 'bg-gray-800 text-gray-400 border border-gray-700' : ''}`}>
                      {getStatusIcon(outfit.status)}
                      {outfit.status}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-gray-400">{outfit.progress}</td>
                  <td className="py-4 text-sm text-gray-400">{outfit.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Outfits;
