import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase";
import { useNavigate } from 'react-router-dom'; // Add this line at the top
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  orderBy 
} from "firebase/firestore";
import { 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  Calendar, 
  Package, 
  Edit, 
  Trash2, 
  Eye, 
  User,
  X
} from "lucide-react";

const Clients = () => {
  const navigate = useNavigate(); // <--- ADD THIS LINE HERE
  const [clients, setClients] = useState([]);
  const [outfits, setOutfits] = useState([]); // Add this
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: ""
  });

  // Fetch clients from Firebase
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "clients"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClients(clientsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch outfits to count orders per client
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "outfits"),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const outfitsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOutfits(outfitsData);
    });

    return () => unsubscribe();
  }, []);

  // Filter clients based on search
  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.name?.toLowerCase().includes(searchLower) ||
      client.phone?.includes(searchTerm) ||
      client.email?.toLowerCase().includes(searchLower)
    );
  });

  // Add new client
  const handleAddClient = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert("Name and phone are required");
      return;
    }

    try {
      await addDoc(collection(db, "clients"), {
        userId: auth.currentUser.uid,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || "",
        measurements: {
          chest: 0,
          waist: 0,
          hip: 0
        },
        createdAt: serverTimestamp()
      });

      // Reset form
      setFormData({ name: "", phone: "", email: "" });
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding client:", error);
      alert("Failed to add client");
    }
  };

  // Delete client
  const handleDeleteClient = async (clientId) => {
    if (!window.confirm("Are you sure you want to delete this client?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "clients", clientId));
    } catch (error) {
      console.error("Error deleting client:", error);
      alert("Failed to delete client");
    }
  };

  // Get client's outfit count - NOW USING REAL DATA
  const getClientOrders = (clientName) => {
    return outfits.filter(outfit => outfit.clientName === clientName).length;
  };

  const stats = [
    { 
      label: "Total Clients", 
      value: clients.length, 
      icon: User, 
      color: "indigo" 
    },
    { 
      label: "This Month", 
      value: clients.filter(c => {
        if (!c.createdAt) return false;
        const clientDate = c.createdAt.toDate();
        const now = new Date();
        return clientDate.getMonth() === now.getMonth() && 
               clientDate.getFullYear() === now.getFullYear();
      }).length, 
      icon: Package, 
      color: "green" 
    }
  ];

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
            Clients Management
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            Manage client details and contact information
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition active:scale-95 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Add New Client
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-900 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${stat.color}-400`} />
              <span className={`text-xl sm:text-2xl font-bold text-${stat.color}-400`}>
                {stat.value}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-gray-900 rounded-lg sm:rounded-xl shadow-lg border border-gray-800 p-4 sm:p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-10 text-gray-500">
          <div className="animate-pulse">Loading clients...</div>
        </div>
      )}

      {/* Clients Grid - Mobile Cards & Desktop Grid */}
      {!loading && filteredClients.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredClients.map((client) => {
            const orderCount = getClientOrders(client.name);
            
            return (
              <div 
                key={client.id} 
                className="bg-gray-900 rounded-lg sm:rounded-xl shadow-lg border border-gray-800 p-4 sm:p-6 hover:border-indigo-700 transition"
              >
                {/* Client Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-900/30 border border-indigo-700 flex items-center justify-center text-indigo-400 font-bold text-sm sm:text-lg flex-shrink-0">
                      {client.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                        {client.name}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-gray-500">
                        Joined {client.createdAt?.toDate().toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{client.phone}</span>
                  </div>
                  {client.email && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Total Orders</p>
                    <p className="text-base sm:text-lg font-bold text-indigo-400">
                      {orderCount}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Status</p>
                    <p className="text-base sm:text-lg font-bold text-green-400">
                      {orderCount > 0 ? 'Active' : 'New'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button 
                      onClick={() => navigate(`/clients/${client.id}`)}

                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition active:scale-95"
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">View Details</span>
                    <span className="sm:hidden">View</span>
                  </button>
                  <button 
                      onClick={() => navigate(`/clients/${client.id}`)}

                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition active:scale-95"
                  >
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteClient(client.id)}
                    className="bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-700 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition active:scale-95"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredClients.length === 0 && (
        <div className="bg-gray-900 rounded-lg sm:rounded-xl shadow-lg border border-gray-800 p-8 sm:p-12 text-center">
          <User className="w-12 h-12 sm:w-16 sm:h-16 text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-400 mb-2">
            {searchTerm ? "No clients found" : "No clients yet"}
          </h3>
          <p className="text-sm sm:text-base text-gray-500 mb-4">
            {searchTerm 
              ? "Try adjusting your search criteria" 
              : "Clients will appear here when you create outfits"
            }
          </p>
          {!searchTerm && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add First Client
            </button>
          )}
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-800">
              <h2 className="text-lg sm:text-xl font-bold text-white">Add New Client</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddClient} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Client Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., John Doe"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g., +234 801 234 5678"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g., john@example.com"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                />
              </div>

              <div className="bg-indigo-900/20 border border-indigo-800 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-indigo-300">
                  💡 <strong>Tip:</strong> Measurements will be added when you create an outfit for this client.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
                >
                  Add Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;