import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { AlertCircle, ArrowRight, Edit2, Eye, Plus } from "lucide-react";
import { db, auth } from "../../firebase";
import { formatDueDate, formatMoney } from "../utils/dashboard";
import { orderFilters, selectOrders } from "../utils/orders";

const actionClass = "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition";

function OrderStatus({ order, overdue }) {
  const color = order.status === "Delivered" ? "border-green-700 bg-green-900/20 text-green-300"
    : order.status === "Delayed" ? "border-red-700 bg-red-900/20 text-red-300"
      : order.status === "Ready" ? "border-indigo-700 bg-indigo-900/20 text-indigo-300"
        : order.status === "Cancelled" ? "border-gray-600 bg-gray-800 text-gray-300"
          : "border-yellow-700 bg-yellow-900/20 text-yellow-300";
  return <div className="flex max-w-full flex-wrap items-center gap-2">
    <span className={`max-w-full break-words rounded-full border px-2 py-1 text-xs font-medium ${color}`}>{order.status || "Received"}</span>
    {overdue && <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-300"><AlertCircle aria-hidden="true" size={14} /> Overdue</span>}
  </div>;
}

function OrderActions({ order, compact = false }) {
  const customer = order.clientName || "customer";
  return <div className={`flex gap-2 ${compact ? "justify-end" : "flex-wrap"}`}>
    <Link to={`/outfits/${order.id}`} title={`View order for ${customer}`} aria-label={`View order for ${customer}`} className={`${actionClass} ${compact ? "shrink-0" : "flex-1"} border border-gray-600 bg-gray-700/50 text-gray-100 hover:bg-gray-700`}><Eye aria-hidden="true" size={16} /><span className={compact ? "sr-only" : ""}>View</span></Link>
    <Link to={`/outfits/${order.id}?edit=true`} title={`Edit order for ${customer}`} aria-label={`Edit order for ${customer}`} className={`${actionClass} ${compact ? "shrink-0" : "flex-1"} bg-indigo-600 text-white hover:bg-indigo-500`}><Edit2 aria-hidden="true" size={16} /><span className={compact ? "sr-only" : ""}>Edit</span></Link>
  </div>;
}

export default function Outfits() {
  const [source, setSource] = useState({ orders: [], loading: true, error: false });
  const [attempt, setAttempt] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("q") || "";
  const requestedFilter = searchParams.get("status");
  const filter = orderFilters.some((item) => item.value === requestedFilter) ? requestedFilter : "all";
  const result = selectOrders(source.orders, search, filter, now);
  const hasFilters = !!search.trim() || filter !== "all";

  useEffect(() => {
    if (!auth.currentUser) return;
    setSource({ orders: [], loading: true, error: false });
    // Sort locally so older orders without a creation timestamp remain visible.
    return onSnapshot(
      query(collection(db, "outfits"), where("userId", "==", auth.currentUser.uid)),
      (snapshot) => setSource({ orders: snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })), loading: false, error: false }),
      () => setSource({ orders: [], loading: false, error: true }),
    );
  }, [attempt]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const changeFilter = (value) => setSearchParams((previous) => {
    const next = new URLSearchParams(previous);
    if (value === "all") next.delete("status");
    else next.set("status", value);
    return next;
  });
  const clearFilters = () => setSearchParams((previous) => {
    const next = new URLSearchParams(previous);
    next.delete("q");
    next.delete("status");
    return next;
  }, { replace: true });

  return <div className="space-y-4 sm:space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Orders</h1>
        <p className="mt-1 text-sm text-gray-300">Track customer orders from intake to delivery.</p>
      </div>
      <Link to="/outfits/new" className={`${actionClass} bg-indigo-600 px-4 text-white hover:bg-indigo-500`}><Plus aria-hidden="true" size={18} /> New order</Link>
    </header>

    <section aria-label="Order summary" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {orderFilters.map((item) => <div key={item.value} className="min-w-0 rounded-xl border border-gray-800 bg-gray-900 px-4 py-3">
        <h2 className="text-sm font-medium text-gray-300">{item.value === "all" ? "Total orders" : item.label}</h2>
        <p className={`mt-1 break-words text-2xl font-bold ${item.value === "overdue" ? "text-red-300" : "text-indigo-300"}`}>
          {source.loading ? <span className="text-sm text-gray-300">Loading…</span> : source.error ? <span className="text-sm text-gray-300">Unavailable</span> : result.stats[item.value].toLocaleString()}
        </p>
      </div>)}
    </section>

    <section aria-labelledby="order-list-heading" className="min-w-0 rounded-xl border border-gray-800 bg-gray-900 p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 id="order-list-heading" className="text-lg font-bold text-white">Your orders</h2>
        <p className="text-xs text-gray-400">Newest first</p>
      </div>
      <div role="group" aria-label="Filter orders by status" className="mb-3 flex flex-wrap gap-2">
        {orderFilters.map((item) => <button key={item.value} type="button" aria-pressed={filter === item.value} onClick={() => changeFilter(item.value)} className={`${actionClass} border ${filter === item.value ? "border-indigo-400 bg-indigo-500/15 text-indigo-200" : "border-gray-700 text-gray-300 hover:bg-gray-800"}`}>{item.label}</button>)}
      </div>
      {!source.loading && !source.error && <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p role="status" className="min-w-0 break-words text-sm text-gray-300">{result.orders.length} of {source.orders.length} {source.orders.length === 1 ? "order" : "orders"}{search.trim() && <> matching “{search.trim()}”</>}</p>
        {hasFilters && <button type="button" onClick={clearFilters} className={`${actionClass} text-indigo-300 hover:bg-indigo-500/10`}>Clear filters</button>}
      </div>}

      {source.loading ? <div role="status" className="py-8 text-center text-sm text-gray-300"><p className="animate-pulse">Loading your orders…</p></div>
        : source.error ? <div role="alert" className="rounded-lg border border-red-800/60 bg-red-900/10 p-5 text-center">
          <h3 className="font-semibold text-gray-100">We couldn’t load your orders.</h3>
          <p className="mt-2 text-sm text-gray-300">Check your connection and try again.</p>
          <button type="button" onClick={() => setAttempt((value) => value + 1)} className={`${actionClass} mt-4 bg-indigo-600 text-white hover:bg-indigo-500`}>Try again</button>
        </div>
          : result.orders.length === 0 ? <div className="py-8 text-center">
            <h3 className="font-semibold text-gray-100">{hasFilters ? "No matching orders" : "No orders yet"}</h3>
            <p className="mt-2 text-sm text-gray-300">{hasFilters ? "Try another name, outfit, or status, or clear your filters." : "Create your first customer order to get started."}</p>
            {hasFilters ? <button type="button" onClick={clearFilters} className={`${actionClass} mt-4 text-indigo-300 hover:bg-indigo-500/10`}>Clear search and filters</button>
              : <Link to="/outfits/new" className={`${actionClass} mt-4 bg-indigo-600 text-white hover:bg-indigo-500`}><Plus aria-hidden="true" size={18} /> New order</Link>}
          </div> : <>
            <ul className="orders-card-list grid gap-3 md:grid-cols-2">
              {result.orders.map((order) => <li key={order.id} className="rounded-lg border border-gray-700 bg-gray-800/50 p-3 sm:p-4">
                <article className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1 break-words"><h3 className="text-sm font-semibold text-gray-100">{order.clientName || "Customer"}</h3><p className="mt-1 text-sm text-gray-300">{order.outfitType || "Order"}</p></div>
                    <OrderStatus order={order} overdue={result.overdueIds.has(order.id)} />
                  </div>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div className="min-w-0"><dt className="text-xs text-gray-400">Order value</dt><dd className="mt-1 break-words font-semibold text-indigo-300">{formatMoney(order.amount)}</dd></div>
                    <div className="min-w-0 text-right"><dt className="text-xs text-gray-400">Due date</dt><dd className="mt-1 text-gray-200">{formatDueDate(order.dueDate)}</dd></div>
                  </dl>
                  <div className="border-t border-gray-700 pt-3"><OrderActions order={order} /></div>
                </article>
              </li>)}
            </ul>
            <div className="orders-table-view hidden overflow-x-auto">
              <table className="w-full table-fixed text-left text-sm">
                <colgroup><col /><col /><col className="w-28" /><col className="w-36" /><col className="w-28" /><col className="w-28" /></colgroup>
                <caption className="sr-only">Customer orders, newest first</caption>
                <thead><tr>{["Customer", "Outfit", "Status", "Order value", "Due date", "Actions"].map((label) => <th key={label} scope="col" className={`border-b border-gray-800 px-2 py-3 text-xs font-semibold text-gray-300 ${label === "Order value" ? "text-right" : ""}`}>{label}</th>)}</tr></thead>
                <tbody>{result.orders.map((order) => <tr key={order.id} className="border-b border-gray-800 hover:bg-gray-800/40">
                  <td className="break-words px-2 py-4 font-medium text-gray-100">{order.clientName || "Customer"}</td>
                  <td className="break-words px-2 py-4 text-gray-300">{order.outfitType || "Order"}</td>
                  <td className="px-2 py-4"><OrderStatus order={order} overdue={result.overdueIds.has(order.id)} /></td>
                  <td className="px-2 py-4 text-right font-semibold tabular-nums text-indigo-300">{formatMoney(order.amount)}</td>
                  <td className="px-2 py-4 text-gray-300">{formatDueDate(order.dueDate)}</td>
                  <td className="px-2 py-4"><OrderActions order={order} compact /></td>
                </tr>)}</tbody>
              </table>
            </div>
          </>}
    </section>
    <Link to="/calendar" className={`${actionClass} text-indigo-300 hover:bg-indigo-500/10`}>View delivery calendar <ArrowRight aria-hidden="true" size={16} /></Link>
  </div>;
}
