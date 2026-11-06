import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import CustomerFields from "./CustomerFields";

export default function AddCustomerDialog({ onClose, onSubmit, form, onChange, saving, error }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = dialogRef.current;
    dialog.showModal();
    dialog.querySelector('input[name="name"]')?.focus();
    return () => {
      dialog.close();
      const target = previous?.isConnected && !previous.disabled ? previous : document.getElementById("customer-search");
      target?.focus();
    };
  }, []);

  const keepFocusInside = (event) => {
    if (event.key !== "Tab") return;
    const controls = [...event.currentTarget.querySelectorAll("button:not(:disabled), input:not(:disabled)")].filter((element) => element.getClientRects().length);
    const first = controls[0];
    const last = controls.at(-1);
    if (!first) { event.preventDefault(); return; }
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  const close = () => dialogRef.current?.close();
  return createPortal(<dialog ref={dialogRef} aria-labelledby="add-customer-heading" aria-describedby="add-customer-description" onKeyDown={keepFocusInside} onClose={(event) => { if (!event.currentTarget.open) onClose(); }} className="customer-dialog rounded-xl border border-gray-700 bg-gray-900 p-0 text-gray-100 shadow-2xl">
    <form onSubmit={onSubmit} aria-busy={saving} className="customer-dialog-form flex flex-col">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-700 p-4">
        <h2 id="add-customer-heading" className="text-lg font-bold text-white">Add customer</h2>
        <button type="button" aria-label="Close add customer" onClick={close} className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-gray-300 hover:bg-gray-800"><X aria-hidden="true" size={20} /></button>
      </header>
      <div className="min-h-0 overflow-y-auto p-4 sm:p-6">
        <p id="add-customer-description" className="mb-4 text-sm text-gray-300">Save contact details now. Measurements can be added with an order.</p>
        <CustomerFields prefix="add-customer" value={form} onChange={onChange} disabled={saving} />
        {error && <p role="alert" className="mt-4 rounded-lg border border-red-800 bg-red-900/20 p-3 text-sm text-red-200">{error}</p>}
      </div>
      <footer className="flex shrink-0 gap-3 border-t border-gray-700 p-4">
        <button type="button" onClick={close} className="min-h-11 flex-1 rounded-lg border border-gray-600 px-3 text-sm font-semibold text-gray-200 hover:bg-gray-800">{saving ? "Close" : "Cancel"}</button>
        <button type="submit" disabled={saving} className="min-h-11 flex-1 rounded-lg bg-indigo-600 px-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60">{saving ? "Adding customer…" : "Add customer"}</button>
      </footer>
    </form>
  </dialog>, document.body);
}
