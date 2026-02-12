// src/pages/CreateInvoice.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../firebase";
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs 
} from "firebase/firestore";
import { 
  ArrowLeft, 
  Save, 
  User, 
  Phone, 
  Mail, 
  DollarSign, 
  Calendar, 
  FileText,
  Scissors
} from "lucide-react";

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  
  const [formData, setFormData] = useState({
    shopName: "",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    outfitType: "",
    description: "",
    totalAmount: "",
    amountPaid: "0",
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: "",
    paymentMethod: "Pending",
    notes: ""
  });

  // Fetch clients
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

  // Fetch outfits
  useEffect(() => {
    const fetchOutfits = async () => {
      if (!auth.currentUser) return;

      const q = query(
        collection(db, "outfits"),
        where("userId", "==", auth.currentUser.uid)
      );

      const snapshot = await getDocs(q);
      const outfitsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOutfits(outfitsData);
    };

    fetchOutfits();
  }, []);

  // Handle client selection
  const handleClientSelect = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      setFormData(prev => ({
        ...prev,
        clientName: client.name,
        clientPhone: client.phone || "",
        clientEmail: client.email || ""
      }));

      // Filter outfits for this client
      const clientOutfits = outfits.filter(o => o.clientName === client.name);
      if (clientOutfits.length > 0) {
        // Auto-select most recent outfit
        const latestOutfit = clientOutfits[0];
        handleOutfitSelect(latestOutfit.id);
      }
    }
  };

  // Handle outfit selection
  const handleOutfitSelect = (outfitId) => {
    const outfit = outfits.find(o => o.id === outfitId);
    if (outfit) {
      setSelectedOutfit(outfit);
      setFormData(prev => ({
        ...prev,
        outfitType: outfit.outfitType || "",
        description: outfit.notes || "",
        totalAmount: outfit.amount || "",
        dueDate: outfit.dueDate || ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate invoice number
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      
      // Calculate balance
      const balance = Number(formData.totalAmount) - Number(formData.amountPaid || 0);
      
      // Determine status
      let status = "Unpaid";
      if (Number(formData.amountPaid) >= Number(formData.totalAmount)) {
        status = "Paid";
      } else if (Number(formData.amountPaid) > 0) {
        status = "Partial";
      } else if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
        status = "Overdue";
      } else {
        status = "Pending";
      }

      await addDoc(collection(db, "invoices"), {
        userId: auth.currentUser.uid,
        invoiceNumber,
        shopName: formData.shopName || auth.currentUser.displayName || "My Tailor Shop",
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        clientEmail: formData.clientEmail,
        outfitType: formData.outfitType,
        description: formData.description,
        totalAmount: Number(formData.totalAmount),
        amountPaid: Number(formData.amountPaid || 0),
        balance,
        status,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        createdAt: serverTimestamp()
      });

      navigate("/invoices");
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate("/invoices")}
          className="flex items-center text-gray-400 hover:text-white transition text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Back to Invoices
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Create New Invoice</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        
        {/* Shop Name */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-medium text-gray-400">
            Shop/Business Name <span className="text-red-400">*</span>
          </label>
          <input
            required
            type="text"
            value={formData.shopName}
            onChange={(e) => setFormData({...formData, shopName: e.target.value})}
            placeholder="e.g., Elegant Tailors"
            className="w-full bg-black border border-gray-800 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Client Selection */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-medium text-gray-400">
            Select Existing Client (Optional)
          </label>
          <select
            value={selectedClient?.id || ""}
            onChange={(e) => handleClientSelect(e.target.value)}
            className="w-full bg-black border border-gray-800 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">-- Select a client or enter manually below --</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name} {client.phone ? `(${client.phone})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* If client selected, show outfit selection */}
        {selectedClient && outfits.filter(o => o.clientName === selectedClient.name).length > 0 && (
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-gray-400">
              Select Order (Optional)
            </label>
            <select
              value={selectedOutfit?.id || ""}
              onChange={(e) => handleOutfitSelect(e.target.value)}
              className="w-full bg-black border border-gray-800 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">-- Select an order or enter manually --</option>
              {outfits
                .filter(o => o.clientName === selectedClient.name)
                .map(outfit => (
                  <option key={outfit.id} value={outfit.id}>
                    {outfit.outfitType} - ₦{Number(outfit.amount || 0).toLocaleString()}
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Client Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-2">
              <User size={14} /> Client Name <span className="text-red-400">*</span>
            </label>
            <input
              required
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData({...formData, clientName: e.target.value})}
              placeholder="e.g., John Doe"
              className="w-full bg-black border border-gray-800 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-2">
              <Phone size={14} /> Phone Number
            </label>
            <input
              type="tel"
              value={formData.clientPhone}
              onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
              placeholder="e.g., +234 801 234 5678"
              className="w-full bg-black border border-gray-800 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-2">
              <Mail size={14} /> Email (Optional)
            </label>
            <input
              type="email"
              value={formData.clientEmail}
              onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
              placeholder="e.g., john@example.com"
              className="w-full bg-black border border-gray-800 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Service Details */}
        <div className="space-y-4 pt-4 border-t border-gray-800">
          <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
            <Scissors size={18} /> Service Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-400">
                Outfit/Service Type <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="text"
                value={formData.outfitType}
                onChange={(e) => setFormData({...formData, outfitType: e.target.value})}
                placeholder="e.g., 3-Piece Suit"
                className="w-full bg-black border border-gray-800 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-2">
                <DollarSign size={14} /> Total Amount (₦) <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="number"
                value={formData.totalAmount}
                onChange={(e) => setFormData({...formData, totalAmount: e.target.value})}
                placeholder="e.g., 50000"
                className="w-full bg-black border border-gray-800 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-gray-400">
              Description
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Additional details about the service..."
              className="w-full bg-black border border-gray-800 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            ></textarea>
          </div>
        </div>

        {/* Payment Information */}
        <div className="space-y-4 pt-4 border-t border-gray-800">
          <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
            <DollarSign size={18} /> Payment Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-400">
                Amount Paid
              </label>
              <input
                type="number"
                value={formData.amountPaid}
                onChange={(e) => setFormData({...formData, amountPaid: e.target.value})}
                placeholder="0"
                className="w-full bg-black border border-gray-800 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-2">
                <Calendar size={14} /> Issue Date
              </label>
              <input
                required
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
                className="w-full bg-black border border-gray-800 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-2">
                <Calendar size={14} /> Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                className="w-full bg-black border border-gray-800 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-gray-400">
              Payment Method
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
              className="w-full bg-black border border-gray-800 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="Pending">Pending</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Card">Card</option>
              <option value="Mobile Money">Mobile Money</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-medium text-gray-400 flex items-center gap-2">
            <FileText size={14} /> Notes
          </label>
          <textarea
            rows="3"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Any additional notes or terms..."
            className="w-full bg-black border border-gray-800 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          ></textarea>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
              loading
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95'
            }`}
          >
            {loading ? "Creating..." : <><Save size={18} /> Create Invoice</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice;