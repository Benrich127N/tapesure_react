import React, { useEffect, useState } from "react";
import { db, auth } from "../../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { CheckCircle, Clock, XCircle, Package, Edit2, Eye, Plus } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Outfits = () => {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // STATS should always reflect the TOTAL data (not filtered)
  const stats = {
    total: outfits.length,
    inProgress: outfits.filter((o) => ["In Progress", "Sewing", "Cutting", "Fitting"].includes(o.status)).length,
    delivered: outfits.filter((o) => o.status === "Delivered").length,
    delayed: outfits.filter((o) => o.status === "Delayed").length,
  };

  // FILTER the list for the table based on the search bar
  const searchQuery = searchParams.get("q")?.toLowerCase() || "";
  const filteredOutfits = outfits.filter(outfit => 
    outfit.clientName?.toLowerCase().includes(searchQuery) ||
    outfit.outfitType?.toLowerCase().includes(searchQuery) ||
    outfit.status?.toLowerCase().includes(searchQuery)
  );

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
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "Delivered":
        return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "In Progress":
        return <Clock className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "Delayed":
        return <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      default:
        return <Package className="w-3 h-3 sm:w-4 sm:h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-900/30 text-green-400 border border-green-700";
      case "Ready": 
        return "bg-indigo-900/30 text-indigo-400 border border-indigo-700";
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
    <div className="w-full space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
            Outfit Management
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            Track, monitor, and manage all outfit projects.
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs sm:text-sm text-gray-400">Today</p>
          <p className="text-base sm:text-lg font-semibold text-white">
            {new Date().toLocaleDateString("en-US", {
              weekday: 'short',
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {outfitStats.map((stat, index) => (
          <div
            key={index}
            className="bg-gray-900 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`p-2 sm:p-3 rounded-lg ${stat.bg}`}>
                <Package className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
              </div>
              <span className="text-[10px] sm:text-xs text-gray-600">{stat.sub}</span>
            </div>
            <h3 className="text-gray-400 text-[10px] sm:text-sm font-medium mb-1">
              {stat.title}
            </h3>
            <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${stat.color} mb-1`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Outfits Table */}
      <div className="bg-gray-900 rounded-lg sm:rounded-xl shadow-lg border border-gray-800 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-white">Recent Outfits</h2>
          <button
            onClick={() => navigate("/outfits/new")}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm transition flex items-center justify-center gap-2 active:scale-95"
          >
            <Plus size={18} /> New Outfit
          </button>
        </div>

        {/* Mobile Card View */}
        <div className="block lg:hidden space-y-3">
          {loading ? (
            <div className="py-8 text-center text-gray-500">
              <div className="animate-pulse">Loading data from Firestore...</div>
            </div>
          ) : filteredOutfits.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No outfits found. Click "+ New Outfit" to start.
            </div>
          ) : (
            filteredOutfits.map((outfit) => (
              <div
                key={outfit.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-3"
              >
                {/* Client Name & Status */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-200">
                      {outfit.clientName}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {outfit.outfitType}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded-full ${getStatusColor(outfit.status)}`}
                  >
                    {getStatusIcon(outfit.status)}
                    {outfit.status}
                  </span>
                </div>

                {/* Amount & Due Date */}
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="font-semibold text-indigo-400">
                      ₦{Number(outfit.amount || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Due Date</p>
                    <p className="text-gray-300">{outfit.dueDate}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-gray-700">
                  <button
                    onClick={() => navigate(`/outfits/${outfit.id}`)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-2"
                  >
                    <Eye size={16} /> View
                  </button>
                  <button
                    onClick={() => navigate(`/outfits/${outfit.id}`)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-2"
                  >
                    <Edit2 size={16} /> Edit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
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
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    <div className="animate-pulse">
                      Loading data from Firestore...
                    </div>
                  </td>
                </tr>
              ) : filteredOutfits.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No outfits found. Click "+ New Outfit" to start.
                  </td>
                </tr>
              ) : (
                filteredOutfits.map((outfit) => (
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
                        <button 
                          onClick={() => navigate(`/outfits/${outfit.id}`)} 
                          className="hover:text-white transition"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => navigate(`/outfits/${outfit.id}`)} 
                          className="hover:text-indigo-400 transition"
                        >
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