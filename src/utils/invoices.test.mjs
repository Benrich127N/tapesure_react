import test from "node:test";
import assert from "node:assert/strict";
import { invoiceAmounts, invoiceMoney, invoicePaymentStatus, isInvoiceOverdue, matchesInvoice, paymentUpdate } from "./invoices.js";

const invoice = { invoiceNumber: "INV-123", clientName: "Ada Okonkwo", outfitType: "Wedding suit", totalAmount: 100.30, amountPaid: 10.10, dueDate: "2026-11-05", status: "Partial" };
const now = new Date(2026, 10, 6, 12);
test("overdue is independent of partial payment and remains searchable in both filters", () => {
  assert.equal(invoicePaymentStatus(invoice), "Partial");
  assert.equal(isInvoiceOverdue(invoice, now), true);
  assert.equal(matchesInvoice(invoice, "  ADA  ", "Overdue", now), true);
  assert.equal(matchesInvoice(invoice, "suit", "Partial", now), true);
  assert.equal(matchesInvoice(invoice, "missing", "All", now), false);
});
test("due today is not overdue, including at the end of the local day", () => {
  assert.equal(isInvoiceOverdue(invoice, new Date(2026, 10, 5, 23, 59)), false);
  assert.equal(isInvoiceOverdue(invoice, new Date(2026, 10, 6, 0, 0)), true);
});
test("invalid and missing due dates and fully paid invoices are not overdue", () => {
  for (const dueDate of [undefined, "", "2026-02-30", "invalid"]) assert.equal(isInvoiceOverdue({ ...invoice, dueDate }, now), false);
  assert.equal(isInvoiceOverdue({ ...invoice, amountPaid: 100.30 }, now), false);
  assert.equal(invoicePaymentStatus({ ...invoice, amountPaid: 100.30, status: "Overdue" }), "Paid");
});
test("stored overdue status does not hide unpaid debt from its payment filter", () => {
  const unpaid = { ...invoice, status: "Overdue", amountPaid: 0 };
  assert.equal(matchesInvoice(unpaid, "", "Unpaid", now), true);
  assert.equal(matchesInvoice(unpaid, "", "Overdue", now), true);
});
test("amounts and payment calculations use cents and the actual remaining debt", () => {
  assert.deepEqual(invoiceAmounts(invoice), { total: 100.30, paid: 10.10, balance: 90.20 });
  assert.deepEqual(paymentUpdate(invoice, "90.20"), { amountPaid: 100.30, balance: 0, status: "Paid" });
  assert.deepEqual(paymentUpdate(invoice, "0.10"), { amountPaid: 10.20, balance: 90.10, status: "Partial" });
  assert.equal(isInvoiceOverdue({ ...invoice, ...paymentUpdate(invoice, "0.10") }, now), true);
});
test("rejects overpayment, non-finite, zero, negative, and sub-cent payments", () => {
  for (const value of ["", "bad", Infinity, "0", "-1", "90.21", "1.001"]) assert.throws(() => paymentUpdate(invoice, value));
  assert.throws(() => paymentUpdate({ ...invoice, amountPaid: 100.30 }, "0.01"));
});
test("currency always includes two fractional digits", () => {
  assert.match(invoiceMoney(12345678.5), /12,345,678\.50/);
  assert.match(invoiceMoney(0), /0\.00/);
});

test("invalid stored money cannot make summary totals infinite or negative", () => {
  assert.deepEqual(invoiceAmounts({ totalAmount: Infinity, amountPaid: "bad" }), { total: 0, paid: 0, balance: 0 });
  assert.deepEqual(invoiceAmounts({ totalAmount: -10, amountPaid: -5 }), { total: 0, paid: 0, balance: 0 });
});
