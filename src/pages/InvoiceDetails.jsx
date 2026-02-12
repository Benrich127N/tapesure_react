// src/pages/InvoiceDetails.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, auth } from "../../firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  Send, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Share2,
  DollarSign
} from "lucide-react";
import { jsPDF } from "jspdf";

const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!auth.currentUser) return;

      try {
        const docRef = doc(db, "invoices", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setInvoice({ id: docSnap.id, ...docSnap.data() });
        } else {
          alert("Invoice not found");
          navigate("/invoices");
        }
      } catch (error) {
        console.error("Error fetching invoice:", error);
        alert("Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id, navigate]);

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
      case "Paid": return <CheckCircle className="w-5 h-5" />;
      case "Overdue": return <AlertCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const generatePDF = () => {
    if (!invoice) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    // Header - Shop Name
    pdf.setFontSize(24);
    pdf.setFont("helvetica", "bold");
    pdf.text(invoice.shopName || "My Tailor Shop", margin, yPos);
    yPos += 8;

    // TapeSure branding
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(100, 100, 255);
    pdf.text("Powered by TapeSure", margin, yPos);
    pdf.setTextColor(0, 0, 0);
    yPos += 15;

    // Invoice Title
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text("INVOICE", margin, yPos);
    yPos += 10;

    // Invoice Number and Date
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Invoice #: ${invoice.invoiceNumber}`, margin, yPos);
    pdf.text(`Issue Date: ${invoice.issueDate}`, pageWidth - margin - 50, yPos);
    yPos += 6;
    if (invoice.dueDate) {
      pdf.text(`Due Date: ${invoice.dueDate}`, pageWidth - margin - 50, yPos);
      yPos += 10;
    } else {
      yPos += 10;
    }

    // Horizontal line
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // Client Information
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("BILL TO:", margin, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(invoice.clientName, margin, yPos);
    yPos += 6;
    
    if (invoice.clientPhone) {
      pdf.text(`Phone: ${invoice.clientPhone}`, margin, yPos);
      yPos += 6;
    }
    
    if (invoice.clientEmail) {
      pdf.text(`Email: ${invoice.clientEmail}`, margin, yPos);
      yPos += 6;
    }
    yPos += 10;

    // Service Details
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("SERVICE DETAILS", margin, yPos);
    yPos += 8;

    // Table header
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("Description", margin + 2, yPos);
    pdf.text("Amount", pageWidth - margin - 30, yPos);
    yPos += 10;

    // Table content
    pdf.setFont("helvetica", "normal");
    
    if (invoice.outfitType) {
      pdf.text(invoice.outfitType, margin + 2, yPos);
      yPos += 6;
    }
    
    if (invoice.description) {
      const descLines = pdf.splitTextToSize(invoice.description, pageWidth - 2 * margin - 40);
      pdf.text(descLines, margin + 2, yPos);
      yPos += descLines.length * 6;
    }

    // Amount on the right
    pdf.text(`₦${Number(invoice.totalAmount || 0).toLocaleString()}`, pageWidth - margin - 30, yPos - 6);
    yPos += 15;

    // Horizontal line
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // Payment Summary
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    
    // Total Amount
    pdf.text("Total Amount:", pageWidth - margin - 80, yPos);
    pdf.text(`₦${Number(invoice.totalAmount || 0).toLocaleString()}`, pageWidth - margin - 30, yPos);
    yPos += 8;

    // Amount Paid
    pdf.setTextColor(0, 150, 0);
    pdf.text("Amount Paid:", pageWidth - margin - 80, yPos);
    pdf.text(`₦${Number(invoice.amountPaid || 0).toLocaleString()}`, pageWidth - margin - 30, yPos);
    yPos += 8;

    // Balance Due
    pdf.setTextColor(200, 100, 0);
    pdf.text("Balance Due:", pageWidth - margin - 80, yPos);
    pdf.text(`₦${Number(invoice.balance || 0).toLocaleString()}`, pageWidth - margin - 30, yPos);
    pdf.setTextColor(0, 0, 0);
    yPos += 15;

    // Payment Method
    if (invoice.paymentMethod) {
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Payment Method: ${invoice.paymentMethod}`, margin, yPos);
      yPos += 10;
    }

    // Notes
    if (invoice.notes) {
      yPos += 5;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text("Notes:", margin, yPos);
      yPos += 6;
      pdf.setFont("helvetica", "normal");
      const notesLines = pdf.splitTextToSize(invoice.notes, pageWidth - 2 * margin);
      pdf.text(notesLines, margin, yPos);
      yPos += notesLines.length * 6 + 10;
    }

    // Footer
    yPos = pdf.internal.pageSize.getHeight() - 30;
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(128, 128, 128);
    pdf.text("Thank you for your business!", pageWidth / 2, yPos, { align: "center" });
    yPos += 6;
    pdf.text("Generated with TapeSure - www.tapesure.com", pageWidth / 2, yPos, { align: "center" });

    // Save the PDF
    pdf.save(`Invoice-${invoice.invoiceNumber}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (!invoice) return;

    const shareData = {
      title: `Invoice ${invoice.invoiceNumber}`,
      text: `Invoice from ${invoice.shopName}\nClient: ${invoice.clientName}\nTotal: ₦${Number(invoice.totalAmount || 0).toLocaleString()}\nBalance: ₦${Number(invoice.balance || 0).toLocaleString()}`,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `Invoice ${invoice.invoiceNumber}\n` +
          `From: ${invoice.shopName}\n` +
          `Client: ${invoice.clientName}\n` +
          `Total: ₦${Number(invoice.totalAmount || 0).toLocaleString()}\n` +
          `Balance: ₦${Number(invoice.balance || 0).toLocaleString()}\n\n` +
          `View invoice: ${window.location.href}`
        );
        alert("Invoice details copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }

    if (Number(paymentAmount) > Number(invoice.balance)) {
      alert("Payment amount cannot exceed balance due");
      return;
    }

    setUpdating(true);

    try {
      const newAmountPaid = Number(invoice.amountPaid || 0) + Number(paymentAmount);
      const newBalance = Number(invoice.totalAmount) - newAmountPaid;
      
      let newStatus = invoice.status;
      if (newBalance === 0) {
        newStatus = "Paid";
      } else if (newBalance > 0 && newAmountPaid > 0) {
        newStatus = "Partial";
      }

      await updateDoc(doc(db, "invoices", id), {
        amountPaid: newAmountPaid,
        balance: newBalance,
        status: newStatus,
        paymentMethod: paymentMethod,
        lastPaymentDate: new Date().toISOString().split('T')[0]
      });

      // Update local state
      setInvoice({
        ...invoice,
        amountPaid: newAmountPaid,
        balance: newBalance,
        status: newStatus,
        paymentMethod: paymentMethod
      });

      setShowPaymentModal(false);
      setPaymentAmount("");
      alert("Payment recorded successfully!");
    } catch (error) {
      console.error("Error recording payment:", error);
      alert("Failed to record payment");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "invoices", id));
      navigate("/invoices");
    } catch (error) {
      console.error("Error deleting invoice:", error);
      alert("Failed to delete invoice");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Invoice not found</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/invoices")}
            className="p-2 hover:bg-gray-800 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Invoice Details</h1>
            <p className="text-sm text-gray-400">{invoice.invoiceNumber}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={generatePDF}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>

<button
    onClick={handlePrint}
    className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm"
  >
    <Printer className="w-4 h-4" />
    Print
  </button>

          <button
            onClick={handleShare}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-700 px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-6 sm:p-8" id="invoice-content">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b border-gray-800">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{invoice.shopName}</h2>
            <p className="text-sm text-indigo-400">Powered by TapeSure</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold ${getStatusColor(invoice.status)}`}>
              {getStatusIcon(invoice.status)}
              {invoice.status}
            </span>
          </div>
        </div>

        {/* Invoice Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Invoice Number</h3>
            <p className="text-lg font-mono text-white">{invoice.invoiceNumber}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Issue Date</h3>
            <p className="text-lg text-white">{invoice.issueDate}</p>
          </div>
          {invoice.dueDate && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Due Date</h3>
              <p className="text-lg text-white">{invoice.dueDate}</p>
            </div>
          )}
        </div>

        {/* Client Information */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Bill To</h3>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-white font-semibold mb-2">{invoice.clientName}</p>
            {invoice.clientPhone && (
              <p className="text-gray-400 text-sm mb-1">Phone: {invoice.clientPhone}</p>
            )}
            {invoice.clientEmail && (
              <p className="text-gray-400 text-sm">Email: {invoice.clientEmail}</p>
            )}
          </div>
        </div>

        {/* Service Details */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Service Details</h3>
          <div className="bg-gray-800/50 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-sm font-semibold text-gray-400 p-4">Description</th>
                  <th className="text-right text-sm font-semibold text-gray-400 p-4">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-4">
                    {invoice.outfitType && (
                      <p className="text-white font-medium mb-1">{invoice.outfitType}</p>
                    )}
                    {invoice.description && (
                      <p className="text-gray-400 text-sm">{invoice.description}</p>
                    )}
                  </td>
                  <td className="p-4 text-right text-white font-semibold">
                    ₦{Number(invoice.totalAmount || 0).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-gray-800/50 rounded-lg p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Amount</span>
              <span className="text-xl font-bold text-white">
                ₦{Number(invoice.totalAmount || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Amount Paid</span>
              <span className="text-lg font-semibold text-green-400">
                ₦{Number(invoice.amountPaid || 0).toLocaleString()}
              </span>
            </div>
            <div className="border-t border-gray-700 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-300">Balance Due</span>
                <span className="text-2xl font-bold text-yellow-400">
                  ₦{Number(invoice.balance || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          {invoice.paymentMethod && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                Payment Method: <span className="text-white">{invoice.paymentMethod}</span>
              </p>
            </div>
          )}
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-2">Notes</h3>
            <p className="text-gray-400 bg-gray-800/50 rounded-lg p-4">{invoice.notes}</p>
          </div>
        )}

        {/* Record Payment Button */}
        {Number(invoice.balance) > 0 && (
          <div className="mt-8">
            <button
              onClick={() => setShowPaymentModal(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
            >
              <DollarSign className="w-5 h-5" />
              Record Payment
            </button>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Record Payment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Payment Amount
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  max={invoice.balance}
                  min="0"
                  step="0.01"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter amount"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Balance due: ₦{Number(invoice.balance || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Card">Card</option>
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentAmount("");
                  }}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRecordPayment}
                  disabled={updating}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition disabled:opacity-50"
                >
                  {updating ? "Processing..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetails