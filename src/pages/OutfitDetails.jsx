// src/pages/OutfitDetails.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { auth, db } from "../../firebase";
import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  celebrateMilestone,
  DELIVERY_MILESTONES,
} from "../utils/milestones";
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

import { MeasurementFields, MeasurementValues } from "../components/MeasurementFields";
import { hasMeasurements, measurementDraft, measurementPayload, measurementsChanged } from "../utils/measurements";
import "./Measurements.css";

const OutfitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveNotice, setSaveNotice] = useState("");
  const savingRef = useRef(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const editMode = searchParams.get("edit") === "true";
  const setEditMode = (editing) => setSearchParams((previous) => {
    const next = new URLSearchParams(previous);
    if (editing) next.set("edit", "true");
    else next.delete("edit");
    return next;
  }, { replace: true });
  const [outfit, setOutfit] = useState(null);
  const [formData, setFormData] = useState({
    clientName: "",
    outfitType: "",
    dueDate: "",
    amount: "",
    status: "Pending",
    notes: "",
    measurements: measurementDraft()
  });

  // Fetch outfit data
  useEffect(() => {
    let active = true;
    const fetchOutfit = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const outfitDoc = await getDoc(doc(db, "outfits", id));
        if (!active) return;
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
            measurements: measurementDraft(data.measurements)
          });
        } else {
          setLoadError("This order could not be found.");
        }
      } catch (error) {
        console.error("Error fetching outfit:", error);
        if (active) setLoadError("We couldn’t load this order. Check your connection and try again.");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchOutfit();
    return () => { active = false; };
  }, [id, loadAttempt]);

  // Update outfit
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (savingRef.current) return;
    savingRef.current = true;
    setSaveError("");
    setSaveNotice("");
    setSaving(true);
    const becameDelivered = outfit?.status !== "Delivered" && formData.status === "Delivered";

    try {
      const changes = {
        clientName: formData.clientName,
        outfitType: formData.outfitType,
        status: formData.status,
        dueDate: formData.dueDate,
        amount: Number(formData.amount),
        notes: formData.notes,
        ...(measurementsChanged(formData.measurements, outfit.measurements) ? {
          measurements: measurementPayload(formData.measurements, outfit.measurements),
          measurementsUpdatedAt: new Date().toISOString(),
        } : {})
      };
      await updateDoc(doc(db, "outfits", id), changes);
      setOutfit({ ...outfit, ...changes });
      setFormData(current => ({ ...current, measurements: measurementDraft(changes.measurements ?? outfit.measurements) }));
      setEditMode(false);
      setSaveNotice("Order updated successfully.");

      if (becameDelivered && auth.currentUser) {
        try {
          const deliveredSnapshot = await getCountFromServer(
            query(
              collection(db, "outfits"),
              where("userId", "==", auth.currentUser.uid),
              where("status", "==", "Delivered"),
            ),
          );
          const deliveryCount = deliveredSnapshot.data().count;

          if (DELIVERY_MILESTONES.includes(deliveryCount)) {
            celebrateMilestone({
              id: `deliveries-${deliveryCount}`,
              title: deliveryCount === 1 ? "Your first delivery!" : `${deliveryCount} orders delivered!`,
              message: deliveryCount === 1
                ? "From customer details to finished outfit—your first tracked delivery is complete."
                : "That is real work completed and real customers served. Well done.",
              emoji: "🏆",
            });
          }
        } catch (milestoneError) {
          console.warn("Order updated, but delivery milestone counting failed:", milestoneError);
        }
      }


    } catch (error) {
      console.error("Error updating outfit:", error);
      setSaveError("Could not save this order. Your edits are still here. Please try again.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  // Delete outfit
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this order?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "outfits", id));
      navigate("/outfits");
    } catch (error) {
      console.error("Error deleting outfit:", error);
      alert("We couldn’t delete this order. Please try again.");
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
      <div role="status" className="w-full max-w-4xl mx-auto py-10 text-center text-gray-300">
        <div className="animate-pulse">Loading order details…</div>
      </div>
    );
  }

  if (loadError || !outfit) {
    return <div role="alert" className="mx-auto w-full max-w-4xl rounded-xl border border-gray-800 bg-gray-900 p-6 text-center">
      <h1 className="text-xl font-bold text-white">Order unavailable</h1>
      <p className="mt-3 text-sm text-gray-300">{loadError || "This order could not be found."}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => setLoadAttempt((value) => value + 1)} className="min-h-11 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-500">Try again</button>
        <button type="button" onClick={() => navigate("/outfits")} className="min-h-11 rounded-lg border border-gray-700 px-4 text-sm font-semibold text-gray-200 hover:bg-gray-800">Back to Orders</button>
      </div>
    </div>;
  }

  return (
    <div className="measurement-order w-full max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {saveNotice && <p role="status" className="rounded-lg border border-green-800 bg-green-900/20 p-3 text-sm text-green-200">{saveNotice}</p>}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <button 
          onClick={() => navigate("/outfits")}
          className="min-h-11 flex items-center text-gray-300 hover:text-white transition text-sm sm:text-base self-start"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Back to Orders
        </button>
        <div className="flex gap-2">
          {!editMode ? (
            <>
              <button
                onClick={() => setEditMode(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white min-h-11 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition active:scale-95"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-700 min-h-11 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition active:scale-95"
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
                  measurements: measurementDraft(outfit.measurements)
                });
              }}
              className="bg-gray-800 hover:bg-gray-700 text-white min-h-11 px-4 py-2 rounded-lg text-sm font-medium transition active:scale-95"
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
                {!hasMeasurements(outfit.measurements) && <button onClick={() => setEditMode(true)} className="min-h-11 rounded-lg px-3 text-sm text-indigo-300">Add measurements</button>}
            </div>
            <MeasurementValues measurements={outfit.measurements} />
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <form onSubmit={handleUpdate} aria-busy={saving} className="bg-gray-900 border border-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          {/* Outfit Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Scissors className="w-5 h-5 text-indigo-400" />
              <h1 className="text-lg sm:text-xl font-bold text-white">Edit order</h1>
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
                  <option value="Received">Received</option>
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

            <MeasurementFields value={formData.measurements} legacy={Object.hasOwn(outfit.measurements || {}, "length")} disabled={saving} onChange={measurements => setFormData(current => ({ ...current, measurements }))} />
          </div>
          {saveError && <p role="alert" className="rounded-lg border border-red-800 bg-red-900/20 p-3 text-sm text-red-200">{saveError}</p>}

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
