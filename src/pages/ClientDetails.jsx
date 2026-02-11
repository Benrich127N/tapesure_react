// src/pages/ClientDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc, deleteDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { 
  ArrowLeft, 
  Save, 
  Trash2,
  User, 
  Phone,
  Mail,
  Edit,
  Package,
  Calendar,
  DollarSign,
  Eye
} from "lucide-react";

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [client, setClient] = useState(null);
  const [clientOutfits, setClientOutfits] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: ""
  });

  // Fetch client data
  useEffect(() => {
    const fetchClient = async () => {
      try {
        const clientDoc = await getDoc(doc(db, "clients", id));
        if (clientDoc.exists()) {
          const data = clientDoc.data();
          setClient(data);
          setFormData({
            name: data.name || "",
            phone: data.phone || "",
            email: data.email || ""
          });
        } else {
          alert("Client not found");
          navigate("/clients");
        }
      } catch (error) {
        console.error("Error fetching client:", error);
        alert("Failed to load client");
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id, navigate]);

  // Fetch client's outfits
  useEffect(() => {
    if (!client) return;

    const q = query(
      collection(db, "outfits"),
      where("clientName", "==", client.name)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const outfitsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClientOutfits(outfitsData);
    });

    return () => unsubscribe();
  }, [client]);

  // Update client
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateDoc(doc(db, "clients", id), {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim()
      });

      setEditMode(false);
      // Refresh client data
      const clientDoc = await getDoc(doc(db, "clients", id));
      setClient(clientDoc.data());
      alert("Client updated successfully!");
    } catch (error) {
      console.error("Error updating client:", error);
      alert("Failed to update client");
    } finally {
      setSaving(false);
    }
  };

  // Delete client
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this client? This will not delete their outfits.")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "clients", id));
      navigate("/clients");
    } catch (error) {
      console.error("Error deleting client:", error);
      alert("Failed to delete client");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered": return "bg-green-900/30 text-green-400 border border-green-700";
      case "Delayed": return "bg-red-900/30 text-red-400 border border-red-700";
      case "Ready": return "bg-indigo-900/30 text-indigo-400 border border-indigo-700";
      default: return "bg-yellow-900/30 text-yellow-400 border border-yellow-700";
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto py-10 text-center text-gray-500">
        <div className="animate-pulse">Loading client details...</div>
      </div>
    );
  }

  // Calculate stats
  const totalOrders = clientOutfits.length;
  const pendingOrders = clientOutfits.filter(o => !["Delivered"].includes(o.status)).length;
  const completedOrders = clientOutfits.filter(o => o.status === "Delivered").length;
  const totalSpent = clientOutfits.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <button 
          onClick={() => navigate("/clients")}
          className="flex items-center text-gray-400 hover:text-white transition text-sm sm:text-base self-start"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Back to Clients
        </button>
        <div className="flex gap-2">
          {!editMode ? (
            <>
              <button
                onClick={() => setEditMode(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition active:scale-95"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setEditMode(false);
                setFormData({
                  name: client.name || "",
                  phone: client.phone || "",
                  email: client.email || ""
                });
              }}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition active:scale-95"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* View Mode */}
      {!editMode ? (
        <div className="space-y-4 sm:space-y-6">
          {/* Client Info Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4 mb-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-indigo-900/30 border-2 border-indigo-700 flex items-center justify-center text-indigo-400 font-bold text-xl sm:text-2xl flex-shrink-0">
                {client.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 truncate">
                  {client.name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  Joined {client.createdAt?.toDate().toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-800">
              <div className="flex items-center gap-3 text-sm sm:text-base">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                <span className="text-gray-300">{client.phone || "No phone number"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm sm:text-base">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                <span className="text-gray-300">{client.email || "No email"}</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-indigo-400" />
                <p className="text-xs text-gray-500">Total Orders</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-indigo-400">{totalOrders}</p>
            </div>
            
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-yellow-400" />
                <p className="text-xs text-gray-500">Pending</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-yellow-400">{pendingOrders}</p>
            </div>
            
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-green-400" />
                <p className="text-xs text-gray-500">Completed</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-green-400">{completedOrders}</p>
            </div>
            
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-indigo-400" />
                <p className="text-xs text-gray-500">Total Spent</p>
              </div>
              <p className="text-base sm:text-lg font-bold text-indigo-400">
                ₦{totalSpent.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Orders List */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-white">Order History</h2>
              <button
                onClick={() => navigate("/outfits/new")}
                className="text-sm text-indigo-400 hover:text-indigo-300 transition"
              >
                + New Order
              </button>
            </div>

            {clientOutfits.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-700 mx-auto mb-3" />
                <p className="text-sm sm:text-base text-gray-500 mb-3">No orders yet</p>
                <button
                  onClick={() => navigate("/outfits/new")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition inline-flex items-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  Create First Order
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {clientOutfits.map((outfit) => (
                  <div
                    key={outfit.id}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-3 sm:p-4 hover:border-indigo-700 transition cursor-pointer"
                    onClick={() => navigate(`/outfits/${outfit.id}`)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-white truncate">
                          {outfit.outfitType}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-400">
                          Due: {outfit.dueDate}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold uppercase px-2 py-1 rounded-full ${getStatusColor(outfit.status)}`}>
                          {outfit.status}
                        </span>
                        <p className="text-sm sm:text-base font-semibold text-indigo-400 whitespace-nowrap">
                          ₦{Number(outfit.amount || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <form onSubmit={handleUpdate} className="bg-gray-900 border border-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">Edit Client Information</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-2">
                <User size={14} /> Client Name <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-black border border-gray-800 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-2">
                <Phone size={14} /> Phone Number <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-black border border-gray-800 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-2">
                <Mail size={14} /> Email <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-black border border-gray-800 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-yellow-300">
              ⚠️ <strong>Note:</strong> Changing the client name will not update existing outfit records.
            </p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                saving
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95'
              }`}
            >
              {saving ? "Saving..." : <><Save size={18} /> Save Changes</>}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ClientDetails;