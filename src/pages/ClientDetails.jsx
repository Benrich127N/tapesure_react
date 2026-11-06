import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { ArrowLeft, ArrowRight, Edit, Plus, Trash2 } from "lucide-react";
import { auth, db } from "../../firebase";
import useShopCollection from "../hooks/useShopCollection";
import CustomerFields from "../components/CustomerFields";
import CustomerContact from "../components/CustomerContact";
import { customerFormError, customerInitials, customerOrderSummary, joinedDate } from "../utils/customers";
import { formatDueDate, formatMoney } from "../utils/dashboard";

const actionClass = "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition";
const panelClass = "min-w-0 rounded-xl border border-gray-800 bg-gray-900 p-4 sm:p-6";
const contactForm = (customer) => ({ name: customer?.name || "", phone: customer?.phone || "", email: customer?.email || "" });

export default function ClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const editing = searchParams.get("edit") === "true";
  const [profile, setProfile] = useState({ data: null, loading: true, error: "" });
  const [attempt, setAttempt] = useState(0);
  const [form, setForm] = useState(contactForm(null));
  const [busy, setBusy] = useState("");
  const pending = useRef(false);
  const [saveError, setSaveError] = useState("");
  const [feedback, setFeedback] = useState("");
  const orders = useShopCollection("outfits");
  const customer = profile.data;
  const summary = customer ? customerOrderSummary(customer, orders.data) : null;
  const countsReady = !orders.loading && !orders.error;

  useEffect(() => {
    let active = true;
    setProfile({ data: null, loading: true, error: "" });
    const load = async () => {
      try {
        const snapshot = await getDoc(doc(db, "clients", id));
        if (!active) return;
        if (!snapshot.exists() || snapshot.data().userId !== auth.currentUser?.uid) {
          setProfile({ data: null, loading: false, error: "This customer could not be found." });
          return;
        }
        const data = { ...snapshot.data(), id: snapshot.id || id };
        setProfile({ data, loading: false, error: "" });
        setForm(contactForm(data));
      } catch {
        if (active) setProfile({ data: null, loading: false, error: "We couldn’t load this customer. Check your connection and try again." });
      }
    };
    load();
    return () => { active = false; };
  }, [id, attempt]);

  const setEditing = (value) => setSearchParams((previous) => {
    const next = new URLSearchParams(previous);
    if (value) next.set("edit", "true");
    else next.delete("edit");
    return next;
  }, { replace: true });

  const save = async (event) => {
    event.preventDefault();
    if (pending.current) return;
    const error = customerFormError(form);
    if (error) { setSaveError(error); return; }
    pending.current = true;
    setBusy("save");
    setSaveError("");
    setFeedback("");
    const update = { name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() };
    try {
      await updateDoc(doc(db, "clients", id), update);
      setProfile((previous) => ({ ...previous, data: { ...previous.data, ...update } }));
      setEditing(false);
      setFeedback("Customer details saved.");
    } catch {
      setSaveError("We couldn’t save your changes. Your details are still here. Please try again.");
    } finally {
      pending.current = false;
      setBusy("");
    }
  };

  const remove = async () => {
    if (pending.current) return;
    if (!window.confirm(`Delete ${customer.name || "this customer"}? Their orders will be kept.`)) return;
    pending.current = true;
    setBusy("delete");
    setSaveError("");
    try {
      await deleteDoc(doc(db, "clients", id));
      navigate("/clients");
    } catch {
      setSaveError("We couldn’t delete this customer. Please try again.");
    } finally {
      pending.current = false;
      setBusy("");
    }
  };

  if (profile.loading) return <p role="status" className={`${panelClass} py-8 text-center text-sm text-gray-300`}>Loading customer details…</p>;
  if (profile.error || !customer) return <div role="alert" className={`${panelClass} text-center`}>
    <h1 className="text-xl font-bold text-white">Customer unavailable</h1><p className="mt-3 text-sm text-gray-300">{profile.error || "This customer could not be found."}</p>
    <div className="mt-4 flex flex-wrap justify-center gap-2"><button type="button" onClick={() => setAttempt((value) => value + 1)} className={`${actionClass} bg-indigo-600 text-white hover:bg-indigo-500`}>Try again</button><Link to="/clients" className={`${actionClass} text-indigo-300 hover:bg-indigo-500/10`}>Back to customers</Link></div>
  </div>;

  return <div className="space-y-4 sm:space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <Link to="/clients" className={`${actionClass} text-gray-200 hover:bg-gray-800`}><ArrowLeft aria-hidden="true" size={18} /> Back to customers</Link>
      <div className="flex flex-wrap gap-2">{editing ? <button type="button" disabled={!!busy} onClick={() => { setForm(contactForm(customer)); setSaveError(""); setEditing(false); }} className={`${actionClass} border border-gray-600 text-gray-200 hover:bg-gray-800 disabled:opacity-50`}>Cancel</button> : <>
        <button type="button" disabled={!!busy} onClick={() => { setForm(contactForm(customer)); setSaveError(""); setFeedback(""); setEditing(true); }} className={`${actionClass} bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50`}><Edit aria-hidden="true" size={16} /> Edit customer</button>
        <button type="button" disabled={!!busy} onClick={remove} className={`${actionClass} border border-red-800 text-red-300 hover:bg-red-900/20 disabled:opacity-50`}><Trash2 aria-hidden="true" size={16} />{busy === "delete" ? "Deleting…" : "Delete"}</button>
      </>}</div>
    </header>
    {feedback && <p role="status" className="rounded-lg border border-green-800 bg-green-900/10 p-3 text-sm text-green-200">{feedback}</p>}
    {saveError && <p role="alert" className="rounded-lg border border-red-800 bg-red-900/10 p-3 text-sm text-red-200">{saveError}</p>}

    {editing ? <form onSubmit={save} aria-busy={busy === "save"} className={`${panelClass} mx-auto max-w-2xl space-y-5`}>
      <h1 className="text-xl font-bold text-white">Edit customer</h1>
      <CustomerFields prefix="edit-customer" value={form} onChange={setForm} disabled={!!busy} />
      <p className="text-sm text-gray-300">Name changes won’t update names shown on existing orders.</p>
      <button type="submit" disabled={!!busy} className={`${actionClass} w-full bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-60`}>{busy === "save" ? "Saving changes…" : "Save changes"}</button>
    </form> : <>
      <section aria-label="Customer details" className={panelClass}>
        <div className="flex items-start gap-3"><span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-base font-bold text-indigo-300">{customerInitials(customer.name)}</span><div className="min-w-0 flex-1"><h1 className="break-words text-2xl font-bold text-white">{customer.name || "Customer"}</h1><p className="mt-1 text-xs text-gray-400">Joined {joinedDate(customer.createdAt)}</p></div></div>
        <div className="mt-4 border-t border-gray-800 pt-3"><CustomerContact customer={customer} /></div>
      </section>
      <section aria-label="Customer order summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[{ label: "Total orders", value: summary.total }, { label: "Active orders", value: summary.active }, { label: "Delivered", value: summary.delivered }, { label: "Order value", value: formatMoney(summary.value) }].map((stat) => <div key={stat.label} className="min-w-0 rounded-xl border border-gray-800 bg-gray-900 p-4"><h2 className="text-sm text-gray-300">{stat.label}</h2><p className="mt-2 break-all text-lg font-bold text-indigo-300">{countsReady ? stat.value : <span className="text-sm text-gray-300">{orders.loading ? "Loading…" : "Unavailable"}</span>}</p></div>)}
      </section>
      <section aria-labelledby="customer-orders-heading" className={panelClass}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h2 id="customer-orders-heading" className="text-lg font-bold text-white">Order history</h2><Link to={`/outfits/new?clientId=${encodeURIComponent(id)}`} className={`${actionClass} text-indigo-300 hover:bg-indigo-500/10`}><Plus aria-hidden="true" size={18} /> New order</Link></div>
        {orders.loading ? <p role="status" className="py-5 text-sm text-gray-300">Loading customer orders…</p> : orders.error ? <div role="alert" className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm text-red-200">We couldn’t load this customer’s orders.</p><button type="button" onClick={orders.retry} className={`${actionClass} text-indigo-300 hover:bg-indigo-500/10`}>Try again</button></div> : summary.orders.length === 0 ? <p className="py-5 text-sm text-gray-300">No orders yet. Create an order to start this customer’s history.</p> : <ul className="grid gap-3 lg:grid-cols-2">{summary.orders.map((order) => <li key={order.id}>
          <Link to={`/outfits/${order.id}`} className="flex min-h-11 items-center gap-3 rounded-lg border border-gray-700 bg-gray-800/50 p-4 hover:border-indigo-400">
            <div className="min-w-0 flex-1 break-words"><h3 className="text-sm font-semibold text-gray-100">{order.outfitType || "Order"}</h3><p className="mt-1 text-sm text-gray-300">Due {formatDueDate(order.dueDate)}</p><p className="mt-2 text-xs text-gray-300">{order.status || "Received"}</p><p className="mt-1 break-all text-sm font-semibold text-indigo-300">{formatMoney(order.amount)}</p></div><ArrowRight aria-hidden="true" size={18} className="shrink-0 text-indigo-300" />
          </Link>
        </li>)}</ul>}
      </section>
    </>}
  </div>;
}
