import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { AlertCircle, ArrowRight, CheckCircle, Clock, Package, Plus, Users, Wallet } from "lucide-react";
import { db, auth } from "../../firebase";
import { summarizeDashboard, formatMoney, formatDueDate, newestFirst } from "../utils/dashboard";

const actionClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold text-indigo-300 hover:bg-indigo-500/10";
const panelClass = "min-w-0 rounded-xl border border-gray-800 bg-gray-900 p-4 sm:p-6";

function useDashboardCollection(name) {
  const [state, setState] = useState({ data: [], loading: true, error: false });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!auth.currentUser) return;
    setState({ data: [], loading: true, error: false });
    // Summaries need every record, independently of the recent items shown below.
    return onSnapshot(
      query(collection(db, name), where("userId", "==", auth.currentUser.uid)),
      (snapshot) => setState({ data: snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })), loading: false, error: false }),
      () => setState({ data: [], loading: false, error: true }),
    );
  }, [name, attempt]);
  return { ...state, retry: () => setAttempt((value) => value + 1) };
}

function CollectionState({ source, label, children }) {
  if (source.loading) return <p role="status" className="py-6 text-sm text-gray-300">Loading {label}…</p>;
  if (source.error) return (
    <div role="alert" className="flex flex-wrap items-center justify-between gap-2 py-3">
      <p className="text-sm text-red-300">Couldn’t load {label}.</p>
      <button type="button" onClick={source.retry} className={actionClass}>Try again</button>
    </div>
  );
  return children;
}

function Money({ value, className = "" }) {
  const [expanded, setExpanded] = useState(false);
  const fullValue = formatMoney(value);
  return <span className={`inline-flex max-w-full flex-col break-words ${className}`}>
    <button type="button" className="min-h-11 min-w-11 break-all text-left" title="Show or hide the full amount" aria-expanded={expanded} aria-label={`${fullValue}. ${expanded ? "Hide" : "Show"} full amount`} onClick={() => setExpanded((value) => !value)}>{formatMoney(value, true)}</button>
    {expanded && <span className="break-all text-xs font-medium text-gray-300">{fullValue}</span>}
  </span>;
}

function Status({ status = "Received" }) {
  const color = status === "Delivered" ? "border-green-700 text-green-300 bg-green-900/20"
    : status === "Delayed" ? "border-red-700 text-red-300 bg-red-900/20"
      : status === "Cancelled" ? "border-gray-600 text-gray-300 bg-gray-800"
        : "border-yellow-700 text-yellow-300 bg-yellow-900/20";
  return <span className={`inline-flex max-w-full items-center rounded-full border px-2 py-1 text-xs font-medium break-words ${color}`}>{status}</span>;
}

export default function Dashboard({ shopName }) {
  const orders = useDashboardCollection("outfits");
  const clients = useDashboardCollection("clients");
  const invoices = useDashboardCollection("invoices");
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  const summary = summarizeDashboard(orders.data, invoices.data, now);
  const recentOrders = newestFirst(orders.data).slice(0, 3);
  const recentClients = newestFirst(clients.data).slice(0, 5);
  const stats = [
    { title: "Total orders", value: orders.data.length, source: orders, detail: "All time", icon: Package, color: "text-indigo-300" },
    { title: "Customers", value: clients.data.length, source: clients, detail: "In your address book", icon: Users, color: "text-green-300" },
    { title: "Outstanding", value: summary.pending, money: true, source: invoices, detail: "Unpaid invoice balances", icon: Wallet, color: "text-yellow-300" },
    { title: "Overdue orders", value: summary.overdue.length, source: orders, detail: "Needs attention", icon: AlertCircle, color: "text-red-300" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
      <header className="flex flex-wrap items-center justify-between gap-3 lg:col-span-12">
        <div className="min-w-0">
          <p className="break-words text-sm font-medium text-indigo-300">{shopName}</p>
          <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Your dashboard</h1>
          <p className="mt-1 text-sm text-gray-400">{now.toLocaleDateString("en-NG", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}</p>
        </div>
        <Link to="/outfits/new" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-500">
          <Plus aria-hidden="true" size={18} /> New order
        </Link>
      </header>

      <section aria-labelledby="urgent-heading" className={`${panelClass} lg:order-3 lg:col-span-12 xl:col-span-4 xl:self-start`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="urgent-heading" className="flex items-center gap-2 text-lg font-bold text-white"><Clock aria-hidden="true" size={20} className="text-indigo-300" /> Needs attention</h2>
          <Link to="/calendar" className={actionClass}>Calendar <ArrowRight aria-hidden="true" size={16} /></Link>
        </div>
        <CollectionState source={orders} label="urgent orders">
          {summary.urgent.length === 0 ? <p className="py-4 text-sm text-gray-300">You’re up to date. No overdue orders or deliveries due today.</p> : <>
            <p className="mb-3 text-sm text-gray-300">{summary.overdue.length} overdue · {summary.dueToday.length} due today</p>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
              {summary.urgent.slice(0, 4).map((order, index) => (
                <article key={order.id} className={`min-w-0 rounded-lg border border-red-800/60 bg-red-900/10 p-3 ${index > 1 ? "hidden md:block" : ""}`}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 break-words"><h3 className="text-sm font-semibold text-gray-100">{order.clientName || "Customer"}</h3><p className="mt-1 text-sm text-gray-300">{order.outfitType || "Order"}</p></div>
                    <span className="text-xs font-semibold text-red-300">{order.isDueToday ? "Due today" : "Overdue"}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-gray-300">Due {formatDueDate(order.dueDate)}</p>
                    <Link to={`/outfits/${order.id}`} aria-label={`View order for ${order.clientName || "customer"}`} title={`View order for ${order.clientName || "customer"}`} className={`${actionClass} min-w-11`}><span className="xl:sr-only">View order</span> <ArrowRight aria-hidden="true" size={16} /></Link>
                  </div>
                </article>
              ))}
            </div>
            {summary.urgent.length > 2 && <Link to="/outfits" className={`${actionClass} mt-3`}>View all orders ({summary.urgent.length} need attention)</Link>}
          </>}
        </CollectionState>
      </section>

      <section aria-label="Business summary" className="grid grid-cols-2 gap-3 sm:gap-4 lg:order-1 lg:col-span-12 lg:grid-cols-4">
        {stats.map((stat) => {
          const { title, value, source, detail, icon: Icon, color, money } = stat;
          return (
          <div key={title} className={`${panelClass} !p-3 sm:!p-5`}>
            <Icon aria-hidden="true" size={20} className={`mb-3 ${color}`} />
            <h2 className="text-sm font-medium text-gray-300">{title}</h2>
            <p className={`mt-1 break-words text-xl font-bold sm:text-2xl ${color}`} aria-live="polite">
              {source.loading ? <span className="text-sm text-gray-300">Loading…</span> : source.error ? <span className="text-sm text-gray-300">Unavailable</span> : money ? <Money value={value} /> : value.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-gray-400">{detail}</p>
          </div>
        ); })}
      </section>

      <section aria-labelledby="recent-orders-heading" className={`${panelClass} lg:order-2 lg:col-span-12 xl:col-span-8 xl:self-start`}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 id="recent-orders-heading" className="text-lg font-bold text-white">Recent orders</h2>
          <Link to="/outfits" className={actionClass}>View all <ArrowRight aria-hidden="true" size={16} /></Link>
        </div>
        <CollectionState source={orders} label="orders">
          {recentOrders.length === 0 ? <div className="py-5 text-center">
            <p className="mb-3 text-sm text-gray-300">Create your first customer order to get started.</p>
            <Link to="/outfits/new" className={actionClass}><Plus aria-hidden="true" size={18} /> New order</Link>
          </div> : <>
            <div className="space-y-3 lg:hidden">
              {recentOrders.map((order) => (
                <article key={order.id} className="rounded-lg border border-gray-700 bg-gray-800/60 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 break-words"><h3 className="text-sm font-semibold text-gray-100">{order.clientName || "Customer"}</h3><p className="mt-1 text-sm text-gray-300">{order.outfitType || "Order"}</p></div>
                    <Status status={order.status} />
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-gray-700 pt-3">
                    <div className="min-w-0"><dt className="text-xs text-gray-400">Order value</dt><dd className="mt-1 text-sm font-semibold text-indigo-300 break-words">{formatMoney(order.amount)}</dd></div>
                    <div className="min-w-0 text-right"><dt className="text-xs text-gray-400">Due date</dt><dd className="mt-1 text-sm text-gray-200">{formatDueDate(order.dueDate)}</dd></div>
                  </dl>
                  <Link to={`/outfits/${order.id}`} aria-label={`View order for ${order.clientName || "customer"}`} className={`${actionClass} mt-2 w-full border border-gray-700`}>View order <ArrowRight aria-hidden="true" size={16} /></Link>
                </article>
              ))}
            </div>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full table-fixed text-sm">
                <colgroup><col className="w-[36%]" /><col className="w-[18%]" /><col className="w-[20%]" /><col className="w-[26%]" /></colgroup>
                <caption className="sr-only">Your three most recent orders</caption>
                <thead className="text-xs text-gray-400"><tr>{["Customer / outfit", "Status", "Due date", "Order value"].map((label) => <th key={label} scope="col" className={`border-b border-gray-800 px-2 py-3 ${label === "Order value" ? "text-right" : ""}`}>{label}</th>)}</tr></thead>
                <tbody>{recentOrders.map((order) => <tr key={order.id} className="border-b border-gray-800 text-gray-300">
                  <td className="break-words px-2 py-3"><Link to={`/outfits/${order.id}`} aria-label={`View order for ${order.clientName || "customer"}`} className="inline-flex min-h-11 max-w-full flex-col justify-center gap-1 rounded text-indigo-300 hover:underline"><span className="font-semibold">{order.clientName || "Customer"}</span><span className="text-xs text-gray-300">{order.outfitType || "Order"}</span></Link></td>
                  <td className="px-2 py-3"><Status status={order.status} /></td>
                  <td className="px-2 py-3">{formatDueDate(order.dueDate)}</td>
                  <td className="break-words px-2 py-3 text-right font-semibold tabular-nums text-indigo-300">{formatMoney(order.amount)}</td>
                </tr>)}</tbody>
              </table>
            </div>
          </>}
        </CollectionState>
      </section>

      <div className="grid gap-4 sm:gap-6 lg:order-4 lg:col-span-12 lg:grid-cols-2">
        <section aria-labelledby="payments-heading" className={panelClass}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 id="payments-heading" className="text-lg font-bold text-white">Payment summary</h2>
            <Link to="/invoices" className={actionClass}>Invoices <ArrowRight aria-hidden="true" size={16} /></Link>
          </div>
          <CollectionState source={invoices} label="payments">
            {invoices.data.length === 0 ? <p className="py-4 text-sm text-gray-300">No invoices yet. Create an invoice to track payments and balances.</p> : (
              <dl className="space-y-3">
                {[
                  { label: "Total collected", value: summary.collected, detail: "Payments recorded on invoices", color: "text-green-300", icon: CheckCircle },
                  { label: "Outstanding balance", value: summary.pending, detail: "Unpaid invoice balances", color: "text-yellow-300", icon: Wallet },
                  { label: "Due in the next 7 days", value: summary.expected, detail: "Invoice balances due today through the next 6 days", color: "text-indigo-300", icon: Clock },
                ].map((payment) => {
                  const { label, value, detail, color, icon: Icon } = payment;
                  return <div key={label} className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
                  <dt className="flex items-center justify-between gap-2 text-sm text-gray-200">{label}<Icon aria-hidden="true" className={color} size={18} /></dt>
                  <dd className={`mt-2 text-2xl font-bold ${color}`}><Money value={value} /></dd>
                  <dd className="mt-1 text-xs text-gray-400">{detail}</dd>
                </div>; })}
              </dl>
            )}
          </CollectionState>
        </section>

        <section aria-labelledby="clients-heading" className={panelClass}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 id="clients-heading" className="text-lg font-bold text-white">Recent customers</h2>
            <Link to="/clients" className={actionClass}>View all <ArrowRight aria-hidden="true" size={16} /></Link>
          </div>
          <CollectionState source={clients} label="customers">
            {recentClients.length === 0 ? <p className="py-4 text-sm text-gray-300">No customers yet. Add your first customer to get started.</p> : (
              <ul className="space-y-3">{recentClients.map((client) => <li key={client.id}>
                <Link to={`/clients/${client.id}`} className="flex min-h-11 items-center gap-3 rounded-lg bg-gray-800/60 p-3 hover:bg-gray-800">
                  <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-sm font-semibold text-indigo-300">{(client.name || "?").trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span>
                  <div className="min-w-0 flex-1 break-words"><h3 className="text-sm font-semibold text-gray-100">{client.name || "Customer"}</h3><p className="mt-1 text-xs text-gray-300">{client.phone || "No phone number"}</p></div>
                  <ArrowRight aria-hidden="true" size={18} className="shrink-0 text-indigo-300" />
                </Link>
              </li>)}</ul>
            )}
          </CollectionState>
        </section>
      </div>
    </div>
  );
}
