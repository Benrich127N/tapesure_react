const finite = value => Number.isFinite(Number(value)) ? Number(value) : 0;
export const invoiceMoney = (value) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(finite(value));

export function invoiceAmounts(invoice) {
  const total = Math.max(0, finite(invoice.totalAmount));
  const paid = Math.max(0, finite(invoice.amountPaid));
  return { total, paid, balance: Math.max(0, Math.round((total - paid) * 100) / 100) };
}

export function invoicePaymentStatus(invoice) {
  const { paid, balance } = invoiceAmounts(invoice);
  if (balance === 0) return "Paid";
  if (paid > 0) return "Partial";
  return invoice.status === "Pending" ? "Pending" : "Unpaid";
}

export function isInvoiceOverdue(invoice, now = new Date()) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(invoice.dueDate || "");
  if (!match || invoiceAmounts(invoice).balance <= 0) return false;
  const [, year, month, day] = match.map(Number);
  const due = new Date(year, month - 1, day);
  if (due.getFullYear() !== year || due.getMonth() !== month - 1 || due.getDate() !== day) return false;
  return due < new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function matchesInvoice(invoice, search, status, now) {
  const term = search.trim().toLocaleLowerCase();
  return [invoice.invoiceNumber, invoice.clientName, invoice.outfitType].some(value => String(value || "").toLocaleLowerCase().includes(term)) &&
    (status === "All" || (status === "Overdue" ? isInvoiceOverdue(invoice, now) : invoicePaymentStatus(invoice) === status));
}

export function paymentUpdate(invoice, amount) {
  const cents = Math.round(Number(amount) * 100);
  const { total, paid, balance } = invoiceAmounts(invoice);
  if (!Number.isFinite(Number(amount)) || cents <= 0 || Math.abs(Number(amount) * 100 - cents) > 0.00001) throw new Error("Enter a payment greater than zero with up to two decimal places.");
  if (cents > Math.round(balance * 100)) throw new Error("Payment cannot exceed the outstanding balance.");
  const amountPaid = (Math.round(paid * 100) + cents) / 100;
  const remaining = Math.max(0, (Math.round(total * 100) - Math.round(amountPaid * 100)) / 100);
  return { amountPaid, balance: remaining, status: remaining === 0 ? "Paid" : "Partial" };
}
