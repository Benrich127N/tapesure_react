// src/pages/AddOutfit.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../firebase";
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  getDocs, 
  query, 
  where 
} from "firebase/firestore";
import { 
  ArrowLeft, 
  Save, 
  User, 
  Zap,
  Calendar as CalendarIcon
} from "lucide-react";

// Helper function to auto-create client
const ensureClientExists = async (clientName) => {
  if (!clientName.trim() || !auth.currentUser) return;

  const clientsRef = collection(db, "clients");
  const q = query(
    clientsRef,
    where("userId", "==", auth.currentUser.uid),
    where("name", "==", clientName.trim())
  );

  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    await addDoc(clientsRef, {
      userId: auth.currentUser.uid,
      name: clientName.trim(),
      phone: "", 
      email: "",
      createdAt: serverTimestamp()
    });
  }
};

const AddOutfit = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [formData, setFormData] = useState({
    clientName: "",
    outfitType: "",
    status: "Cutting",
    dueDate: "",
    amount: "",
    clientGender: "male",
    // Top measurements
    shoulder: "",
    chest: "",
    neck: "",
    sleeve: "",
    sleeveCirc: "",
    topLength: "",
    // Trouser measurements
    waist: "",
    hip: "",
    lap: "",
    crotch: "",
    knee: "",
    boot: "",
    trouserLength: "",
    notes: ""
  });

  // Fetch existing clients for autocomplete
  useEffect(() => {
    const fetchClients = async () => {
      if (!auth.currentUser) return;

      const q = query(
        collection(db, "clients"),
        where("userId", "==", auth.currentUser.uid)
      );

      const snapshot = await getDocs(q);
      const clientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setClients(clientsData);
    };

    fetchClients();
  }, []);

  // Auto-fill client info when selected
  const handleClientSelect = (clientName) => {
    setFormData(prev => ({ ...prev, clientName }));
  };

  // Quick date shortcuts
  const setQuickDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    setFormData(prev => ({ 
      ...prev, 
      dueDate: date.toISOString().split('T')[0] 
    }));
    setShowDatePicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Minimum validation - only client name required
    if (!formData.clientName.trim()) {
      alert("Client name is required");
      return;
    }

    setSaving(true);

    try {
      await ensureClientExists(formData.clientName);

      // Only save measurements if at least one is filled
      const hasMeasurements = 
        formData.shoulder || formData.chest || formData.neck || 
        formData.sleeve || formData.sleeveCirc || formData.topLength ||
        formData.waist || formData.hip || formData.lap || 
        formData.crotch || formData.knee || formData.boot || formData.trouserLength;

      const measurementsData = hasMeasurements ? {
        clientGender: formData.clientGender,
        top: {
          shoulder: Number(formData.shoulder) || 0,
          chest: Number(formData.chest) || 0,
          neck: Number(formData.neck) || 0,
          sleeve: Number(formData.sleeve) || 0,
          sleeveCircumference: Number(formData.sleeveCirc) || 0,
          length: Number(formData.topLength) || 0
        },
        trouser: {
          waist: Number(formData.waist) || 0,
          hip: Number(formData.hip) || 0,
          lap: Number(formData.lap) || 0,
          crotch: Number(formData.crotch) || 0,
          knee: Number(formData.knee) || 0,
          boot: Number(formData.boot) || 0,
          length: Number(formData.trouserLength) || 0
        },
        notes: formData.notes || ""
      } : null;

      await addDoc(collection(db, "outfits"), {
        userId: auth.currentUser.uid,
        clientName: formData.clientName.trim(),
        outfitType: formData.outfitType || "Not specified",
        status: formData.status,
        dueDate: formData.dueDate || new Date().toISOString().split('T')[0],
        amount: Number(formData.amount) || 0,
        notes: formData.notes,
        measurements: measurementsData,
        createdAt: serverTimestamp()
      });

      // Success! Go back
      navigate("/outfits");
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-3 sm:space-y-4 pb-8">
      {/* Ultra-compact header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate("/outfits")}
          className="flex items-center text-gray-400 hover:text-white transition text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <h1 className="text-lg sm:text-xl font-bold text-white">Quick Add</h1>
        </div>
      </div>

      {/* Single-page form */}
      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-3 sm:space-y-4">
        
        {/* Essential Info - Always visible */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pb-3 border-b border-gray-800">
          {/* Client Name - with autocomplete */}
          <div className="relative sm:col-span-2">
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Client Name <span className="text-red-400">*</span>
            </label>
            <input
              required
              type="text"
              list="clients"
              value={formData.clientName}
              onChange={(e) => setFormData({...formData, clientName: e.target.value})}
              placeholder="Type or select client"
              className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              autoFocus
            />
            <datalist id="clients">
              {clients.map(client => (
                <option key={client.id} value={client.name} />
              ))}
            </datalist>
          </div>

          {/* Outfit Type */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Outfit Type
            </label>
            <input
              type="text"
              value={formData.outfitType}
              onChange={(e) => setFormData({...formData, outfitType: e.target.value})}
              placeholder="e.g. Kaftan, Suit"
              className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Status - Quick select */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="Cutting">Cutting</option>
              <option value="Sewing">Sewing</option>
              <option value="Fitting">Fitting</option>
              <option value="Ready">Ready</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>

          {/* Due Date - Quick shortcuts */}
          <div className="relative">
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Due Date
            </label>
            <div className="flex gap-1">
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                className="flex-1 bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="bg-gray-800 hover:bg-gray-700 text-white px-2 rounded-lg text-xs transition"
              >
                <CalendarIcon className="w-4 h-4" />
              </button>
            </div>
            {showDatePicker && (
              <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg p-2 z-10 flex flex-wrap gap-1 shadow-lg">
                <button type="button" onClick={() => setQuickDate(3)} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white">3 days</button>
                <button type="button" onClick={() => setQuickDate(7)} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white">1 week</button>
                <button type="button" onClick={() => setQuickDate(14)} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white">2 weeks</button>
                <button type="button" onClick={() => setQuickDate(30)} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white">1 month</button>
              </div>
            )}
          </div>

          {/* Amount - Optional */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Amount (₦) <span className="text-gray-600 text-[10px]">optional</span>
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="0"
              className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Gender Toggle - Compact */}
        <div className="flex items-center gap-4 py-2 border-b border-gray-800">
          <span className="text-xs font-medium text-gray-400">Gender:</span>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="male"
              checked={formData.clientGender === "male"}
              onChange={(e) => setFormData({...formData, clientGender: e.target.value})}
              className="w-3 h-3 text-indigo-600"
            />
            <span className="text-xs text-gray-300">Male</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="female"
              checked={formData.clientGender === "female"}
              onChange={(e) => setFormData({...formData, clientGender: e.target.value})}
              className="w-3 h-3 text-indigo-600"
            />
            <span className="text-xs text-gray-300">Female</span>
          </label>
        </div>

        {/* Measurements - Compact grid */}
        <div className="space-y-3">
          {/* TOP */}
          <div>
            <h3 className="text-xs font-semibold text-yellow-400 mb-2 uppercase tracking-wide">Top Measurements (inches)</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              <input type="number" step="0.5" value={formData.shoulder} onChange={(e) => setFormData({...formData, shoulder: e.target.value})} placeholder="Shoulder" className="bg-black border border-gray-700 rounded px-2 py-1.5 text-xs text-white placeholder-gray-600 focus:ring-1 focus:ring-yellow-500 outline-none" />
              <input type="number" step="0.5" value={formData.chest} onChange={(e) => setFormData({...formData, chest: e.target.value})} placeholder="Chest" className="bg-black border border-gray-700 rounded px-2 py-1.5 text-xs text-white placeholder-gray-600 focus:ring-1 focus:ring-yellow-500 outline-none" />
              <input type="number" step="0.5" value={formData.neck} onChange={(e) => setFormData({...formData, neck: e.target.value})} placeholder="Neck" className="bg-black border border-gray-700 rounded px-2 py-1.5 text-xs text-white placeholder-gray-600 focus:ring-1 focus:ring-yellow-500 outline-none" />
              <input type="number" step="0.5" value={formData.sleeve} onChange={(e) => setFormData({...formData, sleeve: e.target.value})} placeholder="Sleeve" className="bg-black border border-gray-700 rounded px-2 py-1.5 text-xs text-white placeholder-gray-600 focus:ring-1 focus:ring-yellow-500 outline-none" />
              <input type="number" step="0.5" value={formData.sleeveCirc} onChange={(e) => setFormData({...formData, sleeveCirc: e.target.value})} placeholder="S.Circ" className="bg-black border border-gray-700 rounded px-2 py-1.5 text-xs text-white placeholder-gray-600 focus:ring-1 focus:ring-yellow-500 outline-none" />
              <input type="number" step="0.5" value={formData.topLength} onChange={(e) => setFormData({...formData, topLength: e.target.value})} placeholder="Length" className="bg-black border border-gray-700 rounded px-2 py-1.5 text-xs text-white placeholder-gray-600 focus:ring-1 focus:ring-yellow-500 outline-none" />
            </div>
          </div>

          {/* TROUSER */}
          <div>
            <h3 className="text-xs font-semibold text-green-400 mb-2 uppercase tracking-wide">Trouser Measurements (inches)</h3>
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
              <input type="number" step="0.5" value={formData.waist} onChange={(e) => setFormData({...formData, waist: e.target.value})} placeholder="Waist" className="bg-black border border-gray-700 rounded px-2 py-1.5 text-xs text-white placeholder-gray-600 focus:ring-1 focus:ring-green-500 outline-none" />
              <input type="number" step="0.5" value={formData.hip} onChange={(e) => setFormData({...formData, hip: e.target.value})} placeholder="Hip" className="bg-black border border-gray-700 rounded px-2 py-1.5 text-xs text-white placeholder-gray-600 focus:ring-1 focus:ring-green-500 outline-none" />
              <input type="number" step="0.5" value={formData.lap} onChange={(e) => setFormData({...formData, lap: e.target.value})} placeholder="Lap" className="bg-black border border-gray-700 rounded px-2 py-1.5 text-xs text-white placeholder-gray-600 focus:ring-1 focus:ring-green-500 outline-none" />
              <input type="number" step="0.5" value={formData.crotch} onChange={(e) => setFormData({...formData, crotch: e.target.value})} placeholder="Crotch" className="bg-black border border-gray-700 rounded px-2 py-1.5 text-xs text-white placeholder-gray-600 focus:ring-1 focus:ring-green-500 outline-none" />
              <input type="number" step="0.5" value={formData.knee} onChange={(e) => setFormData({...formData, knee: e.target.value})} placeholder="Knee" className="bg-black border border-gray-700 rounded px-2 py-1.5 text-xs text-white placeholder-gray-600 focus:ring-1 focus:ring-green-500 outline-none" />
              <input type="number" step="0.5" value={formData.boot} onChange={(e) => setFormData({...formData, boot: e.target.value})} placeholder="Boot" className="bg-black border border-gray-700 rounded px-2 py-1.5 text-xs text-white placeholder-gray-600 focus:ring-1 focus:ring-green-500 outline-none" />
              <input type="number" step="0.5" value={formData.trouserLength} onChange={(e) => setFormData({...formData, trouserLength: e.target.value})} placeholder="Length" className="bg-black border border-gray-700 rounded px-2 py-1.5 text-xs text-white placeholder-gray-600 focus:ring-1 focus:ring-green-500 outline-none" />
            </div>
          </div>

          {/* Notes - Compact */}
          <div>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Quick notes (optional)..."
              rows="2"
              className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
            ></textarea>
          </div>
        </div>

        {/* Save Button - Prominent */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition text-sm sm:text-base ${
              saving 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95 shadow-lg'
            }`}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                Save Order
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quick tip */}
      <div className="bg-indigo-900/20 border border-indigo-800 rounded-lg p-2 sm:p-3">
        <p className="text-[10px] sm:text-xs text-indigo-300 text-center">
          💡 <strong>Tip:</strong> Only client name is required. Add measurements as you take them - save time!
        </p>
      </div>
    </div>
  );
};

export default AddOutfit;