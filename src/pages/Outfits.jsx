import React, { useEffect, useState } from "react"; // Fixed: Uncommented and added imports
import { db, auth } from "../../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { CheckCircle, Clock, XCircle, Package, Edit2, Eye } from "lucide-react";
// Add this to Outfits.jsx
import { useNavigate } from "react-router-dom";

const Outfits = () => {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Stats logic calculated from real Firestore data
  const stats = {
    total: outfits.length,
    inProgress: outfits.filter((o) => o.status === "In Progress").length,
    delivered: outfits.filter((o) => o.status === "Delivered").length,
    delayed: outfits.filter((o) => o.status === "Delayed").length,
  };

  const outfitStats = [
    {
      title: "Total Outfits",
      value: stats.total,
      color: "text-indigo-400",
      bg: "bg-indigo-900/20",
      sub: "All time",
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      color: "text-yellow-400",
      bg: "bg-yellow-900/20",
      sub: "Active",
    },
    {
      title: "Delivered",
      value: stats.delivered,
      color: "text-green-400",
      bg: "bg-green-900/20",
      sub: "Completed",
    },
    {
      title: "Delayed",
      value: stats.delayed,
      color: "text-red-400",
      bg: "bg-red-900/20",
      sub: "Urgent",
    },
  ];

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "outfits"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOutfits(data);
      setLoading(false); // Fixed: 'loading' is now used
    });

    return () => unsubscribe();
  }, []);

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

  // Helper to get colors based on status string
  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-900/30 text-green-400 border border-green-700";
        case "Ready": return "bg-indigo-900/30 text-indigo-400 border border-indigo-700"; // Added Ready color
    case "Cutting": 
    case "Sewing":
    case "Fitting":
      case "In Progress":
        return "bg-yellow-900/30 text-yellow-400 border border-yellow-700";
      case "Delayed":
        return "bg-red-900/30 text-red-400 border border-red-700";
      default:
        return "bg-gray-800 text-gray-400 border border-gray-700";
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Outfit Management
          </h1>
          <p className="text-gray-400">
            Track, monitor, and manage all outfit projects in one place.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Today</p>
          <p className="text-lg font-semibold text-white">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {outfitStats.map((stat, index) => (
          <div
            key={index}
            className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <Package className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="text-sm text-gray-600">{stat.sub}</span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">
              {stat.title}
            </h3>
            <p className={`text-3xl font-bold ${stat.color} mb-1`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Outfits Table */}
      <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Recent Outfits</h2>
          <button
            onClick={() => navigate("/outfits/new")}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            + New Outfit
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-xs font-semibold text-gray-400 pb-3">
                  CLIENT
                </th>
                <th className="text-xs font-semibold text-gray-400 pb-3">
                  TYPE
                </th>
                <th className="text-xs font-semibold text-gray-400 pb-3">
                  STATUS
                </th>
                <th className="text-xs font-semibold text-gray-400 pb-3">
                  AMOUNT
                </th>
                <th className="text-xs font-semibold text-gray-400 pb-3">
                  DUE DATE
                </th>
                <th className="text-xs font-semibold text-gray-400 pb-3">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    <div className="animate-pulse">
                      Loading data from Firestore...
                    </div>
                  </td>
                </tr>
              ) : outfits.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No outfits found. Click "+ New Outfit" to start.
                  </td>
                </tr>
              ) : (
                outfits.map((outfit) => (
                  <tr
                    key={outfit.id}
                    className="border-b border-gray-800 hover:bg-gray-800/50 transition"
                  >
                    <td className="py-4 text-sm text-gray-300 font-medium">
                      {outfit.clientName}
                    </td>
                    <td className="py-4 text-sm text-gray-400">
                      {outfit.outfitType}
                    </td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(outfit.status)}`}
                      >
                        {getStatusIcon(outfit.status)}
                        {outfit.status}
                      </span>
                    </td>
                    <td className="py-4 text-sm font-semibold text-indigo-400">
                      ₦{Number(outfit.amount || 0).toLocaleString()}
                    </td>
                    <td className="py-4 text-sm text-gray-400">
                      {outfit.dueDate}
                    </td>
                    <td className="py-4 text-sm text-gray-400">
                      <div className="flex items-center gap-3">
                        <button onClick={() => navigate(`/outfits/${outfit.id}`)} className="hover:text-white">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => navigate(`/outfits/${outfit.id}`)} className="hover:text-indigo-400">
                          <Edit2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Outfits;
