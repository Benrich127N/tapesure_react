// src/pages/OutfitDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { 
  ArrowLeft, 
  Save, 
  Trash2,
  Scissors, 
  Calendar, 
  User, 
  DollarSign, 
  FileText, 
  Tag,
  Ruler,
  Edit,
  Clock,
  CheckCircle,
  XCircle,
  Package
} from "lucide-react";

const OutfitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [outfit, setOutfit] = useState(null);
  const [formData, setFormData] = useState({
    clientName: "",
    outfitType: "",
    dueDate: "",
    amount: "",
    status: "Pending",
    notes: "",
    measurements: {
      chest: "",
      waist: "",
      hip: "",
      sleeve: "",
      length: "",
      notes: ""
    }
  });

  // Fetch outfit data
  useEffect(() => {
    const fetchOutfit = async () => {
      try {
        const outfitDoc = await getDoc(doc(db, "outfits", id));
        if (outfitDoc.exists()) {
          const data = outfitDoc.data();
          setOutfit(data);
          setFormData({
            clientName: data.clientName || "",
            outfitType: data.outfitType || "",
            dueDate: data.dueDate || "",
            amount: data.amount || "",
            status: data.status || "Pending",
            notes: data.notes || "",
            measurements: {
              chest: data.measurements?.chest || "",
              waist: data.measurements?.waist || "",
              hip: data.measurements?.hip || "",
              sleeve: data.measurements?.sleeve || "",
              length: data.measurements?.length || "",
              notes: data.measurements?.notes || ""
            }
          });
        } else {
          alert("Outfit not found");
          navigate("/outfits");
        }
      } catch (error) {
        console.error("Error fetching outfit:", error);
        alert("Failed to load outfit");
      } finally {
        setLoading(false);
      }
    };

    fetchOutfit();
  }, [id, navigate]);

  // Update outfit
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateDoc(doc(db, "outfits", id), {
        clientName: formData.clientName,
        outfitType: formData.outfitType,
        status: formData.status,
        dueDate: formData.dueDate,
        amount: Number(formData.amount),
        notes: formData.notes,
        measurements: {
          chest: Number(formData.measurements.chest) || 0,
          waist: Number(formData.measurements.waist) || 0,
          hip: Number(formData.measurements.hip) || 0,
          sleeve: Number(formData.measurements.sleeve) || 0,
          length: Number(formData.measurements.length) || 0,
          notes: formData.measurements.notes || ""
        }
      });

      setEditMode(false);
      // Refresh outfit data
      const outfitDoc = await getDoc(doc(db, "outfits", id));
      setOutfit(outfitDoc.data());
      alert("Outfit updated successfully!");
    } catch (error) {
      console.error("Error updating outfit:", error);
      alert("Failed to update outfit");
    } finally {
      setSaving(false);
    }
  };

  // Delete outfit
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this outfit?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "outfits", id));
      navigate("/outfits");
    } catch (error) {
      console.error("Error deleting outfit:", error);
      alert("Failed to delete outfit");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Delivered": return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "Delayed": return <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "Cutting":
      case "Sewing":
      case "Fitting": return <Clock className="w-4 h-4 sm:w-5 sm:h-5" />;
      default: return <Package className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered": return "bg-green-900/30 text-green-400 border border-green-700";
      case "Delayed": return "bg-red-900/30 text-red-400 border border-red-700";
      case "Ready": return "bg-indigo-900/30 text-indigo-400 border border-indigo-700";
      case "Cutting":
      case "Sewing":
      case "Fitting":
      case "In Progress": return "bg-yellow-900/30 text-yellow-400 border border-yellow-700";
      default: return "bg-gray-800 text-gray-400 border border-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto py-10 text-center text-gray-500">
        <div className="animate-pulse">Loading outfit details...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <button 
          onClick={() => navigate("/outfits")}
          className="flex items-center text-gray-400 hover:text-white transition text-sm sm:text-base self-start"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Back to Outfits
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
                // Reset form data
                setFormData({
                  clientName: outfit.clientName || "",
                  outfitType: outfit.outfitType || "",
                  dueDate: outfit.dueDate || "",
                  amount: outfit.amount || "",
                  status: outfit.status || "Pending",
                  notes: outfit.notes || "",
                  measurements: {
                    chest: outfit.measurements?.chest || "",
                    waist: outfit.measurements?.waist || "",
                    hip: outfit.measurements?.hip || "",
                    sleeve: outfit.measurements?.sleeve || "",
                    length: outfit.measurements?.length || "",
                    notes: outfit.measurements?.notes || ""
                  }
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
          {/* Outfit Info Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  {outfit.outfitType}
                </h1>
                <p className="text-sm sm:text-base text-gray-400">
                  Client: {outfit.clientName}
                </p>
              </div>
              <span className={`inline-flex items-center gap-1 text-xs sm:text-sm font-bold uppercase px-3 py-1.5 rounded-full ${getStatusColor(outfit.status)}`}>
                {getStatusIcon(outfit.status)}
                {outfit.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-800">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-gray-500">Due Date</p>
                <p className="text-sm sm:text-base text-white font-medium">{outfit.dueDate}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-gray-500">Amount</p>
                <p className="text-sm sm:text-base text-indigo-400 font-semibold">
                  ₦{Number(outfit.amount || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {outfit.notes && (
              <div className="pt-4 border-t border-gray-800">
                <p className="text-xs sm:text-sm text-gray-500 mb-2">Notes</p>
                <p className="text-sm sm:text-base text-gray-300">{outfit.notes}</p>
              </div>
            )}
          </div>

          {/* Measurements Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                <h2 className="text-lg sm:text-xl font-bold text-white">Measurements</h2>
              </div>
              {(!outfit.measurements || Object.values(outfit.measurements).every(v => !v || v === 0)) && (
                <button
                  onClick={() => setEditMode(true)}
                  className="text-xs sm:text-sm text-indigo-400 hover:text-indigo-300 transition"
                >
                  + Add Measurements
                </button>
              )}
            </div>

            {outfit.measurements && (Object.values(outfit.measurements).some(v => v && v !== 0)) ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {outfit.measurements.chest > 0 && (
                    <div className="bg-gray-800 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Chest</p>
                      <p className="text-base sm:text-lg font-semibold text-white">
                        {outfit.measurements.chest}"
                      </p>
                    </div>
                  )}
                  {outfit.measurements.waist > 0 && (
                    <div className="bg-gray-800 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Waist</p>
                      <p className="text-base sm:text-lg font-semibold text-white">
                        {outfit.measurements.waist}"
                      </p>
                    </div>
                  )}
                  {outfit.measurements.hip > 0 && (
                    <div className="bg-gray-800 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Hip</p>
                      <p className="text-base sm:text-lg font-semibold text-white">
                        {outfit.measurements.hip}"
                      </p>
                    </div>
                  )}
                  {outfit.measurements.sleeve > 0 && (
                    <div className="bg-gray-800 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Sleeve</p>
                      <p className="text-base sm:text-lg font-semibold text-white">
                        {outfit.measurements.sleeve}"
                      </p>
                    </div>
                  )}
                  {outfit.measurements.length > 0 && (
                    <div className="bg-gray-800 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Length</p>
                      <p className="text-base sm:text-lg font-semibold text-white">
                        {outfit.measurements.length}"
                      </p>
                    </div>
                  )}
                </div>
                {outfit.measurements.notes && (
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Notes</p>
                    <p className="text-sm text-gray-300">{outfit.measurements.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Ruler className="w-12 h-12 sm:w-16 sm:h-16 text-gray-700 mx-auto mb-3" />
                <p className="text-sm sm:text-base text-gray-500 mb-3">No measurements added yet</p>
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition inline-flex items-center gap-2"
                >
                  <Ruler className="w-4 h-4" />
                  Add Measurements
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <form onSubmit={handleUpdate} className="bg-gray-900 border border-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          {/* Outfit Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Scissors className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg sm:text-xl font-bold text-white">Outfit Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-2">
                  <User size={14} /> Client Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                  className="w-full bg-black border border-gray-800 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Scissors size={14} /> Outfit Type
                </label>
                <input
                  required
                  type="text"
                  value={formData.outfitType}
                  onChange={(e) => setFormData({...formData, outfitType: e.target.value})}
                  className="w-full bg-black border border-gray-800 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Tag size={14} /> Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-black border border-gray-800 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Cutting">Cutting</option>
                  <option value="Sewing">Sewing</option>
                  <option value="Fitting">Fitting</option>
                  <option value="Ready">Ready</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Delayed">Delayed</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Calendar size={14} /> Due Date
                </label>
                <input
                  required
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  className="w-full bg-black border border-gray-800 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-2">
                  <DollarSign size={14} /> Amount (₦)
                </label>
                <input
                  required
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full bg-black border border-gray-800 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-2">
                <FileText size={14} /> Notes
              </label>
              <textarea
                rows="3"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full bg-black border border-gray-800 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              ></textarea>
            </div>
          </div>

          {/* Measurements Section */}
          <div className="space-y-4 pt-4 border-t border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <Ruler className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg sm:text-xl font-bold text-white">Measurements</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-400">Chest (inches)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.measurements.chest}
                  onChange={(e) => setFormData({
                    ...formData,
                    measurements: {...formData.measurements, chest: e.target.value}
                  })}
                  className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-400">Waist (inches)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.measurements.waist}
                  onChange={(e) => setFormData({
                    ...formData,
                    measurements: {...formData.measurements, waist: e.target.value}
                  })}
                  className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-400">Hip (inches)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.measurements.hip}
                  onChange={(e) => setFormData({
                    ...formData,
                    measurements: {...formData.measurements, hip: e.target.value}
                  })}
                  className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-400">Sleeve (inches)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.measurements.sleeve}
                  onChange={(e) => setFormData({
                    ...formData,
                    measurements: {...formData.measurements, sleeve: e.target.value}
                  })}
                  className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-400">Length (inches)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.measurements.length}
                  onChange={(e) => setFormData({
                    ...formData,
                    measurements: {...formData.measurements, length: e.target.value}
                  })}
                  className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-400">Measurement Notes</label>
              <textarea
                rows="2"
                value={formData.measurements.notes}
                onChange={(e) => setFormData({
                  ...formData,
                  measurements: {...formData.measurements, notes: e.target.value}
                })}
                className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              ></textarea>
            </div>
          </div>

          {/* Save Button */}
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

export default OutfitDetails;