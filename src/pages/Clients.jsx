import React, { useState } from "react";
import { Search, Plus, Phone, Mail, MapPin, Calendar, Package, DollarSign, Edit, Trash2, Eye, User } from "lucide-react";

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const clients = [
    {
      id: "CLT-001",
      name: "Adebayo James",
      phone: "+234 801 234 5678",
      email: "adebayo.james@email.com",
      address: "15 Admiralty Way, Lekki, Lagos",
      status: "Active",
      totalOrders: 8,
      pendingOrders: 2,
      completedOrders: 6,
      totalSpent: "₦450,000",
      lastVisit: "Oct 28, 2025",
      measurements: {
        chest: "42in",
        waist: "36in",
        shoulder: "18in",
        length: "28in"
      },
      notes: "Prefers slim fit designs. Always punctual with payments."
    },
    {
      id: "CLT-002",
      name: "Chioma Okafor",
      phone: "+234 802 345 6789",
      email: "chioma.okafor@email.com",
      address: "22 Bourdillon Road, Ikoyi, Lagos",
      status: "Active",
      totalOrders: 12,
      pendingOrders: 1,
      completedOrders: 11,
      totalSpent: "₦890,000",
      lastVisit: "Oct 27, 2025",
      measurements: {
        bust: "38in",
        waist: "32in",
        hip: "42in",
        length: "40in"
      },
      notes: "VIP client. Prefers Ankara and lace fabrics. Wedding specialist."
    },
    {
      id: "CLT-003",
      name: "Emeka Nwankwo",
      phone: "+234 803 456 7890",
      email: "emeka.nwankwo@email.com",
      address: "8 Allen Avenue, Ikeja, Lagos",
      status: "Pending",
      totalOrders: 5,
      pendingOrders: 3,
      completedOrders: 2,
      totalSpent: "₦280,000",
      lastVisit: "Oct 20, 2025",
      measurements: {
        chest: "44in",
        waist: "38in",
        shoulder: "19in",
        length: "30in"
      },
      notes: "Has 1 overdue payment. Follow up needed."
    },
    {
      id: "CLT-004",
      name: "Fatima Bello",
      phone: "+234 804 567 8901",
      email: "fatima.bello@email.com",
      address: "12 Maitama Drive, Abuja",
      status: "Active",
      totalOrders: 6,
      pendingOrders: 2,
      completedOrders: 4,
      totalSpent: "₦320,000",
      lastVisit: "Oct 26, 2025",
      measurements: {
        bust: "36in",
        waist: "30in",
        hip: "40in",
        length: "38in"
      },
      notes: "Corporate client. Prefers modest, professional designs."
    },
    {
      id: "CLT-005",
      name: "Tunde Bakare",
      phone: "+234 805 678 9012",
      email: "tunde.bakare@email.com",
      address: "45 Victoria Island, Lagos",
      status: "Inactive",
      totalOrders: 3,
      pendingOrders: 0,
      completedOrders: 3,
      totalSpent: "₦150,000",
      lastVisit: "Aug 15, 2025",
      measurements: {
        chest: "40in",
        waist: "34in",
        shoulder: "17in",
        length: "27in"
      },
      notes: "Last order was 2 months ago. Consider follow-up call."
    },
    {
      id: "CLT-006",
      name: "Ngozi Eze",
      phone: "+234 806 789 0123",
      email: "ngozi.eze@email.com",
      address: "18 Gbagada Expressway, Lagos",
      status: "Active",
      totalOrders: 15,
      pendingOrders: 4,
      completedOrders: 11,
      totalSpent: "₦1,200,000",
      lastVisit: "Oct 29, 2025",
      measurements: {
        bust: "40in",
        waist: "34in",
        hip: "44in",
        length: "42in"
      },
      notes: "Top client. Refers many customers. Loves traditional attire."
    }
  ];

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.includes(searchTerm) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "All" || client.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    { label: "Total Clients", value: clients.length, icon: User, color: "indigo" },
    { label: "Active", value: clients.filter(c => c.status === "Active").length, icon: Package, color: "green" },
    { label: "Pending", value: clients.filter(c => c.status === "Pending").length, icon: Calendar, color: "yellow" },
    { label: "Inactive", value: clients.filter(c => c.status === "Inactive").length, icon: User, color: "red" }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Clients Management</h1>
          <p className="text-gray-400">Manage client details, measurements, and order history</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition">
          <Plus className="w-5 h-5" />
          Add New Client
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
              <span className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</span>
            </div>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            {["All", "Active", "Pending", "Inactive"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filterStatus === status
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredClients.map((client) => (
          <div key={client.id} className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-6 hover:border-indigo-700 transition">
            {/* Client Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-900/30 border border-indigo-700 flex items-center justify-center text-indigo-400 font-bold text-lg">
                  {client.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{client.name}</h3>
                  <p className="text-xs text-gray-500 font-mono">{client.id}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                client.status === "Active" ? "bg-green-900/30 text-green-400 border border-green-700" :
                client.status === "Pending" ? "bg-yellow-900/30 text-yellow-400 border border-yellow-700" :
                "bg-red-900/30 text-red-400 border border-red-700"
              }`}>
                {client.status}
              </span>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="w-4 h-4" />
                {client.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-4 h-4" />
                {client.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4" />
                {client.address}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-800 rounded-lg">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Total Orders</p>
                <p className="text-lg font-bold text-indigo-400">{client.totalOrders}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Pending</p>
                <p className="text-lg font-bold text-yellow-400">{client.pendingOrders}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Completed</p>
                <p className="text-lg font-bold text-green-400">{client.completedOrders}</p>
              </div>
            </div>

            {/* Measurements */}
            <div className="mb-4 p-3 bg-gray-800 rounded-lg">
              <h4 className="text-xs font-semibold text-gray-400 mb-2">MEASUREMENTS</h4>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(client.measurements).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <p className="text-xs text-gray-500 capitalize">{key}</p>
                    <p className="text-sm font-semibold text-gray-300">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Info */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-800">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-4 h-4" />
                Last visit: {client.lastVisit}
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-400">
                <DollarSign className="w-4 h-4" />
                {client.totalSpent}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 italic">"{client.notes}"</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition">
                <Eye className="w-4 h-4" />
                View Details
              </button>
              <button className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition">
                <Edit className="w-4 h-4" />
              </button>
              <button className="bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-12 text-center">
          <User className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No clients found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default Clients;