import React, { useState } from "react";
import { Search, Plus, Download, Eye, Send, DollarSign, Calendar, CheckCircle, Clock, AlertCircle, Filter, FileText, Printer } from "lucide-react";

const Invoices = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const invoices = [
    {
      id: "INV-001",
      orderId: "ORD-001",
      client: "Adebayo James",
      outfit: "3-Piece Suit",
      amount: "₦85,000",
      amountPaid: "₦42,500",
      balance: "₦42,500",
      status: "Partial",
      dueDate: "Nov 5, 2025",
      issueDate: "Oct 20, 2025",
      paymentMethod: "Bank Transfer",
      notes: "50% deposit received. Balance due on delivery."
    },
    {
      id: "INV-002",
      orderId: "ORD-002",
      client: "Chioma Okafor",
      outfit: "Wedding Gown",
      amount: "₦250,000",
      amountPaid: "₦250,000",
      balance: "₦0",
      status: "Paid",
      dueDate: "Oct 28, 2025",
      issueDate: "Oct 10, 2025",
      paymentMethod: "Cash",
      notes: "Full payment received. Client very satisfied."
    },
    {
      id: "INV-003",
      orderId: "ORD-003",
      client: "Emeka Nwankwo",
      outfit: "Agbada Set",
      amount: "₦120,000",
      amountPaid: "₦24,000",
      balance: "₦96,000",
      status: "Overdue",
      dueDate: "Oct 25, 2025",
      issueDate: "Oct 8, 2025",
      paymentMethod: "Bank Transfer",
      notes: "Payment overdue. Follow up required urgently."
    },
    {
      id: "INV-004",
      orderId: "ORD-004",
      client: "Fatima Bello",
      outfit: "Ankara Dress",
      amount: "₦45,000",
      amountPaid: "₦13,500",
      balance: "₦31,500",
      status: "Pending",
      dueDate: "Nov 8, 2025",
      issueDate: "Oct 22, 2025",
      paymentMethod: "POS",
      notes: "30% deposit paid. Awaiting balance payment."
    },
    {
      id: "INV-005",
      orderId: "ORD-005",
      client: "Tunde Bakare",
      outfit: "Senator Wear",
      amount: "₦65,000",
      amountPaid: "₦0",
      balance: "₦65,000",
      status: "Unpaid",
      dueDate: "Nov 12, 2025",
      issueDate: "Oct 25, 2025",
      paymentMethod: "Pending",
      notes: "Invoice sent. Awaiting initial payment."
    },
    {
      id: "INV-006",
      orderId: "ORD-006",
      client: "Ngozi Eze",
      outfit: "Aso Ebi (2 pieces)",
      amount: "₦180,000",
      amountPaid: "₦180,000",
      balance: "₦0",
      status: "Paid",
      dueDate: "Oct 30, 2025",
      issueDate: "Oct 15, 2025",
      paymentMethod: "Bank Transfer",
      notes: "Paid in full. VIP client - priority service."
    },
    {
      id: "INV-007",
      orderId: "ORD-007",
      client: "Yemi Adeyemi",
      outfit: "Kaftan & Trousers",
      amount: "₦72,000",
      amountPaid: "₦50,400",
      balance: "₦21,600",
      status: "Partial",
      dueDate: "Nov 2, 2025",
      issueDate: "Oct 18, 2025",
      paymentMethod: "POS",
      notes: "70% paid. Balance due before delivery."
    },
    {
      id: "INV-008",
      orderId: "ORD-008",
      client: "Blessing Okoro",
      outfit: "Casual Shirt (3)",
      amount: "₦36,000",
      amountPaid: "₦36,000",
      balance: "₦0",
      status: "Paid",
      dueDate: "Oct 29, 2025",
      issueDate: "Oct 20, 2025",
      paymentMethod: "Cash",
      notes: "Quick turnaround. Paid on delivery."
    }
  ];

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.outfit.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "All" || invoice.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Calculate summary stats
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.amount.replace(/[₦,]/g, '')), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + parseFloat(inv.amountPaid.replace(/[₦,]/g, '')), 0);
  const totalPending = invoices.reduce((sum, inv) => sum + parseFloat(inv.balance.replace(/[₦,]/g, '')), 0);

  const statusCounts = {
    Paid: invoices.filter(i => i.status === "Paid").length,
    Partial: invoices.filter(i => i.status === "Partial").length,
    Pending: invoices.filter(i => i.status === "Pending").length,
    Unpaid: invoices.filter(i => i.status === "Unpaid").length,
    Overdue: invoices.filter(i => i.status === "Overdue").length
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
      case "Paid": return <CheckCircle className="w-4 h-4" />;
      case "Overdue": return <AlertCircle className="w-4 h-4" />;
      case "Pending": 
      case "Partial": return <Clock className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Invoices & Payments</h1>
          <p className="text-gray-400">Track all payments, pending balances, and invoice history</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition">
          <Plus className="w-5 h-5" />
          Create Invoice
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-6 h-6 text-indigo-400" />
            <span className="text-xs text-gray-500">Total</span>
          </div>
          <p className="text-2xl font-bold text-white mb-1">{totalInvoices}</p>
          <p className="text-sm text-gray-400">Invoices</p>
        </div>

        <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-6 h-6 text-green-400" />
            <span className="text-xs text-gray-500">Received</span>
          </div>
          <p className="text-2xl font-bold text-green-400 mb-1">₦{totalPaid.toLocaleString()}</p>
          <p className="text-sm text-gray-400">Total Paid</p>
        </div>

        <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-6 h-6 text-yellow-400" />
            <span className="text-xs text-gray-500">Outstanding</span>
          </div>
          <p className="text-2xl font-bold text-yellow-400 mb-1">₦{totalPending.toLocaleString()}</p>
          <p className="text-sm text-gray-400">Pending Balance</p>
        </div>

        <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-6 h-6 text-indigo-400" />
            <span className="text-xs text-gray-500">Revenue</span>
          </div>
          <p className="text-2xl font-bold text-indigo-400 mb-1">₦{totalAmount.toLocaleString()}</p>
          <p className="text-sm text-gray-400">Total Value</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by invoice ID, client name, or outfit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["All", "Paid", "Partial", "Pending", "Unpaid", "Overdue"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
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

      {/* Invoices Table */}
      <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/50">
                <th className="text-left text-xs font-semibold text-gray-400 p-4">INVOICE</th>
                <th className="text-left text-xs font-semibold text-gray-400 p-4">CLIENT</th>
                <th className="text-left text-xs font-semibold text-gray-400 p-4">OUTFIT</th>
                <th className="text-left text-xs font-semibold text-gray-400 p-4">TOTAL AMOUNT</th>
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
                    <div>
                      <p className="text-sm font-semibold text-white font-mono">{invoice.id}</p>
                      <p className="text-xs text-gray-500">{invoice.issueDate}</p>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-300">{invoice.client}</td>
                  <td className="p-4 text-sm text-gray-400">{invoice.outfit}</td>
                  <td className="p-4 text-sm font-semibold text-white">{invoice.amount}</td>
                  <td className="p-4 text-sm font-semibold text-green-400">{invoice.amountPaid}</td>
                  <td className="p-4 text-sm font-semibold text-yellow-400">{invoice.balance}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {invoice.dueDate}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(invoice.status)}`}>
                      {getStatusIcon(invoice.status)}
                      {invoice.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-gray-800 rounded-lg transition" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-800 rounded-lg transition" title="Download">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition" title="Send">
                        <Send className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-800 rounded-lg transition" title="Print">
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredInvoices.length === 0 && (
        <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No invoices found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Payment Status Legend */}
      <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-4">PAYMENT STATUS LEGEND</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-sm font-medium text-gray-300">Paid</p>
              <p className="text-xs text-gray-500">Fully paid</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-sm font-medium text-gray-300">Partial</p>
              <p className="text-xs text-gray-500">Part payment</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-sm font-medium text-gray-300">Pending</p>
              <p className="text-xs text-gray-500">Awaiting payment</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-300">Unpaid</p>
              <p className="text-xs text-gray-500">Not started</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-sm font-medium text-gray-300">Overdue</p>
              <p className="text-xs text-gray-500">Past due date</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoices;