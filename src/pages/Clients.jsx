import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { addDoc, collection, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { Edit, Eye, Plus, Search, Trash2 } from "lucide-react";
import { auth, db } from "../../firebase";
import useShopCollection from "../hooks/useShopCollection";
import AddCustomerDialog from "../components/AddCustomerDialog";
import CustomerContact from "../components/CustomerContact";
import { addedThisMonth, customerFormError, customerInitials, customerOrderSummary, joinedDate, searchCustomers } from "../utils/customers";
import { celebrateMilestone, CUSTOMER_MILESTONES } from "../utils/milestones";
import "./Clients.css";

const actionClass = "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition";
const panelClass = "min-w-0 rounded-xl border border-gray-800 bg-gray-900 p-4 sm:p-5";

function CustomerActions({ customer, compact, deleting, onDelete }) {
  const name = customer.name || "customer";
  return <div className={`flex gap-2 ${compact ? "justify-end" : ""}`}>
    <Link to={`/clients/${customer.id}`} aria-label={`View ${name}`} title={`View ${name}`} className={`${actionClass} ${compact ? "" : "flex-1"} bg-indigo-600 text-white hover:bg-indigo-500`}><Eye aria-hidden="true" size={16} /><span className={compact ? "sr-only" : ""}>View</span></Link>
    <Link to={`/clients/${customer.id}?edit=true`} aria-label={`Edit ${name}`} title={`Edit ${name}`} className={`${actionClass} ${compact ? "" : "flex-1"} border border-gray-600 text-gray-200 hover:bg-gray-800`}><Edit aria-hidden="true" size={16} /><span className={compact ? "sr-only" : ""}>Edit</span></Link>
    <button type="button" disabled={deleting} onClick={() => onDelete(customer)} aria-label={`${deleting ? "Deleting" : "Delete"} ${name}`} title={`${deleting ? "Deleting" : "Delete"} ${name}`} className={`${actionClass} shrink-0 border border-red-800 text-red-300 hover:bg-red-900/20 disabled:opacity-50`}><Trash2 aria-hidden="true" size={16} /><span className="sr-only">{deleting ? "Deleting…" : "Delete"}</span></button>
  </div>;
}

export default function Clients() {
  const customers = useShopCollection("clients");
  const orders = useShopCollection("outfits");
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [createPending, setCreatePending] = useState(false);
  const [createError, setCreateError] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const creationPending = useRef(false);
  const [deleting, setDeleting] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const deletionPending = useRef(new Set());
  const filtered = searchCustomers(customers.data, search);
  const metrics = useMemo(() => new Map(customers.data.map((customer) => [customer.id, customerOrderSummary(customer, orders.data)])), [customers.data, orders.data]);
  const countsReady = !orders.loading && !orders.error;

  const addCustomer = async (event) => {
    event.preventDefault();
    if (creationPending.current) return;
    const validation = customerFormError(form);
    if (validation) { setCreateError(validation); return; }
    creationPending.current = true;
    setCreatePending(true);
    setCreateError("");
    const name = form.name.trim();
    const count = customers.loading || customers.error ? null : customers.data.length + 1;
    try {
      await addDoc(collection(db, "clients"), { userId: auth.currentUser.uid, name, phone: form.phone.trim(), email: form.email.trim(), measurements: { chest: 0, waist: 0, hip: 0 }, createdAt: serverTimestamp() });
    } catch {
      creationPending.current = false;
      setCreatePending(false);
      setCreateError("We couldn’t add this customer. Your details are still in the form. Please try again.");
      return;
    }
    creationPending.current = false;
    setCreatePending(false);
    setAdding(false);
    setForm({ name: "", phone: "", email: "" });
    setFeedback(`${name} added to your customers.`);
    if (count != null && CUSTOMER_MILESTONES.includes(count)) celebrateMilestone({ id: `customers-${count}`, title: count === 1 ? "Your first customer is in!" : `${count} customers!`, message: count === 1 ? `${name} is now in your customer book.` : "Your customer book is growing.", emoji: count === 1 ? "✂️" : "🤝" });
  };

  const deleteCustomer = async (customer) => {
    if (deletionPending.current.has(customer.id)) return;
    if (!window.confirm(`Delete ${customer.name || "this customer"}? Their orders will be kept.`)) return;
    deletionPending.current.add(customer.id);
    setDeleting(customer.id);
    setDeleteError("");
    setFeedback("");
    try {
      await deleteDoc(doc(db, "clients", customer.id));
      setFeedback(`${customer.name || "Customer"} deleted. Their orders have been kept.`);
    } catch {
      setDeleteError(`We couldn’t delete ${customer.name || "this customer"}. Please try again.`);
    } finally {
      deletionPending.current.delete(customer.id);
      setDeleting((current) => current === customer.id ? null : current);
    }
  };

  return <div className="space-y-4 sm:space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0"><h1 className="text-2xl font-bold text-white sm:text-3xl">Customers</h1><p className="mt-1 text-sm text-gray-300">Contact details, measurements, and order history in one place.</p></div>
      <button id="add-customer-trigger" type="button" disabled={createPending} onClick={() => { setFeedback(""); setAdding(true); }} className={`${actionClass} bg-indigo-600 px-4 text-white hover:bg-indigo-500 disabled:opacity-60`}><Plus aria-hidden="true" size={18} /> Add customer</button>
    </header>

    <section aria-label="Customer summary" className="grid max-w-xl grid-cols-2 gap-3">
      {[{ label: "Total customers", value: customers.data.length }, { label: "Added this month", value: addedThisMonth(customers.data) }].map((stat) => <div key={stat.label} className="min-w-0 rounded-xl border border-gray-800 bg-gray-900 px-4 py-3">
        <h2 className="text-sm text-gray-300">{stat.label}</h2><p className="mt-1 text-2xl font-bold text-indigo-300">{customers.loading ? <span className="text-sm text-gray-300">Loading…</span> : customers.error ? <span className="text-sm text-gray-300">Unavailable</span> : stat.value.toLocaleString()}</p>
      </div>)}
    </section>

    <section aria-label="Search customers" className={panelClass}>
      <label htmlFor="customer-search" className="mb-2 block text-sm font-medium text-gray-200">Search customers</label>
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1"><Search aria-hidden="true" size={18} className="pointer-events-none absolute left-3 top-3.5 text-gray-400" /><input id="customer-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, phone, or email" className="min-h-11 w-full rounded-lg border border-gray-600 bg-gray-950 py-2 pl-10 pr-3 text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400" /></div>
        {search && <button type="button" onClick={() => setSearch("")} className={`${actionClass} text-indigo-300 hover:bg-indigo-500/10`}>Clear search</button>}
      </div>
      {!customers.loading && !customers.error && <p role="status" className="mt-3 text-sm text-gray-300">{filtered.length} of {customers.data.length} {customers.data.length === 1 ? "customer" : "customers"}</p>}
    </section>

    {createPending && <p role="status" className="rounded-lg border border-indigo-800 bg-indigo-900/10 p-3 text-sm text-indigo-200">Adding customer…</p>}
    {createError && !adding && <p role="alert" className="rounded-lg border border-red-800 bg-red-900/10 p-3 text-sm text-red-200">{createError} Open Add customer to retry.</p>}
    {feedback && !createPending && <p role="status" className="rounded-lg border border-green-800 bg-green-900/10 p-3 text-sm text-green-200">{feedback}</p>}
    {deleteError && <p role="alert" className="rounded-lg border border-red-800 bg-red-900/10 p-3 text-sm text-red-200">{deleteError}</p>}
    {!customers.loading && !customers.error && orders.error && <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-yellow-800 bg-yellow-900/10 p-3">
      <p className="text-sm text-yellow-200">Customer details are available. We couldn’t load their order counts.</p><button type="button" onClick={orders.retry} className={`${actionClass} text-indigo-300 hover:bg-indigo-500/10`}>Retry order counts</button>
    </div>}

    {customers.loading ? <p role="status" className={`${panelClass} py-8 text-center text-sm text-gray-300`}>Loading your customers…</p>
      : customers.error ? <div role="alert" className={`${panelClass} text-center`}><h2 className="text-lg font-bold text-white">We couldn’t load your customers.</h2><p className="mt-2 text-sm text-gray-300">Check your connection and try again.</p><button type="button" onClick={customers.retry} className={`${actionClass} mt-4 bg-indigo-600 text-white hover:bg-indigo-500`}>Try again</button></div>
        : filtered.length === 0 ? <section className={`${panelClass} py-8 text-center`}><h2 className="text-lg font-bold text-white">{search.trim() ? "No matching customers" : "No customers yet"}</h2><p className="mt-2 text-sm text-gray-300">{search.trim() ? "Try another name, phone number, or email." : "Add your first customer to save their contact details and start tracking orders."}</p>{search ? <button type="button" onClick={() => setSearch("")} className={`${actionClass} mt-4 text-indigo-300 hover:bg-indigo-500/10`}>Clear search</button> : <button type="button" disabled={createPending} onClick={() => setAdding(true)} className={`${actionClass} mt-4 bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-60`}><Plus aria-hidden="true" size={18} /> Add first customer</button>}</section>
          : <>
            <ul className="customer-card-grid grid gap-4">
              {filtered.map((customer) => {
                const summary = metrics.get(customer.id);
                return <li key={customer.id} className={panelClass}>
                  <article className="space-y-3">
                    <div className="flex items-start gap-3"><span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-sm font-semibold text-indigo-300">{customerInitials(customer.name)}</span><div className="min-w-0 flex-1"><h2 className="break-words text-base font-semibold text-white">{customer.name || "Customer"}</h2><p className="mt-1 text-xs text-gray-400">Joined {joinedDate(customer.createdAt)}</p></div></div>
                    <CustomerContact customer={customer} />
                    <p className="rounded-lg bg-gray-800/60 p-3 text-sm text-gray-300">{countsReady ? <><span className="font-semibold text-gray-100">{summary.total}</span> {summary.total === 1 ? "order" : "orders"} · <span className={summary.active ? "font-semibold text-yellow-200" : "text-gray-300"}>{summary.active ? `${summary.active} active` : "No active orders"}</span></> : orders.loading ? "Loading orders…" : "Order counts unavailable"}</p>
                    <CustomerActions customer={customer} deleting={deleting === customer.id} onDelete={deleteCustomer} />
                  </article>
                </li>;
              })}
            </ul>
            <section aria-label="Customer directory" className={`${panelClass} customer-table-view hidden`}>
              <table className="w-full table-fixed text-left text-sm">
                <caption className="sr-only">Customers, newest first</caption>
                <colgroup><col /><col /><col className="w-[72px]" /><col className="w-[72px]" /><col className="w-28" /><col className="w-44" /></colgroup>
                <thead><tr>{["Customer", "Contact", "Orders", "Active", "Joined", "Actions"].map((label) => <th key={label} scope="col" className="border-b border-gray-700 px-2 py-3 text-xs font-semibold text-gray-300">{label}</th>)}</tr></thead>
                <tbody>{filtered.map((customer) => {
                  const summary = metrics.get(customer.id);
                  return <tr key={customer.id} className="border-b border-gray-800">
                    <th scope="row" className="break-words px-2 py-3 text-left font-semibold"><Link to={`/clients/${customer.id}`} className="inline-flex min-h-11 max-w-full items-center rounded text-indigo-300 hover:underline">{customer.name || "Customer"}</Link></th>
                    <td className="px-2 py-3"><CustomerContact customer={customer} /></td>
                    <td className="px-2 py-3 text-gray-100">{countsReady ? summary.total : <span className="text-xs text-gray-300">{orders.loading ? "Loading…" : "Unavailable"}</span>}</td>
                    <td className="px-2 py-3 text-gray-100">{countsReady ? summary.active : <span className="text-xs text-gray-300">{orders.loading ? "Loading…" : "Unavailable"}</span>}</td>
                    <td className="px-2 py-3 text-gray-300">{joinedDate(customer.createdAt)}</td>
                    <td className="px-2 py-3"><CustomerActions customer={customer} compact deleting={deleting === customer.id} onDelete={deleteCustomer} /></td>
                  </tr>;
                })}</tbody>
              </table>
            </section>
          </>}
    {adding && <AddCustomerDialog onClose={() => setAdding(false)} onSubmit={addCustomer} form={form} onChange={setForm} saving={createPending} error={createError} />}
  </div>;
}
