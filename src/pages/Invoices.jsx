// src/pages/Invoices.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  deleteDoc,
  doc
} from "firebase/firestore";
import { 
  Search, 
  Plus, 
  Download, 
  Eye, 
  Send, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  Printer,
  Trash2
} from "lucide-react";

const Invoices = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Fetch invoices from Firebase
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "invoices"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const invoicesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInvoices(invoicesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.outfitType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "All" || invoice.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Calculate summary stats
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (Number(inv.amountPaid) || 0), 0);
  const totalPending = invoices.reduce((sum, inv) => sum + (Number(inv.balance) || 0), 0);

  const statusCounts = {
    Paid: invoices.filter(i => i.status === "Paid").length,
    Partial: invoices.filter(i => i.status === "Partial").length,
    Pending: invoices.filter(i => i.status === "Pending").length,
    Unpaid: invoices.filter(i => i.status === "Unpaid").length,
    Overdue: invoices.filter(i => i.status === "Overdue").length
  };

  const handleDelete = async (invoiceId) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "invoices", invoiceId));
    } catch (error) {
      console.error("Error deleting invoice:", error);
      alert("Failed to delete invoice");
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Paid": return "bg-green-900/30 text-green-400 border-green-700";
      case "Partial": return "bg-blue-900/30 text-blue-400 border-blue-700";
      case "Pending": return "bg-yellow-900/30 text-yellow-400 border-yellow-700";
      case "Unpaid": return "bg-gray-800 text-gray-400 border-gray-700";
      case "Overdue": return "bg-red-900/30 text-red-400 border-red-700";
      default: return "bg-gray-800 text-gray-400 border-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "Paid": return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "Overdue": return <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "Pending": 
      case "Partial": return <Clock className="w-3 h-3 sm:w-4 sm:h-4" />;
      default: return <FileText className="w-3 h-3 sm:w-4 sm:h-4" />;
    }
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
            Invoices & Payments
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            Track all payments, pending balances, and invoice history
          </p>
        </div>
        <button 
          onClick={() => navigate("/invoices/new")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition active:scale-95 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Create Invoice
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-gray-900 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
            <span className="text-[10px] sm:text-xs text-gray-500">Total</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white mb-1">{totalInvoices}</p>
          <p className="text-xs sm:text-sm text-gray-400">Invoices</p>
        </div>

        <div className="bg-gray-900 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
            <span className="text-[10px] sm:text-xs text-gray-500">Received</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-green-400 mb-1">
            ₦{totalPaid.toLocaleString()}
          </p>
          <p className="text-xs sm:text-sm text-gray-400">Total Paid</p>
        </div>

        <div className="bg-gray-900 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            <span className="text-[10px] sm:text-xs text-gray-500">Outstanding</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-yellow-400 mb-1">
            ₦{totalPending.toLocaleString()}
          </p>
          <p className="text-xs sm:text-sm text-gray-400">Pending Balance</p>
        </div>

        <div className="bg-gray-900 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
            <span className="text-[10px] sm:text-xs text-gray-500">Revenue</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-indigo-400 mb-1">
            ₦{totalAmount.toLocaleString()}
          </p>
          <p className="text-xs sm:text-sm text-gray-400">Total Value</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-gray-900 rounded-lg sm:rounded-xl shadow-lg border border-gray-800 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search by invoice ID, client, or outfit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["All", "Paid", "Partial", "Pending", "Unpaid", "Overdue"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                  filterStatus === status
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {status} {status !== "All" && `(${statusCounts[status] || 0})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-10 text-gray-500">
          <div className="animate-pulse">Loading invoices...</div>
        </div>
      )}

      {/* Mobile Card View */}
      {!loading && filteredInvoices.length > 0 && (
        <div className="block lg:hidden space-y-3">
          {filteredInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-bold text-white font-mono">
                    {invoice.invoiceNumber}
                  </p>
                  <p className="text-xs text-gray-500">{invoice.clientName}</p>
                  <p className="text-xs text-gray-400">{invoice.outfitType}</p>
                </div>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${getStatusColor(invoice.status)}`}>
                  {getStatusIcon(invoice.status)}
                  {invoice.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-800">
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-sm font-semibold text-white">
                    ₦{Number(invoice.totalAmount || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Balance</p>
                  <p className="text-sm font-semibold text-yellow-400">
                    ₦{Number(invoice.balance || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-700">
                <button
                  onClick={() => navigate(`/invoices/${invoice.id}`)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-2"
                >
                  <Eye size={14} /> View
                </button>
                <button
                  onClick={() => handleDelete(invoice.id)}
                  className="bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-700 px-3 py-2 rounded-lg text-xs font-medium transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Desktop Table View */}
      {!loading && filteredInvoices.length > 0 && (
        <div className="hidden lg:block bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800/50">
                  <th className="text-left text-xs font-semibold text-gray-400 p-4">INVOICE</th>
                  <th className="text-left text-xs font-semibold text-gray-400 p-4">CLIENT</th>
                  <th className="text-left text-xs font-semibold text-gray-400 p-4">OUTFIT</th>
                  <th className="text-left text-xs font-semibold text-gray-400 p-4">TOTAL</th>
                  <th className="text-left text-xs font-semibold text-gray-400 p-4">PAID</th>
                  <th className="text-left text-xs font-semibold text-gray-400 p-4">BALANCE</th>
                  <th className="text-left text-xs font-semibold text-gray-400 p-4">DUE DATE</th>
                  <th className="text-left text-xs font-semibold text-gray-400 p-4">STATUS</th>
                  <th className="text-right text-xs font-semibold text-gray-400 p-4">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition">
                    <td className="p-4">
                      <p className="text-sm font-semibold text-white font-mono">
                        {invoice.invoiceNumber}
                      </p>
                      <p className="text-xs text-gray-500">{invoice.issueDate}</p>
                    </td>
                    <td className="p-4 text-sm text-gray-300">{invoice.clientName}</td>
                    <td className="p-4 text-sm text-gray-400">{invoice.outfitType}</td>
                    <td className="p-4 text-sm font-semibold text-white">
                      ₦{Number(invoice.totalAmount || 0).toLocaleString()}
                    </td>
                    <td className="p-4 text-sm font-semibold text-green-400">
                      ₦{Number(invoice.amountPaid || 0).toLocaleString()}
                    </td>
                    <td className="p-4 text-sm font-semibold text-yellow-400">
                      ₦{Number(invoice.balance || 0).toLocaleString()}
                    </td>
                    <td className="p-4 text-sm text-gray-400">{invoice.dueDate}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        {invoice.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/invoices/${invoice.id}`)}
                          className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-gray-800 rounded-lg transition" 
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(invoice.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredInvoices.length === 0 && (
        <div className="bg-gray-900 rounded-lg sm:rounded-xl shadow-lg border border-gray-800 p-8 sm:p-12 text-center">
          <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-400 mb-2">
            {searchTerm ? "No invoices found" : "No invoices yet"}
          </h3>
          <p className="text-sm sm:text-base text-gray-500 mb-4">
            {searchTerm 
              ? "Try adjusting your search criteria" 
              : "Create your first invoice to get started"
            }
          </p>
          {!searchTerm && (
            <button 
              onClick={() => navigate("/invoices/new")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create First Invoice
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Invoices;