// src/pages/CreateInvoice.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../firebase";
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  getDoc, 
  query, 
  where, 
  getDocs 
} from "firebase/firestore";
import { 
  ArrowLeft, 
  Save, 
  FileText, 
  User, 
  Calendar, 
  DollarSign,
  RefreshCw,
  Scissors
} from "lucide-react";

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);
  const [shopName, setShopName] = useState("");
  const [clients, setClients] = useState([]);
  const [outfits, setOutfits] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedOutfitId, setSelectedOutfitId] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    outfitType: "",
    description: "",
    totalAmount: "",
    amountPaid: "",
    paymentMethod: "Cash",
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: "",
    notes: ""
  });

  // Fetch shop name from user profile or settings
  useEffect(() => {
    const fetchShopName = async () => {
      if (!auth.currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists() && userDoc.data().shopName) {
          setShopName(userDoc.data().shopName);
        } else {
          // Fallback to display name or default
          setShopName(auth.currentUser.displayName || "My Tailor Shop");
        }
      } catch (error) {
        console.error("Error fetching shop name:", error);
        setShopName(auth.currentUser.displayName || "My Tailor Shop");
      }
    };

    fetchShopName();
  }, []);

  // Fetch all clients
  useEffect(() => {
    const fetchClients = async () => {
      if (!auth.currentUser) return;

      try {
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
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setLoadingClients(false);
      }
    };

    fetchClients();
  }, []);

  // Fetch all outfits
  useEffect(() => {
    const fetchOutfits = async () => {
      if (!auth.currentUser) return;

      try {
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
      } catch (error) {
        console.error("Error fetching outfits:", error);
      }
    };

    fetchOutfits();
  }, []);

  // Handle client selection
  const handleClientSelect = (e) => {
    const clientId = e.target.value;
    setSelectedClientId(clientId);
    
    if (clientId) {
      const client = clients.find(c => c.id === clientId);
      if (client) {
        setFormData(prev => ({
          ...prev,
          clientName: client.name || "",
          clientPhone: client.phone || "",
          clientEmail: client.email || ""
        }));
      }
    } else {
      // Reset client fields if "New Client" is selected
      setFormData(prev => ({
        ...prev,
        clientName: "",
        clientPhone: "",
        clientEmail: ""
      }));
    }
    
    // Reset outfit selection when client changes
    setSelectedOutfitId("");
  };

  // Handle outfit selection
  const handleOutfitSelect = (e) => {
    const outfitId = e.target.value;
    setSelectedOutfitId(outfitId);
    
    if (outfitId) {
      const outfit = outfits.find(o => o.id === outfitId);
      if (outfit) {
        setFormData(prev => ({
          ...prev,
          outfitType: outfit.outfitType || "",
          description: outfit.notes || "",
          totalAmount: outfit.amount?.toString() || "",
          dueDate: outfit.dueDate || ""
        }));
      }
    } else {
      // Reset outfit fields if "New Order" is selected
      setFormData(prev => ({
        ...prev,
        outfitType: "",
        description: "",
        totalAmount: "",
        dueDate: ""
      }));
    }
  };

  // Get filtered outfits for selected client
  const getClientOutfits = () => {
    if (!selectedClientId) return [];
    
    const client = clients.find(c => c.id === selectedClientId);
    if (!client) return [];
    
    return outfits.filter(o => o.clientName === client.name);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateBalance = () => {
    const total = Number(formData.totalAmount) || 0;
    const paid = Number(formData.amountPaid) || 0;
    return total - paid;
  };

  const determineStatus = () => {
    const total = Number(formData.totalAmount) || 0;
    const paid = Number(formData.amountPaid) || 0;
    const balance = total - paid;
    const dueDate = new Date(formData.dueDate);
    const today = new Date();

    if (balance === 0) return "Paid";
    if (paid > 0 && balance > 0) return "Partial";
    if (formData.dueDate && dueDate < today && balance > 0) return "Overdue";
    if (paid === 0) return "Unpaid";
    return "Pending";
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}-${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      alert("Please login to create invoices");
      return;
    }

    // Validation
    if (!formData.clientName || !formData.totalAmount) {
      alert("Please fill in client name and total amount");
      return;
    }

    setLoading(true);

    try {
      const invoiceData = {
        ...formData,
        userId: auth.currentUser.uid,
        shopName: shopName,
        invoiceNumber: generateInvoiceNumber(),
        totalAmount: Number(formData.totalAmount),
        amountPaid: Number(formData.amountPaid) || 0,
        balance: calculateBalance(),
        status: determineStatus(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, "invoices"), invoiceData);
      
      // Navigate to the invoice details page
      navigate(`/invoices/${docRef.id}`);
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert("Failed to create invoice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clientOutfits = getClientOutfits();

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/invoices")}
          className="p-2 hover:bg-gray-800 rounded-lg transition"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Create New Invoice</h1>
          <p className="text-xs sm:text-sm text-gray-400">Fill in the details to generate an invoice</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        
        {/* Quick Select Section */}
        <div className="bg-gray-900 rounded-lg sm:rounded-xl shadow-lg border border-gray-800 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
            <h2 className="text-base sm:text-lg font-semibold text-white">Quick Select</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client Selection */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                Select Existing Client (Optional)
              </label>
              {loadingClients ? (
                <div className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-500">
                  Loading clients...
                </div>
              ) : (
                <select
                  value={selectedClientId}
                  onChange={handleClientSelect}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- New Client (Enter Manually) --</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} {client.phone ? `(${client.phone})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Outfit Selection (only show if client is selected) */}
            {selectedClientId && clientOutfits.length > 0 && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                  Select Order (Optional)
                </label>
                <select
                  value={selectedOutfitId}
                  onChange={handleOutfitSelect}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- New Order (Enter Manually) --</option>
                  {clientOutfits.map(outfit => (
                    <option key={outfit.id} value={outfit.id}>
                      {outfit.outfitType} - ₦{Number(outfit.amount || 0).toLocaleString()} ({outfit.status})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {selectedClientId && clientOutfits.length === 0 && (
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              No orders found for this client. Enter details manually below.
            </p>
          )}
        </div>

        {/* Client Information */}
        <div className="bg-gray-900 rounded-lg sm:rounded-xl shadow-lg border border-gray-800 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
            <h2 className="text-base sm:text-lg font-semibold text-white">Client Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                Client Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter client name"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="clientPhone"
                value={formData.clientPhone}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter phone number"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="clientEmail"
                value={formData.clientEmail}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter email address"
              />
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className="bg-gray-900 rounded-lg sm:rounded-xl shadow-lg border border-gray-800 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Scissors className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
            <h2 className="text-base sm:text-lg font-semibold text-white">Service Details</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                Outfit/Service Type
              </label>
              <input
                type="text"
                name="outfitType"
                value={formData.outfitType}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Senator Suit, Agbada, Dress, etc."
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Additional details about the service..."
              />
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-gray-900 rounded-lg sm:rounded-xl shadow-lg border border-gray-800 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
            <h2 className="text-base sm:text-lg font-semibold text-white">Payment Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                Total Amount <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                Amount Paid
              </label>
              <input
                type="number"
                name="amountPaid"
                value={formData.amountPaid}
                onChange={handleChange}
                min="0"
                step="0.01"
                max={formData.totalAmount}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Pending">Pending</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Card">Card</option>
                <option value="Mobile Money">Mobile Money</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                Balance Due
              </label>
              <input
                type="text"
                value={`₦${calculateBalance().toLocaleString()}`}
                disabled
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-yellow-400 font-semibold cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-gray-900 rounded-lg sm:rounded-xl shadow-lg border border-gray-800 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
            <h2 className="text-base sm:text-lg font-semibold text-white">Dates</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                Issue Date
              </label>
              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                min={formData.issueDate}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="bg-gray-900 rounded-lg sm:rounded-xl shadow-lg border border-gray-800 p-4 sm:p-6">
          <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-2">
            Additional Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            placeholder="Any additional information..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => navigate("/invoices")}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                Create Invoice
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice;