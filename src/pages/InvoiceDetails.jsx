// src/pages/InvoiceDetails.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, auth } from "../../firebase";
import { doc, getDoc, runTransaction, deleteDoc } from "firebase/firestore";
import {
  ArrowLeft,
  Download,
  Printer,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Share2,
  DollarSign,
} from "lucide-react";
import { jsPDF } from "jspdf";
import RecordPaymentDialog from "../components/RecordPaymentDialog";
import { invoiceAmounts, invoiceMoney, invoicePaymentStatus, isInvoiceOverdue, paymentUpdate } from "../utils/invoices";
import "./Invoices.css";

const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const [paymentError, setPaymentError] = useState("");
  const [notice, setNotice] = useState("");
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const paymentPending = useRef(false);
  const activeInvoiceId = useRef(id);
  const [today, setToday] = useState(() => new Date());
  useEffect(() => { const timer = setInterval(() => setToday(new Date()), 60000); return () => clearInterval(timer); }, []);

  useEffect(() => {
    let active = true;
    activeInvoiceId.current = id;
    setShowPaymentModal(false);
    setPaymentError("");
    setNotice("");
    setPaymentAmount("");
    setLoading(true);
    setLoadError("");
    setInvoice(null);
    const fetchInvoice = async () => {
      if (!auth.currentUser) { setLoadError("Please sign in to view this invoice."); setLoading(false); return; }

      try {
        const docRef = doc(db, "invoices", id);
        const docSnap = await getDoc(docRef);

        if (!active) return;
        if (docSnap.exists() && docSnap.data().userId === auth.currentUser.uid) {
          setInvoice({ id: docSnap.id, ...docSnap.data() });
        } else {
          setLoadError("Invoice not found or unavailable.");
        }
      } catch (error) {
        console.error("Error fetching invoice:", error);
        if (active) setLoadError("Could not load this invoice. Check your connection and try again.");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchInvoice();
    return () => { active = false; };
  }, [id, attempt]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-900/30 text-green-400 border-green-700";
      case "Partial":
        return "bg-blue-900/30 text-blue-400 border-blue-700";
      case "Pending":
        return "bg-yellow-900/30 text-yellow-400 border-yellow-700";
      case "Unpaid":
        return "bg-gray-800 text-gray-400 border-gray-700";
      case "Overdue":
        return "bg-red-900/30 text-red-400 border-red-700";
      default:
        return "bg-gray-800 text-gray-400 border-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Paid":
        return <CheckCircle className="w-5 h-5" />;
      case "Overdue":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
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
    pdf.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, "F");
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
      const descLines = pdf.splitTextToSize(
        invoice.description,
        pageWidth - 2 * margin - 40,
      );
      pdf.text(descLines, margin + 2, yPos);
      yPos += descLines.length * 6;
    }

    // Amount on the right
    pdf.text(
      `₦${Number(invoice.totalAmount || 0).toLocaleString()}`,
      pageWidth - margin - 30,
      yPos - 6,
    );
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
    pdf.text(
      `₦${Number(invoice.totalAmount || 0).toLocaleString()}`,
      pageWidth - margin - 30,
      yPos,
    );
    yPos += 8;

    // Amount Paid
    pdf.setTextColor(0, 150, 0);
    pdf.text("Amount Paid:", pageWidth - margin - 80, yPos);
    pdf.text(
      `₦${Number(invoice.amountPaid || 0).toLocaleString()}`,
      pageWidth - margin - 30,
      yPos,
    );
    yPos += 8;

    // Balance Due
    pdf.setTextColor(200, 100, 0);
    pdf.text("Balance Due:", pageWidth - margin - 80, yPos);
    pdf.text(
      `₦${Number(invoice.balance || 0).toLocaleString()}`,
      pageWidth - margin - 30,
      yPos,
    );
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
      const notesLines = pdf.splitTextToSize(
        invoice.notes,
        pageWidth - 2 * margin,
      );
      pdf.text(notesLines, margin, yPos);
      yPos += notesLines.length * 6 + 10;
    }

    // Footer
    yPos = pdf.internal.pageSize.getHeight() - 30;
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(128, 128, 128);
    pdf.text("Thank you for your business!", pageWidth / 2, yPos, {
      align: "center",
    });
    yPos += 6;
    pdf.text(
      "Generated with TapeSure - www.tapesure.com",
      pageWidth / 2,
      yPos,
      { align: "center" },
    );

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
      url: window.location.href,
    };

    try {
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `Invoice ${invoice.invoiceNumber}\n` +
            `From: ${invoice.shopName}\n` +
            `Client: ${invoice.clientName}\n` +
            `Total: ₦${Number(invoice.totalAmount || 0).toLocaleString()}\n` +
            `Balance: ₦${Number(invoice.balance || 0).toLocaleString()}\n\n` +
            `View invoice: ${window.location.href}`,
        );
        alert("Invoice details copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleRecordPayment = async (event) => {
    event.preventDefault();
    if (paymentPending.current) return;
    setPaymentError("");
    try { paymentUpdate(invoice, paymentAmount); }
    catch (error) { setPaymentError(error.message); return; }
    paymentPending.current = true;
    setUpdating(true);
    try {
      const updated = await runTransaction(db, async (transaction) => {
        const reference = doc(db, "invoices", id);
        const snapshot = await transaction.get(reference);
        if (!snapshot.exists() || snapshot.data().userId !== auth.currentUser?.uid) throw new Error("This invoice is no longer available.");
        const latest = snapshot.data();
        const changes = { ...paymentUpdate(latest, paymentAmount), paymentMethod,
          lastPaymentDate: (() => { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; })() };
        transaction.update(reference, changes);
        return { ...latest, id, ...changes };
      });
      if (activeInvoiceId.current !== id) return;
      setInvoice(updated);
      setShowPaymentModal(false);
      setPaymentAmount("");
      setNotice("Payment recorded successfully.");
    } catch (error) {
      console.error("Error recording payment:", error);
      if (activeInvoiceId.current !== id) return;
      setPaymentError(error.code ? "Could not record payment. Check your connection and try again." : error.message);
    } finally {
      paymentPending.current = false;
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this invoice? This action cannot be undone.",
      )
    ) {
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
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="space-y-4 text-center"><p role="alert" className="text-gray-300">{loadError || "Invoice not found"}</p><button className="invoice-button mx-auto bg-indigo-600" onClick={() => setAttempt(value => value + 1)}>Retry</button><button className="invoice-button mx-auto bg-gray-800" onClick={() => navigate("/invoices")}>Back to invoices</button></div>
      </div>
    );
  }

  return (
    <div className="invoice-details w-full max-w-4xl mx-auto space-y-6 pb-8">
      {notice && <p role="status" className="rounded-lg border border-green-800 bg-green-900/20 p-4 text-green-200">{notice}</p>}
      {paymentError && !showPaymentModal && <p role="alert" className="rounded-lg border border-red-800 bg-red-900/20 p-4 text-red-200">{paymentError}</p>}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            aria-label="Back to invoices"
            onClick={() => navigate("/invoices")}
            className="min-h-11 min-w-11 flex items-center justify-center p-2 hover:bg-gray-800 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div>
            <h1 id="invoice-details-title" tabIndex={-1} className="text-2xl sm:text-3xl font-bold text-white">
              Invoice Details
            </h1>
            <p className="text-sm text-gray-400">{invoice.invoiceNumber}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={generatePDF}
            className="bg-indigo-600 hover:bg-indigo-700 text-white min-h-11 px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>

          <button
            onClick={handlePrint}
            className="bg-gray-800 hover:bg-gray-700 text-white min-h-11 px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>

          <button
            onClick={handleShare}
            className="bg-gray-800 hover:bg-gray-700 text-white min-h-11 px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-700 min-h-11 px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Invoice Content */}
      <div
        className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-4 sm:p-8"
        id="invoice-content"
      >
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b border-gray-800">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {invoice.shopName}
            </h2>
            <p className="text-sm text-indigo-400">Powered by TapeSure</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold ${getStatusColor(invoicePaymentStatus(invoice))}`}
            >
              {getStatusIcon(invoicePaymentStatus(invoice))}
              {invoicePaymentStatus(invoice)}
            </span>
          </div>
        </div>

        {isInvoiceOverdue(invoice, today) && <p className="mb-6 rounded-lg border border-red-800 bg-red-900/20 p-3 text-red-200">Overdue · Payment was due {invoice.dueDate}.</p>}
        {/* Invoice Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">
              Invoice Number
            </h3>
            <p className="text-lg font-mono text-white">
              {invoice.invoiceNumber}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">
              Issue Date
            </h3>
            <p className="text-lg text-white">{invoice.issueDate}</p>
          </div>
          {invoice.dueDate && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">
                Due Date
              </h3>
              <p className="text-lg text-white">{invoice.dueDate}</p>
            </div>
          )}
        </div>

        {/* Client Information */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Bill To</h3>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-white font-semibold mb-2">
              {invoice.clientName}
            </p>
            {invoice.clientPhone && (
              <p className="text-gray-400 text-sm mb-1">
                Phone: {invoice.clientPhone}
              </p>
            )}
            {invoice.clientEmail && (
              <p className="text-gray-400 text-sm">
                Email: {invoice.clientEmail}
              </p>
            )}
          </div>
        </div>

        {/* Service Details */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">
            Service Details
          </h3>
          <div className="bg-gray-800/50 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-sm font-semibold text-gray-400 p-4">
                    Description
                  </th>
                  <th className="text-right text-sm font-semibold text-gray-400 p-4">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-4">
                    {invoice.outfitType && (
                      <p className="text-white font-medium mb-1">
                        {invoice.outfitType}
                      </p>
                    )}
                    {invoice.description && (
                      <p className="text-gray-400 text-sm">
                        {invoice.description}
                      </p>
                    )}
                  </td>
                  <td className="p-3 text-right text-white font-semibold invoice-amount">
                    {invoiceMoney(invoiceAmounts(invoice).total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-gray-800/50 rounded-lg p-4 sm:p-6">
          <div className="space-y-4">
            <div className="payment-summary-row">
              <span className="text-gray-400">Total Amount</span>
              <span className="text-xl font-bold text-white">
                {invoiceMoney(invoiceAmounts(invoice).total)}
              </span>
            </div>
            <div className="payment-summary-row">
              <span className="text-gray-400">Amount Paid</span>
              <span className="text-lg font-semibold text-green-400">
                {invoiceMoney(invoiceAmounts(invoice).paid)}
              </span>
            </div>
            <div className="border-t border-gray-700 pt-4">
              <div className="payment-summary-row">
                <span className="text-lg font-semibold text-gray-300">
                  Balance Due
                </span>
                <span className="text-2xl font-bold text-yellow-400">
                  {invoiceMoney(invoiceAmounts(invoice).balance)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          {invoice.paymentMethod && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                Payment Method:{" "}
                <span className="text-white">{invoice.paymentMethod}</span>
              </p>
            </div>
          )}
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-2">Notes</h3>
            <p className="text-gray-400 bg-gray-800/50 rounded-lg p-4">
              {invoice.notes}
            </p>
          </div>
        )}

        {/* Record Payment Button */}
        {invoiceAmounts(invoice).balance > 0 && (
          <div className="mt-8">
            <button
              onClick={() => { setNotice(""); setPaymentError(""); setShowPaymentModal(true); }}
              disabled={updating}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
            >
              <DollarSign className="w-5 h-5" />
              {updating ? "Recording payment…" : "Record Payment"}
            </button>
          </div>
        )}
      </div>

      {showPaymentModal && <RecordPaymentDialog amount={paymentAmount} method={paymentMethod} balance={invoiceAmounts(invoice).balance} saving={updating} error={paymentError} onAmount={setPaymentAmount} onMethod={setPaymentMethod} onSubmit={handleRecordPayment} onClose={() => setShowPaymentModal(false)} />}

      {/* Print layout */}
      <style>{`
        @media print {
          /* Hide everything except invoice content */
          body * {
            visibility: hidden;
          }
          
          #invoice-content, #invoice-content * {
            visibility: visible;
          }
          
          #invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }
          
          /* Override dark theme colors for print */
          #invoice-content .bg-gray-900,
          #invoice-content .bg-gray-800 {
            background: white !important;
            border-color: #e5e7eb !important;
          }
          
          #invoice-content .text-white {
            color: black !important;
          }
          
          #invoice-content .text-gray-400,
          #invoice-content .text-gray-300 {
            color: #4b5563 !important;
          }
          
          #invoice-content .border-gray-800,
          #invoice-content .border-gray-700 {
            border-color: #e5e7eb !important;
          }
          
          /* Hide action buttons when printing */
          button, .no-print {
            display: none !important;
          }
          
          @page {
            margin: 1cm;
          }
        }
      `}</style>



    </div>
  );
};

export default InvoiceDetails;
