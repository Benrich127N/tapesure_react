import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Eye, Plus, Ruler, Search } from "lucide-react";
import useShopCollection from "../hooks/useShopCollection";
import { MeasurementValues } from "../components/MeasurementFields";
import { filterMeasurements, hasMeasurements, latestMeasurements, measurementDate, measurementDateLabel, measurementDraft, measurementEntries, measurementsCSV } from "../utils/measurements";
import "./Measurements.css";

function Preview({ record }) {
  const items = measurementEntries(record.measurements).flatMap(group => group.values);
  return <div className="min-w-0"><dl className="measurement-values-grid">{items.slice(0,4).map(item => <div key={item.label} className="min-w-0"><dt className="text-xs text-gray-300">{item.label}</dt><dd className="mt-1 break-words text-sm font-semibold tabular-nums text-white">{item.value} in</dd></div>)}</dl><details className="mt-3"><summary className="measurement-summary cursor-pointer rounded-lg text-sm font-medium text-indigo-200">All measurements ({items.length})</summary><div className="mt-3"><MeasurementValues measurements={record.measurements}/></div></details></div>;
}
export default function Measurements() {
  const navigate = useNavigate();
  const { data: outfits, loading, error, retry } = useShopCollection("outfits");
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("all");
  const [exportNotice, setExportNotice] = useState("");
  const [exportError, setExportError] = useState("");
  const clients = latestMeasurements(outfits);
  const results = filterMeasurements(clients, search, gender);
  const now = new Date();
  const month = outfits.filter(record => { const date = measurementDate(record); return hasMeasurements(record.measurements) && date?.getMonth() === now.getMonth() && date?.getFullYear() === now.getFullYear(); }).length;
  const active = search.trim() || gender !== "all";
  const reset = () => { setSearch(""); setGender("all"); setExportNotice(""); };
  const exportCSV = () => {
    if (loading || error || !results.length) return;
    setExportError("");
    try {
      const blob = new Blob([measurementsCSV(results)], { type:"text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url; link.download = `measurements-${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}.csv`;
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setExportNotice(`CSV prepared with ${results.length} measurement ${results.length === 1 ? "record" : "records"}.`);
    } catch { setExportError("Could not prepare your CSV. Please try again."); }
  };
  const view = record => <button onClick={() => navigate(`/outfits/${record.id}`)} aria-label={`View measurements for ${record.clientName || "customer"}, ${record.outfitType || "order"}`} className="measurement-button bg-gray-800 text-white hover:bg-gray-700"><Eye aria-hidden="true" size={18}/>View order</button>;
  return <section className="measurements-page space-y-5" aria-labelledby="measurements-title">
    <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><h1 id="measurements-title" className="flex items-center gap-2 text-2xl font-bold text-white sm:text-3xl"><Ruler aria-hidden="true" className="shrink-0 text-indigo-300" size={24}/>Measurements Library</h1><p className="mt-1 text-sm text-gray-300">Latest measured order per customer. All measurements are in inches.</p></div><button disabled={loading || error || !results.length} onClick={exportCSV} className="measurement-button shrink-0 bg-green-700 text-white hover:bg-green-600 disabled:bg-gray-800 disabled:text-gray-400"><Download aria-hidden="true" size={18}/>Export results{!loading && !error && ` (${results.length})`}</button></header>
    <div className="measurement-stats" aria-label="Full library totals" aria-busy={loading}>{[["Customers",clients.length],["Male",clients.filter(record=>measurementDraft(record.measurements).clientGender==="male").length],["Female",clients.filter(record=>measurementDraft(record.measurements).clientGender==="female").length],["Records this month",month]].map(([label,count])=><div key={label} className="min-w-0 flex items-center justify-between gap-2 rounded-xl border border-gray-800 bg-gray-900 p-3 sm:p-4"><p className="text-xs text-gray-300 sm:text-sm">{label}</p><p className="text-xl font-bold tabular-nums text-white sm:text-2xl">{loading || error ? "—" : count}</p></div>)}</div>
    <div className="space-y-3 rounded-xl border border-gray-800 bg-gray-900 p-4"><label htmlFor="measurement-search" className="block text-sm font-medium text-white">Search measurements</label><div className="relative"><Search aria-hidden="true" size={20} className="absolute left-3 top-3 text-gray-400"/><input id="measurement-search" type="search" value={search} onChange={event=>{setSearch(event.target.value);setExportNotice("");}} placeholder="Customer name or latest outfit" className="measurement-input pl-10"/></div><div role="group" aria-label="Filter by customer gender" className="flex flex-wrap gap-2">{[["all","All"],["male","Male"],["female","Female"],["other","Other"]].map(([value,label])=><button key={value} onClick={()=>{setGender(value);setExportNotice("");}} aria-label={value === "other" ? "Other or not specified" : undefined} aria-pressed={gender===value} className={`measurement-button text-sm ${gender===value ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-200 hover:bg-gray-700"}`}>{label}</button>)}</div><div className="flex flex-wrap items-center justify-between gap-2"><p role="status" className="text-sm text-gray-300">{loading ? "Loading measurements…" : error ? "Measurements unavailable" : `${results.length} of ${clients.length} customers shown`}</p>{active && <button onClick={reset} className="measurement-button text-indigo-200 underline">Reset filters</button>}</div><p className="text-xs text-gray-300">Totals cover the full library. Export includes shown customers.</p></div>
    {exportNotice && <p role="status" className="text-sm text-green-200">{exportNotice}</p>}{exportError && <p role="alert" className="text-sm text-red-200">{exportError}</p>}
    {loading && <p role="status" className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center text-gray-300">Loading measurements…</p>}
    {error && <div role="alert" className="space-y-3 rounded-xl border border-red-800 bg-gray-900 p-5 text-gray-200"><h2 className="font-semibold">Could not load measurements</h2><p className="text-sm">Check your connection and try again.</p><button onClick={retry} className="measurement-button bg-indigo-600 text-white">Retry</button></div>}
    {!loading && !error && !results.length && <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center"><Ruler aria-hidden="true" className="mx-auto mb-3 text-indigo-300" size={32}/><h2 className="text-lg font-semibold text-white">{active ? "No matching measurements" : "No measurements yet"}</h2><p className="my-3 text-sm text-gray-300">{active ? "Try a different search or reset your filters." : "Add measurements when creating an order to start your library."}</p><button onClick={active ? reset : ()=>navigate("/outfits/new")} className="measurement-button mx-auto bg-indigo-600 text-white">{active ? "Reset filters" : <><Plus aria-hidden="true" size={18}/>Add measurements</>}</button></div>}
    {!loading && !error && results.length>0 && <><div className="measurement-cards">{results.map(record=><article key={record.id} className="min-w-0 space-y-4 rounded-xl border border-gray-800 bg-gray-900 p-4"><header className="break-words"><h2 className="font-semibold text-white">{record.clientName || "Customer not specified"}</h2><p className="mt-1 text-sm text-gray-300">{record.outfitType || "Order"}</p><p className="mt-2 text-xs capitalize text-gray-300">{measurementDraft(record.measurements).clientGender || "Gender not specified"} · {measurementDateLabel(record)}</p></header><Preview record={record}/>{view(record)}</article>)}</div>
    <div className="measurement-table rounded-xl border border-gray-800 bg-gray-900"><table className="w-full table-fixed text-left text-sm"><caption className="sr-only">Latest measurements per customer, in inches</caption><colgroup><col style={{width:"23%"}}/><col style={{width:"21%"}}/><col style={{width:"40%"}}/><col style={{width:"16%"}}/></colgroup><thead className="border-b border-gray-700 text-gray-300"><tr>{["Customer","Latest measured order","Measurements · inches","Actions"].map(label=><th scope="col" key={label} className="p-4 font-medium">{label}</th>)}</tr></thead><tbody>{results.map(record=><tr key={record.id} className="border-b border-gray-800 last:border-0"><th scope="row" className="break-words p-4 align-top font-medium text-white">{record.clientName || "Customer not specified"}<span className="mt-2 block text-xs font-normal capitalize text-gray-300">{measurementDraft(record.measurements).clientGender || "Gender not specified"}</span></th><td className="break-words p-4 align-top text-gray-200"><p>{record.outfitType || "Order"}</p><p className="mt-2 text-xs text-gray-300">{measurementDateLabel(record)}</p></td><td className="p-4 align-top"><Preview record={record}/></td><td className="p-3 align-top">{view(record)}</td></tr>)}</tbody></table></div></>}
  </section>;
}
