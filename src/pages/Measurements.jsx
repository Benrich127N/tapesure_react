// src/pages/Measurements.jsx
import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Ruler, 
  User, 
  Eye,
  Download,
  Filter,
  Users,
  Calendar,
  TrendingUp
} from "lucide-react";

const Measurements = () => {
  const navigate = useNavigate();
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "outfits"),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Only include outfits that have measurements
      const withMeasurements = data.filter(outfit => 
        outfit.measurements && 
        (outfit.measurements.top || outfit.measurements.trouser)
      );
      
      setOutfits(withMeasurements);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter outfits
  const filteredOutfits = outfits.filter(outfit => {
    const matchesSearch = 
      outfit.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      outfit.outfitType?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGender = 
      genderFilter === "all" || 
      outfit.measurements?.clientGender === genderFilter;
    
    return matchesSearch && matchesGender;
  });

  // Get unique clients with their latest measurements
  const getUniqueClients = () => {
    const clientMap = new Map();
    
    filteredOutfits.forEach(outfit => {
      const existing = clientMap.get(outfit.clientName);
      if (!existing || new Date(outfit.createdAt?.toDate()) > new Date(existing.createdAt?.toDate())) {
        clientMap.set(outfit.clientName, outfit);
      }
    });
    
    return Array.from(clientMap.values());
  };

  const uniqueClients = getUniqueClients();

  // Export measurements as CSV
  const exportToCSV = () => {
    const headers = [
      "Client Name",
      "Gender",
      "Outfit Type",
      "Date",
      // Top
      "Shoulder",
      "Chest",
      "Neck",
      "Sleeve",
      "Sleeve Circ",
      "Top Length",
      // Trouser
      "Waist",
      "Hip",
      "Lap",
      "Crotch",
      "Knee",
      "Boot",
      "Trouser Length"
    ];

    const rows = filteredOutfits.map(outfit => [
      outfit.clientName,
      outfit.measurements?.clientGender || "",
      outfit.outfitType,
      outfit.createdAt?.toDate().toLocaleDateString() || "",
      outfit.measurements?.top?.shoulder || "",
      outfit.measurements?.top?.chest || "",
      outfit.measurements?.top?.neck || "",
      outfit.measurements?.top?.sleeve || "",
      outfit.measurements?.top?.sleeveCircumference || "",
      outfit.measurements?.top?.length || "",
      outfit.measurements?.trouser?.waist || "",
      outfit.measurements?.trouser?.hip || "",
      outfit.measurements?.trouser?.lap || "",
      outfit.measurements?.trouser?.crotch || "",
      outfit.measurements?.trouser?.knee || "",
      outfit.measurements?.trouser?.boot || "",
      outfit.measurements?.trouser?.length || ""
    ]);

    const csv = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `measurements-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const stats = {
    total: uniqueClients.length,
    male: uniqueClients.filter(o => o.measurements?.clientGender === "male").length,
    female: uniqueClients.filter(o => o.measurements?.clientGender === "female").length,
    thisMonth: filteredOutfits.filter(o => {
      if (!o.createdAt) return false;
      const date = o.createdAt.toDate();
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 flex items-center gap-2">
            <Ruler className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400" />
            Measurements Library
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            All client measurements in one place
          </p>
        </div>
        <button 
          onClick={exportToCSV}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition active:scale-95 text-sm sm:text-base"
        >
          <Download className="w-4 h-4 sm:w-5 sm:h-5" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gray-900 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
            <span className="text-xs text-gray-500">Clients</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white mb-1">{stats.total}</p>
          <p className="text-xs sm:text-sm text-gray-400">With measurements</p>
        </div>

        <div className="bg-gray-900 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            <span className="text-xs text-gray-500">Male</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-blue-400 mb-1">{stats.male}</p>
          <p className="text-xs sm:text-sm text-gray-400">Clients</p>
        </div>

        <div className="bg-gray-900 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400" />
            <span className="text-xs text-gray-500">Female</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-pink-400 mb-1">{stats.female}</p>
          <p className="text-xs sm:text-sm text-gray-400">Clients</p>
        </div>

        <div className="bg-gray-900 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
            <span className="text-xs text-gray-500">This Month</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-green-400 mb-1">{stats.thisMonth}</p>
          <p className="text-xs sm:text-sm text-gray-400">New orders</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-gray-900 rounded-lg sm:rounded-xl shadow-lg border border-gray-800 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search by client name or outfit type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setGenderFilter("all")}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                genderFilter === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setGenderFilter("male")}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                genderFilter === "male"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              Male
            </button>
            <button
              onClick={() => setGenderFilter("female")}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                genderFilter === "female"
                  ? "bg-pink-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              Female
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-10 text-gray-500">
          <div className="animate-pulse">Loading measurements...</div>
        </div>
      )}

      {/* Client Cards - Mobile */}
      {!loading && filteredOutfits.length > 0 && (
        <div className="block lg:hidden space-y-3">
          {uniqueClients.map((outfit) => (
            <div
              key={outfit.id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-3"
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {outfit.clientName}
                  </h3>
                  <p className="text-xs text-gray-400">{outfit.outfitType}</p>
                  <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full ${
                    outfit.measurements?.clientGender === "male" 
                      ? "bg-blue-900/30 text-blue-400" 
                      : "bg-pink-900/30 text-pink-400"
                  }`}>
                    {outfit.measurements?.clientGender || "N/A"}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/outfits/${outfit.id}`)}
                  className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              {/* Measurements Summary */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800">
                {outfit.measurements?.top?.chest > 0 && (
                  <div className="bg-gray-800 rounded p-2">
                    <p className="text-[10px] text-gray-500">Chest</p>
                    <p className="text-sm font-semibold text-white">
                      {outfit.measurements.top.chest}"
                    </p>
                  </div>
                )}
                {outfit.measurements?.trouser?.waist > 0 && (
                  <div className="bg-gray-800 rounded p-2">
                    <p className="text-[10px] text-gray-500">Waist</p>
                    <p className="text-sm font-semibold text-white">
                      {outfit.measurements.trouser.waist}"
                    </p>
                  </div>
                )}
                {outfit.measurements?.top?.shoulder > 0 && (
                  <div className="bg-gray-800 rounded p-2">
                    <p className="text-[10px] text-gray-500">Shoulder</p>
                    <p className="text-sm font-semibold text-white">
                      {outfit.measurements.top.shoulder}"
                    </p>
                  </div>
                )}
                {outfit.measurements?.trouser?.length > 0 && (
                  <div className="bg-gray-800 rounded p-2">
                    <p className="text-[10px] text-gray-500">Trouser L.</p>
                    <p className="text-sm font-semibold text-white">
                      {outfit.measurements.trouser.length}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Desktop Table */}
      {!loading && filteredOutfits.length > 0 && (
        <div className="hidden lg:block bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800/50">
                  <th className="text-left text-xs font-semibold text-gray-400 p-4">CLIENT</th>
                  <th className="text-left text-xs font-semibold text-gray-400 p-4">GENDER</th>
                  <th className="text-left text-xs font-semibold text-gray-400 p-4">OUTFIT</th>
                  <th className="text-center text-xs font-semibold text-yellow-400 p-4" colSpan="6">TOP (inches)</th>
                  <th className="text-center text-xs font-semibold text-green-400 p-4" colSpan="7">TROUSER (inches)</th>
                  <th className="text-right text-xs font-semibold text-gray-400 p-4">ACTIONS</th>
                </tr>
                <tr className="border-b border-gray-800 bg-gray-800/30">
                  <th className="p-2"></th>
                  <th className="p-2"></th>
                  <th className="p-2"></th>
                  {/* Top sub-headers */}
                  <th className="text-center text-[10px] text-gray-500 p-2">Shoulder</th>
                  <th className="text-center text-[10px] text-gray-500 p-2">Chest</th>
                  <th className="text-center text-[10px] text-gray-500 p-2">Neck</th>
                  <th className="text-center text-[10px] text-gray-500 p-2">Sleeve</th>
                  <th className="text-center text-[10px] text-gray-500 p-2">S.Circ</th>
                  <th className="text-center text-[10px] text-gray-500 p-2">Length</th>
                  {/* Trouser sub-headers */}
                  <th className="text-center text-[10px] text-gray-500 p-2">Waist</th>
                  <th className="text-center text-[10px] text-gray-500 p-2">Hip</th>
                  <th className="text-center text-[10px] text-gray-500 p-2">Lap</th>
                  <th className="text-center text-[10px] text-gray-500 p-2">Crotch</th>
                  <th className="text-center text-[10px] text-gray-500 p-2">Knee</th>
                  <th className="text-center text-[10px] text-gray-500 p-2">Boot</th>
                  <th className="text-center text-[10px] text-gray-500 p-2">Length</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {uniqueClients.map((outfit) => (
                  <tr key={outfit.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition">
                    <td className="p-4">
                      <p className="text-sm font-semibold text-white">{outfit.clientName}</p>
                      <p className="text-xs text-gray-500">
                        {outfit.createdAt?.toDate().toLocaleDateString()}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block text-xs px-2 py-1 rounded-full ${
                        outfit.measurements?.clientGender === "male" 
                          ? "bg-blue-900/30 text-blue-400" 
                          : "bg-pink-900/30 text-pink-400"
                      }`}>
                        {outfit.measurements?.clientGender || "N/A"}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-400">{outfit.outfitType}</td>
                    
                    {/* Top measurements */}
                    <td className="p-4 text-center text-sm text-gray-300">
                      {outfit.measurements?.top?.shoulder || "-"}
                    </td>
                    <td className="p-4 text-center text-sm text-gray-300">
                      {outfit.measurements?.top?.chest || "-"}
                    </td>
                    <td className="p-4 text-center text-sm text-gray-300">
                      {outfit.measurements?.top?.neck || "-"}
                    </td>
                    <td className="p-4 text-center text-sm text-gray-300">
                      {outfit.measurements?.top?.sleeve || "-"}
                    </td>
                    <td className="p-4 text-center text-sm text-gray-300">
                      {outfit.measurements?.top?.sleeveCircumference || "-"}
                    </td>
                    <td className="p-4 text-center text-sm text-gray-300">
                      {outfit.measurements?.top?.length || "-"}
                    </td>
                    
                    {/* Trouser measurements */}
                    <td className="p-4 text-center text-sm text-gray-300">
                      {outfit.measurements?.trouser?.waist || "-"}
                    </td>
                    <td className="p-4 text-center text-sm text-gray-300">
                      {outfit.measurements?.trouser?.hip || "-"}
                    </td>
                    <td className="p-4 text-center text-sm text-gray-300">
                      {outfit.measurements?.trouser?.lap || "-"}
                    </td>
                    <td className="p-4 text-center text-sm text-gray-300">
                      {outfit.measurements?.trouser?.crotch || "-"}
                    </td>
                    <td className="p-4 text-center text-sm text-gray-300">
                      {outfit.measurements?.trouser?.knee || "-"}
                    </td>
                    <td className="p-4 text-center text-sm text-gray-300">
                      {outfit.measurements?.trouser?.boot || "-"}
                    </td>
                    <td className="p-4 text-center text-sm text-gray-300">
                      {outfit.measurements?.trouser?.length || "-"}
                    </td>
                    
                    <td className="p-4 text-right">
                      <button
                        onClick={() => navigate(`/outfits/${outfit.id}`)}
                        className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-gray-800 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredOutfits.length === 0 && (
        <div className="bg-gray-900 rounded-lg sm:rounded-xl shadow-lg border border-gray-800 p-8 sm:p-12 text-center">
          <Ruler className="w-12 h-12 sm:w-16 sm:h-16 text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-400 mb-2">
            {searchTerm ? "No measurements found" : "No measurements yet"}
          </h3>
          <p className="text-sm sm:text-base text-gray-500 mb-4">
            {searchTerm 
              ? "Try adjusting your search or filters" 
              : "Start adding measurements when creating outfits"
            }
          </p>
          {!searchTerm && (
            <button 
              onClick={() => navigate("/outfits/new")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition inline-flex items-center gap-2"
            >
              <Ruler className="w-4 h-4" />
              Add First Measurement
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Measurements;