import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { invoiceMoney } from "../utils/invoices";

export default function RecordPaymentDialog({ amount, method, balance, saving, error, onAmount, onMethod, onSubmit, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current;
    dialog.showModal();
    dialog.querySelector("input")?.focus();
    return () => { dialog.close(); const target = previous?.isConnected && !previous.disabled ? previous : document.getElementById("invoice-details-title"); target?.focus(); };
  }, []);
  const trap = event => {
    if (event.key !== "Tab") return;
    const controls = [...event.currentTarget.querySelectorAll("button:not(:disabled), input:not(:disabled), select:not(:disabled)")];
    if (!controls.length) { event.preventDefault(); return; }
    if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls.at(-1).focus(); }
    else if (!event.shiftKey && document.activeElement === controls.at(-1)) { event.preventDefault(); controls[0].focus(); }
  };
  return createPortal(<dialog ref={ref} aria-labelledby="payment-title" aria-describedby="payment-description" onKeyDown={trap} onClose={onClose} className="payment-dialog rounded-xl border border-gray-700 bg-gray-900 p-5 text-gray-100 shadow-2xl">
    <form onSubmit={onSubmit} aria-busy={saving} className="space-y-4">
      <h2 id="payment-title" className="text-xl font-bold">Record Payment</h2>
      <p id="payment-description" className="text-sm text-gray-300">Balance due: {invoiceMoney(balance)}</p>
      <div><label htmlFor="payment-amount" className="mb-2 block text-sm font-medium">Payment amount (NGN)</label><input id="payment-amount" type="number" inputMode="decimal" required min="0.01" max={balance} step="0.01" value={amount} disabled={saving} onChange={event => onAmount(event.target.value)} aria-describedby={error ? "payment-error" : "payment-description"} className="min-h-11 w-full rounded-lg border border-gray-600 bg-gray-800 px-3 text-base" /></div>
      <div><label htmlFor="payment-method" className="mb-2 block text-sm font-medium">Payment method</label><select id="payment-method" value={method} disabled={saving} onChange={event => onMethod(event.target.value)} className="min-h-11 w-full rounded-lg border border-gray-600 bg-gray-800 px-3 text-base">{["Cash", "Bank Transfer", "Card", "Mobile Money", "Other"].map(value => <option key={value}>{value}</option>)}</select></div>
      {error && <p id="payment-error" role="alert" className="rounded-lg border border-red-800 bg-red-900/20 p-3 text-sm text-red-200">{error}</p>}
      <div className="flex gap-3"><button type="button" onClick={() => ref.current.close()} className="min-h-11 flex-1 rounded-lg bg-gray-800 px-3">{saving ? "Close" : "Cancel"}</button><button type="submit" disabled={saving} className="min-h-11 flex-1 rounded-lg bg-green-700 px-3 font-semibold hover:bg-green-600 disabled:opacity-60">{saving ? "Recording…" : "Confirm payment"}</button></div>
    </form>
  </dialog>, document.body);
}
