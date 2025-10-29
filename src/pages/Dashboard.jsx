import React from 'react';
import { Calendar, AlertCircle, DollarSign, Package, Users, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';

const Dashboard = () => {
  // Stats Data
  const stats = [
    { 
      title: "Total Orders", 
      value: "42", 
      icon: Package, 
      color: "text-indigo-400",
      bgColor: "bg-indigo-900/20",
      change: "+8 this week"
    },
    { 
      title: "Active Clients", 
      value: "28", 
      icon: Users, 
      color: "text-green-400",
      bgColor: "bg-green-900/20",
      change: "+3 new"
    },
    { 
      title: "Pending Payments", 
      value: "₦450K", 
      icon: DollarSign, 
      color: "text-yellow-400",
      bgColor: "bg-yellow-900/20",
      change: "12 invoices"
    },
    { 
      title: "Overdue Orders", 
      value: "5", 
      icon: AlertCircle, 
      color: "text-red-400",
      bgColor: "bg-red-900/20",
      change: "Need attention"
    },
  ];

  // Recent Orders
  const orders = [
    { id: "ORD-001", client: "Adebayo James", outfit: "3-Piece Suit", status: "In Progress", dueDate: "Nov 5", payment: "50%", color: "yellow" },
    { id: "ORD-002", client: "Chioma Okafor", outfit: "Wedding Gown", status: "Completed", dueDate: "Oct 28", payment: "100%", color: "green" },
    { id: "ORD-003", client: "Emeka Nwankwo", outfit: "Agbada Set", status: "Overdue", dueDate: "Oct 25", payment: "20%", color: "red" },
    { id: "ORD-004", client: "Fatima Bello", outfit: "Ankara Dress", status: "In Progress", dueDate: "Nov 8", payment: "30%", color: "yellow" },
    { id: "ORD-005", client: "Tunde Bakare", outfit: "Senator Wear", status: "Uncompleted", dueDate: "Nov 12", payment: "0%", color: "gray" },
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
      case "Completed": return <CheckCircle className="w-4 h-4" />;
      case "Overdue": return <XCircle className="w-4 h-4" />;
      case "In Progress": return <Clock className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
          <p className="text-gray-400">Welcome back! Here's what's happening with your tailoring business today.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Today</p>
          <p className="text-lg font-semibold text-white">Wednesday, Oct 29, 2025</p>
        </div>
      </div>




      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <TrendingUp className="w-5 h-5 text-gray-600" />
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">{stat.title}</h3>
            <p className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders - Takes 2 columns */}
        <div className="lg:col-span-2 bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Recent Orders</h2>
            <button className="text-sm text-indigo-400 hover:text-indigo-300">View All →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-xs font-semibold text-gray-400 pb-3">ORDER ID</th>
                  <th className="text-left text-xs font-semibold text-gray-400 pb-3">CLIENT</th>
                  <th className="text-left text-xs font-semibold text-gray-400 pb-3">OUTFIT</th>
                  <th className="text-left text-xs font-semibold text-gray-400 pb-3">STATUS</th>
                  <th className="text-left text-xs font-semibold text-gray-400 pb-3">DUE DATE</th>
                  <th className="text-left text-xs font-semibold text-gray-400 pb-3">PAYMENT</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                    <td className="py-4 text-sm text-gray-300 font-mono">{order.id}</td>
                    <td className="py-4 text-sm text-gray-300">{order.client}</td>
                    <td className="py-4 text-sm text-gray-400">{order.outfit}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full 
                        ${order.color === 'green' ? 'bg-green-900/30 text-green-400 border border-green-700' : ''}
                        ${order.color === 'yellow' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-700' : ''}
                        ${order.color === 'red' ? 'bg-red-900/30 text-red-400 border border-red-700' : ''}
                        ${order.color === 'gray' ? 'bg-gray-800 text-gray-400 border border-gray-700' : ''}
                      `}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-gray-400">{order.dueDate}</td>
                    <td className="py-4">
                      <span className={`text-sm font-semibold ${
                        order.payment === '100%' ? 'text-green-400' : 
                        order.payment === '0%' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {order.payment}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reminders - Takes 1 column */}
        <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Reminders</h2>
            <Calendar className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <div 
                key={reminder.id} 
                className={`p-4 rounded-lg border ${
                  reminder.priority === 'high' 
                    ? 'bg-red-900/10 border-red-800' 
                    : 'bg-gray-800 border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-200">{reminder.client}</h3>
                  {reminder.priority === 'high' && (
                    <span className="text-xs bg-red-900/30 text-red-400 px-2 py-0.5 rounded-full border border-red-700">
                      Urgent
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mb-2">{reminder.task}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {reminder.time}
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-sm text-indigo-400 hover:text-indigo-300 py-2 border border-gray-800 rounded-lg hover:bg-gray-800/50 transition">
            View All Reminders
          </button>
        </div>
      </div>

      {/* Bottom Row - Recent Clients & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Clients */}
        <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-6">
          <h2 className="text-xl font-bold text-white mb-6">Recent Clients</h2>
          <div className="space-y-4">
            {recentClients.map((client, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-800/70 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-900/30 border border-indigo-700 flex items-center justify-center text-indigo-400 font-semibold">
                    {client.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-200">{client.name}</h3>
                    <p className="text-xs text-gray-500">Last visit: {client.lastVisit}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-indigo-400">{client.orders} orders</p>
                  <span className="text-xs text-green-400">{client.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-6">
          <h2 className="text-xl font-bold text-white mb-6">Payment Summary</h2>
          <div className="space-y-4">
            <div className="p-4 bg-green-900/10 rounded-lg border border-green-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Total Received</span>
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-green-400">₦850,000</p>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </div>
            
            <div className="p-4 bg-yellow-900/10 rounded-lg border border-yellow-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Pending Payments</span>
                <AlertCircle className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-2xl font-bold text-yellow-400">₦450,000</p>
              <p className="text-xs text-gray-500 mt-1">12 outstanding invoices</p>
            </div>
            
            <div className="p-4 bg-indigo-900/10 rounded-lg border border-indigo-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Expected This Week</span>
                <TrendingUp className="w-5 h-5 text-indigo-400" />
              </div>
              <p className="text-2xl font-bold text-indigo-400">₦180,000</p>
              <p className="text-xs text-gray-500 mt-1">5 deliveries due</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;