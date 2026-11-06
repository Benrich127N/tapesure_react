import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { Search, Plus, Eye, FileText, Trash2 } from "lucide-react";
import useShopCollection from "../hooks/useShopCollection";
import { invoiceAmounts, invoiceMoney, invoicePaymentStatus, isInvoiceOverdue, matchesInvoice } from "../utils/invoices";
import "./Invoices.css";

const compactMoney = value => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", notation: "compact", maximumFractionDigits: 2 }).format(value);
const statuses = ["All", "Paid", "Partial", "Pending", "Unpaid", "Overdue"];
function Status({ invoice, now }) {
  const status = invoicePaymentStatus(invoice);
  return <div className="flex flex-wrap gap-1"><span className={`invoice-status invoice-status-${status.toLowerCase()}`}>{status}</span>{isInvoiceOverdue(invoice, now) && <span className="invoice-status invoice-status-overdue">Overdue</span>}</div>;
}
export default function Invoices() {
  const navigate = useNavigate();
  const { data: invoices, loading, error, retry } = useShopCollection("invoices");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [now, setNow] = useState(() => new Date());
  const [deleting, setDeleting] = useState(null);
  const deletingRef = useRef(false);
  const [actionError, setActionError] = useState("");
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(timer); }, []);
  const filtered = invoices.filter(invoice => matchesInvoice(invoice, search, status, now)).sort((a, b) => {
    const stamp = invoice => invoice.createdAt?.toMillis?.() || (Number(invoice.createdAt?.seconds) * 1000) || Date.parse(invoice.issueDate || "") || 0;
    return stamp(b) - stamp(a) || String(b.invoiceNumber || "").localeCompare(String(a.invoiceNumber || ""));
  });
  const totals = invoices.reduce((sum, invoice) => { const value = invoiceAmounts(invoice); return { total: sum.total + value.total, paid: sum.paid + value.paid, balance: sum.balance + value.balance }; }, { total: 0, paid: 0, balance: 0 });
  const reset = () => { setSearch(""); setStatus("All"); };
  const active = search.trim() || status !== "All";
  const remove = async (invoice) => {
    if (deletingRef.current || !window.confirm(`Delete invoice ${invoice.invoiceNumber || invoice.id} for ${invoice.clientName || "this customer"}? This cannot be undone.`)) return;
    deletingRef.current = true; setDeleting(invoice.id); setActionError("");
    try { await deleteDoc(doc(db, "invoices", invoice.id)); }
    catch { setActionError("Invoice could not be deleted. Please try again."); }
    finally { deletingRef.current = false; setDeleting(null); }
  };
  const actions = invoice => <div className="flex items-center gap-2">
    <button className="invoice-button flex-1 bg-gray-800 hover:bg-gray-700" aria-label={`View invoice ${invoice.invoiceNumber || invoice.id}`} onClick={() => navigate(`/invoices/${invoice.id}`)}><Eye aria-hidden="true" size={16} /><span>View</span></button>
    <button className="invoice-button text-red-300 hover:bg-red-900/30 disabled:opacity-50" disabled={deleting !== null} aria-label={`Delete invoice ${invoice.invoiceNumber || invoice.id}`} onClick={() => remove(invoice)}><Trash2 aria-hidden="true" size={18} />{deleting === invoice.id && <span>Deleting…</span>}</button>
  </div>;
  return <section className="invoices-page space-y-5 text-gray-100" aria-labelledby="invoices-title">
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div><h1 id="invoices-title" className="text-2xl font-bold sm:text-3xl">Invoices & Payments</h1><p className="mt-1 text-sm text-gray-300">Track invoices, payments received, and outstanding balances.</p></div>
      <button onClick={() => navigate("/invoices/new")} className="invoice-button shrink-0 bg-indigo-600 hover:bg-indigo-500"><Plus aria-hidden="true" size={18} />Create Invoice</button>
    </header>
    <div className="invoice-summaries" aria-label="Invoice summary" aria-busy={loading}>
      {[["Invoices", invoices.length], ["Collected", totals.paid], ["Outstanding", totals.balance], ["Invoice value", totals.total]].map(([label, value], index) => <div key={label} className="invoice-summary-card min-w-0 rounded-xl border border-gray-800 bg-gray-900 p-3 sm:p-4"><p className="text-sm text-gray-300">{label}</p><p className={`invoice-summary-value mt-2 font-bold ${index === 1 ? "text-green-300" : index === 2 ? "text-amber-300" : "text-white"}`}>{loading ? <span className="animate-pulse" aria-label="Loading">—</span> : error ? "—" : index ? <><span className="sr-only">{invoiceMoney(value)}</span><span aria-hidden="true" title={invoiceMoney(value)} className="invoice-summary-full">{invoiceMoney(value)}</span><span aria-hidden="true" title={invoiceMoney(value)} className="invoice-summary-compact">{compactMoney(value)}</span></> : value}</p></div>)}
    </div>
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 space-y-3">
      <label htmlFor="invoice-search" className="block text-sm font-medium">Search invoices</label>
      <div className="relative"><Search aria-hidden="true" className="absolute left-3 top-3 text-gray-400" size={20} /><input id="invoice-search" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Invoice number, customer, or outfit" className="min-h-11 w-full rounded-lg border border-gray-600 bg-gray-800 pl-10 pr-3 text-base text-white placeholder-gray-400" /></div>
      <div role="group" aria-label="Filter invoices by status" className="flex flex-wrap gap-2">{statuses.map(value => <button key={value} aria-pressed={status === value} onClick={() => setStatus(value)} className={`invoice-button text-sm ${status === value ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-200 hover:bg-gray-700"}`}>{value}{!loading && !error && ` (${invoices.filter(invoice => matchesInvoice(invoice, "", value, now)).length})`}</button>)}</div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-300"><p role="status">{loading ? "Loading invoices…" : error ? "Invoices unavailable" : `${filtered.length} of ${invoices.length} invoices`}</p>{active && <button onClick={reset} className="invoice-button text-indigo-300 underline">Reset filters</button>}</div>
      <p className="text-xs text-gray-400">Overdue includes unpaid and partially paid invoices past their due date.</p>
    </div>
    {actionError && <p role="alert" className="rounded-lg border border-red-800 bg-red-900/20 p-4 text-red-200">{actionError}</p>}
    {loading && <div role="status" className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center text-gray-300">Loading invoices…</div>}
    {error && <div role="alert" className="rounded-xl border border-red-800 bg-gray-900 p-6"><h2 className="font-semibold">Could not load invoices</h2><p className="mt-2 text-sm text-gray-300">Check your connection and try again.</p><button onClick={retry} className="invoice-button mt-4 bg-indigo-600">Retry</button></div>}
    {!loading && !error && filtered.length === 0 && <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center"><FileText aria-hidden="true" className="mx-auto mb-3 text-gray-400" size={36} /><h2 className="text-lg font-semibold">{active ? "No matching invoices" : "No invoices yet"}</h2><p className="my-3 text-sm text-gray-300">{active ? "Try another search or reset your filters." : "Create your first invoice to start tracking payments."}</p><button onClick={active ? reset : () => navigate("/invoices/new")} className="invoice-button mx-auto bg-indigo-600">{active ? "Reset filters" : "Create First Invoice"}</button></div>}
    {!loading && !error && filtered.length > 0 && <>
      <div className="invoice-cards">{filtered.map(invoice => { const amounts = invoiceAmounts(invoice); return <article key={invoice.id} className="min-w-0 space-y-4 rounded-xl border border-gray-800 bg-gray-900 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3"><h2 className="min-w-0 break-words font-mono text-sm font-bold">{invoice.invoiceNumber || "Invoice"}</h2><Status invoice={invoice} now={now} /></div>
        <div className="break-words"><p className="font-medium text-gray-100">{invoice.clientName || "Customer not specified"}</p><p className="mt-1 text-sm text-gray-300">{invoice.outfitType || "Service not specified"}</p></div>
        <p className={`text-sm ${isInvoiceOverdue(invoice, now) ? "text-red-300" : "text-gray-300"}`}>Due: {invoice.dueDate || "Not set"}</p>
        <dl className="grid grid-cols-2 gap-3 border-t border-gray-700 pt-3">{[["Total", amounts.total], ["Paid", amounts.paid], ["Balance", amounts.balance]].map(([label, value]) => <div key={label} className={label === "Balance" ? "col-span-2" : "min-w-0"}><dt className="text-xs text-gray-300">{label}</dt><dd className={`invoice-amount mt-1 text-sm font-semibold ${label === "Balance" ? "text-amber-300" : "text-white"}`}>{invoiceMoney(value)}</dd></div>)}</dl>
        {actions(invoice)}
      </article>; })}</div>
      <div className="invoice-table rounded-xl border border-gray-800 bg-gray-900"><table className="w-full table-fixed text-sm"><caption className="sr-only">Invoices with payment totals, due dates, and actions</caption><colgroup><col style={{width:"21%"}}/><col style={{width:"22%"}}/><col style={{width:"23%"}}/><col style={{width:"18%"}}/><col style={{width:"16%"}}/></colgroup><thead className="border-b border-gray-700 text-left text-gray-300"><tr>{["Invoice", "Customer / outfit", "Payments", "Due / status", "Actions"].map(label => <th key={label} scope="col" className="p-4 font-medium">{label}</th>)}</tr></thead><tbody>{filtered.map(invoice => { const amounts = invoiceAmounts(invoice); return <tr key={invoice.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/30"><td className="p-4 align-top"><p className="break-words font-mono font-semibold">{invoice.invoiceNumber || "Invoice"}</p><p className="mt-1 text-xs text-gray-300">Issued: {invoice.issueDate || "Not set"}</p></td><td className="break-words p-4 align-top"><p className="font-medium">{invoice.clientName || "Customer not specified"}</p><p className="mt-1 text-gray-300">{invoice.outfitType || "Service not specified"}</p></td><td className="p-4 align-top"><dl className="space-y-1">{[["Total", amounts.total], ["Paid", amounts.paid], ["Balance", amounts.balance]].map(([label,value]) => <div key={label} className="flex flex-wrap justify-between gap-x-2"><dt className="text-gray-300">{label}</dt><dd className={`invoice-amount ml-auto text-right ${label === "Balance" ? "text-amber-300 font-semibold" : ""}`}>{invoiceMoney(value)}</dd></div>)}</dl></td><td className="p-4 align-top"><p className="mb-2 whitespace-nowrap">{invoice.dueDate || "Not set"}</p><Status invoice={invoice} now={now}/></td><td className="p-3 align-top">{actions(invoice)}</td></tr>; })}</tbody></table></div>
    </>}
  </section>;
}
