import React, { useEffect, useState } from 'react';
import { db, auth } from "../../firebase";
import { Calendar, AlertCircle, DollarSign, Package, Users, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, limit } from "firebase/firestore";

const Dashboard = () => {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Fetch latest 10 outfits
    const q = query(
      collection(db, "outfits"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOutfits(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- Real-time Calculations ---
  const totalOrders = outfits.length;
  const pendingPayments = outfits.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const overdueCount = outfits.filter(o => o.status === "Delayed").length;
  const uniqueClients = [...new Set(outfits.map(o => o.clientName))].length;

  // Stats Data
  const stats = [
    { 
      title: "Total Orders", 
      value: totalOrders, 
      icon: Package, 
      color: "text-indigo-400",
      bgColor: "bg-indigo-900/20",
      change: "All time"
    },
    { 
      title: "Active Clients", 
      value: uniqueClients, 
      icon: Users, 
      color: "text-green-400",
      bgColor: "bg-green-900/20",
      change: "Unique names"
    },
    { 
      title: "Expected Revenue", 
      value: `₦${pendingPayments.toLocaleString()}`, 
      icon: DollarSign, 
      color: "text-yellow-400",
      bgColor: "bg-yellow-900/20",
      change: "Total project value"
    },
    { 
      title: "Delayed Orders", 
      value: overdueCount, 
      icon: AlertCircle, 
      color: "text-red-400",
      bgColor: "bg-red-900/20",
      change: "Needs attention"
    },
  ];

  // Upcoming Reminders
  const reminders = [
    { id: 1, client: "Adebayo James", task: "Final fitting scheduled", time: "Today, 2:00 PM", priority: "high" },
    { id: 2, client: "Emeka Nwankwo", task: "Overdue delivery - Follow up", time: "Urgent", priority: "high" },
    { id: 3, client: "Fatima Bello", task: "Measurement confirmation needed", time: "Tomorrow, 10:00 AM", priority: "medium" },
    { id: 4, client: "Yemi Adeyemi", task: "Payment reminder - 70% balance", time: "Nov 2", priority: "medium" },
  ];

  // Recent Clients
  const recentClients = [
    { name: "Adebayo James", orders: 3, lastVisit: "Oct 28, 2025", status: "Active" },
    { name: "Chioma Okafor", orders: 1, lastVisit: "Oct 27, 2025", status: "Active" },
    { name: "Emeka Nwankwo", orders: 5, lastVisit: "Oct 20, 2025", status: "Active" },
    { name: "Fatima Bello", orders: 2, lastVisit: "Oct 26, 2025", status: "Active" },
  ];

  const getStatusIcon = (status) => {
    switch(status) {
      case "Delivered": return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "Delayed": return <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "Cutting":
      case "Sewing":
      case "Fitting": return <Clock className="w-3 h-3 sm:w-4 sm:h-4" />;
      default: return <Package className="w-3 h-3 sm:w-4 sm:h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered": return "bg-green-900/30 text-green-400 border border-green-700";
      case "Delayed": return "bg-red-900/30 text-red-400 border border-red-700";
      case "Pending": return "bg-gray-800 text-gray-400 border border-gray-700";
      default: return "bg-yellow-900/30 text-yellow-400 border border-yellow-700";
    }
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Dashboard Overview</h1>
          <p className="text-sm sm:text-base text-gray-400">Live summary of your Tapsure projects.</p>
        </div>
        <div className="sm:text-right">
          <p className="text-xs sm:text-sm text-gray-400">Today</p>
          <p className="text-base sm:text-lg font-semibold text-white">
            {new Date().toLocaleDateString('en-US', { 
              weekday: window.innerWidth < 640 ? 'short' : 'long', 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-900 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`p-2 sm:p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
              </div>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </div>
            <h3 className="text-gray-400 text-[10px] sm:text-sm font-medium mb-1">{stat.title}</h3>
            <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${stat.color} mb-1`}>
              {stat.value}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders - Mobile Cards & Desktop Table */}
      <div className="bg-gray-900 rounded-lg sm:rounded-xl shadow-lg border border-gray-800 p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-white">Recent Orders</h2>
        </div>

        {/* Mobile Card View */}
        <div className="block lg:hidden space-y-3">
          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading...</div>
          ) : outfits.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No orders yet</div>
          ) : (
            outfits.map((order) => (
              <div key={order.id} className="bg-gray-800 border border-gray-700 rounded-lg p-3 space-y-2">
                {/* Header: Client & Status */}
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-200 truncate">
                      {order.clientName}
                    </h3>
                    <p className="text-xs text-gray-400 truncate">{order.outfitType}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-[9px] uppercase font-bold px-2 py-1 rounded-full border ml-2 flex-shrink-0 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="hidden sm:inline">{order.status}</span>
                  </span>
                </div>

                {/* Footer: Amount & Due Date */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                  <div>
                    <p className="text-[10px] text-gray-500">Amount</p>
                    <p className="text-sm font-semibold text-indigo-400">
                      ₦{Number(order.amount || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500">Due Date</p>
                    <p className="text-xs text-gray-300">{order.dueDate}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="text-xs font-semibold text-gray-400 pb-3">CLIENT</th>
                <th className="text-xs font-semibold text-gray-400 pb-3">OUTFIT</th>
                <th className="text-xs font-semibold text-gray-400 pb-3">STATUS</th>
                <th className="text-xs font-semibold text-gray-400 pb-3">DUE DATE</th>
                <th className="text-xs font-semibold text-gray-400 pb-3">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-10 text-gray-500">Loading...</td></tr>
              ) : outfits.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-10 text-gray-500">No orders yet</td></tr>
              ) : (
                outfits.map((order) => (
                  <tr key={order.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                    <td className="py-4 text-sm text-gray-300">{order.clientName}</td>
                    <td className="py-4 text-sm text-gray-400">{order.outfitType}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-gray-400">{order.dueDate}</td>
                    <td className="py-4 text-sm font-semibold text-indigo-400">
                      ₦{Number(order.amount || 0).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Content Grid - Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Reminders */}
        <div className="bg-gray-900 rounded-lg sm:rounded-xl shadow-lg border border-gray-800 p-4 sm:p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white">Reminders</h2>
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
          </div>
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div 
                key={reminder.id} 
                className={`p-3 rounded-lg border ${
                  reminder.priority === 'high' 
                    ? 'bg-red-900/10 border-red-800' 
                    : 'bg-gray-800 border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-200">{reminder.client}</h3>
                  {reminder.priority === 'high' && (
                    <span className="text-[10px] sm:text-xs bg-red-900/30 text-red-400 px-2 py-0.5 rounded-full border border-red-700 flex-shrink-0 ml-2">
                      Urgent
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-400 mb-2">{reminder.task}</p>
                <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {reminder.time}
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-xs sm:text-sm text-indigo-400 hover:text-indigo-300 py-2 border border-gray-800 rounded-lg hover:bg-gray-800/50 transition">
            View All Reminders
          </button>
        </div>
      </div>

      {/* Bottom Row - Recent Clients & Payment Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Clients */}
        <div className="bg-gray-900 rounded-lg sm:rounded-xl shadow-lg border border-gray-800 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Recent Clients</h2>
          <div className="space-y-3">
            {recentClients.map((client, index) => (
              <div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-gray-800 rounded-lg hover:bg-gray-800/70 transition">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-900/30 border border-indigo-700 flex items-center justify-center text-indigo-400 font-semibold text-xs sm:text-sm flex-shrink-0">
                    {client.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-200 truncate">{client.name}</h3>
                    <p className="text-[10px] sm:text-xs text-gray-500 truncate">Last: {client.lastVisit}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-xs sm:text-sm font-semibold text-indigo-400">{client.orders}</p>
                  <span className="text-[10px] sm:text-xs text-green-400">{client.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-gray-900 rounded-lg sm:rounded-xl shadow-lg border border-gray-800 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Payment Summary</h2>
          <div className="space-y-3">
            <div className="p-3 sm:p-4 bg-green-900/10 rounded-lg border border-green-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs sm:text-sm text-gray-400">Total Received</span>
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-green-400">₦850,000</p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">This month</p>
            </div>
            
            <div className="p-3 sm:p-4 bg-yellow-900/10 rounded-lg border border-yellow-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs sm:text-sm text-gray-400">Pending Payments</span>
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-yellow-400">₦450,000</p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">12 outstanding invoices</p>
            </div>
            
            <div className="p-3 sm:p-4 bg-indigo-900/10 rounded-lg border border-indigo-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs sm:text-sm text-gray-400">Expected This Week</span>
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-indigo-400">₦180,000</p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">5 deliveries due</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;