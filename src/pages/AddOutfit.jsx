// src/pages/AddOutfit.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ArrowLeft, Save, Scissors, Calendar, User, DollarSign, FileText } from "lucide-react";

const AddOutfit = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    clientName: "",
    outfitType: "",
    dueDate: "",
    amount: "",
    notes: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "outfits"), {
        userId: auth.currentUser.uid,
        clientName: formData.clientName,
        outfitType: formData.outfitType,
        status: "In Progress", // Default status as requested
        dueDate: formData.dueDate,
        amount: Number(formData.amount),
        notes: formData.notes,
        createdAt: serverTimestamp()
      });

      navigate("/outfits"); // Go back to list after success
    } catch (error) {
      console.error("Error adding outfit:", error);
      alert("Failed to save outfit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate("/outfits")}
          className="flex items-center text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Outfits
        </button>
        <h1 className="text-2xl font-bold text-white">New Outfit Order</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <User size={16} /> Client Name
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Sarah Johnson"
              className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
              onChange={(e) => setFormData({...formData, clientName: e.target.value})}
            />
          </div>

          {/* Outfit Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Scissors size={16} /> Outfit Type
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Ankara Gown"
              className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
              onChange={(e) => setFormData({...formData, outfitType: e.target.value})}
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Calendar size={16} /> Due Date
            </label>
            <input
              required
              type="date"
              className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <DollarSign size={16} /> Amount (₦)
            </label>
            <input
              required
              type="number"
              placeholder="50000"
              className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
            <FileText size={16} /> Additional Notes
          </label>
          <textarea
            rows="4"
            placeholder="Fabric details, measurements adjustments, special requests..."
            className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
          ></textarea>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all 
              ${loading ? 'bg-gray-800 text-gray-500' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-95'}`}
          >
            {loading ? "Processing..." : <><Save size={20} /> Create Order</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddOutfit;