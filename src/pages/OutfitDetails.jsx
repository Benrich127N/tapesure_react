// src/pages/OutfitDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { 
  ArrowLeft, Save, Trash2, Calendar, User, 
  Scissors, DollarSign, FileText, Tag, CheckCircle 
} from "lucide-react";

const OutfitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State for form fields
  const [formData, setFormData] = useState({
    clientName: "",
    outfitType: "",
    status: "",
    dueDate: "",
    amount: "",
    notes: ""
  });

  // 1. Fetch Outfit Data on Load
  useEffect(() => {
    const fetchOutfit = async () => {
      try {
        const docRef = doc(db, "outfits", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setFormData(docSnap.data());
        } else {
          alert("Outfit not found!");
          navigate("/outfits");
        }
      } catch (error) {
        console.error("Error fetching outfit:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOutfit();
  }, [id, navigate]);

  // 2. Handle Update
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const docRef = doc(db, "outfits", id);
      await updateDoc(docRef, {
        ...formData,
        amount: Number(formData.amount),
        updatedAt: serverTimestamp()
      });
      alert("Project updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setSaving(false);
    }
  };

  // 3. Handle Delete
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this outfit? This cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "outfits", id));
        navigate("/outfits");
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center text-gray-500 animate-pulse">
      Loading Project Details...
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate("/outfits")}
          className="flex items-center text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </button>
        <div className="flex gap-3">
          <button 
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-900/20 text-red-400 border border-red-800/50 rounded-lg hover:bg-red-900/40 transition"
          >
            <Trash2 size={18} /> Delete
          </button>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-indigo-600 p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">{formData.clientName}</h1>
            <p className="text-indigo-100">{formData.outfitType}</p>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-full border border-white/20">
            <span className="text-white font-bold tracking-wide uppercase text-xs">{formData.status}</span>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 flex items-center gap-2"><Tag size={16}/> Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Ready">Ready</option>
                <option value="Delivered">Delivered</option>
                <option value="Delayed">Delayed</option>
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 flex items-center gap-2"><Calendar size={16}/> Due Date</label>
              <input 
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 flex items-center gap-2"><DollarSign size={16}/> Amount (₦)</label>
              <input 
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Outfit Type (Edit in details too) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 flex items-center gap-2"><Scissors size={16}/> Outfit Type</label>
              <input 
                type="text"
                value={formData.outfitType}
                onChange={(e) => setFormData({...formData, outfitType: e.target.value})}
                className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 flex items-center gap-2"><FileText size={16}/> Notes & Measurements</label>
            <textarea 
              rows="5"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            ></textarea>
          </div>

          <button 
            disabled={saving}
            className="w-full bg-white hover:bg-gray-200 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition active:scale-95"
          >
            {saving ? "Updating..." : <><CheckCircle size={20}/> Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OutfitDetails;