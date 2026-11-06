import { isActiveOrder, newestFirst } from "./dashboard.js";

export function customerDate(value) {
  if (value == null || value === "") return null;
  const date = value?.toDate ? value.toDate() : value?.seconds != null ? new Date(value.seconds * 1000) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function joinedDate(value) {
  return customerDate(value)?.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) || "Date unavailable";
}

export function addedThisMonth(customers, now = new Date()) {
  return customers.filter((customer) => {
    const date = customerDate(customer.createdAt);
    return date && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;
}

const normalizeName = (value) => String(value || "").trim().replace(/\s+/g, " ").toLocaleLowerCase();
export function ordersForCustomer(customer, orders) {
  return newestFirst(orders.filter((order) => order.clientId
    ? order.clientId === customer.id
    : !!normalizeName(customer.name) && normalizeName(order.clientName) === normalizeName(customer.name)));
}

export function customerOrderSummary(customer, orders) {
  const matching = ordersForCustomer(customer, orders);
  const active = matching.filter(isActiveOrder).length;
  return {
    orders: matching,
    total: matching.length,
    active,
    delivered: matching.filter((order) => order.status === "Delivered").length,
    value: matching.filter((order) => order.status !== "Cancelled").reduce((sum, order) => sum + (Number.isFinite(Number(order.amount)) ? Number(order.amount) : 0), 0),
  };
}

export function searchCustomers(customers, query = "") {
  const term = query.trim().toLocaleLowerCase();
  const digits = term.replace(/\D/g, "");
  const phoneQuery = !!digits && /^[\d+\s().-]+$/.test(term);
  return newestFirst(customers).filter((customer) => !term
    || [customer.name, customer.phone, customer.email].some((value) => String(value || "").toLocaleLowerCase().includes(term))
    || (phoneQuery && String(customer.phone || "").replace(/\D/g, "").includes(digits)));
}

export function customerInitials(name) {
  return String(name || "?").trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase() || "?";
}

export function phoneHref(phone) {
  const normalized = String(phone || "").replace(/[^\d+]/g, "");
  return /\d/.test(normalized) ? `tel:${normalized}` : null;
}

export function customerFormError(form) {
  if (!form.name.trim()) return "Enter the customer’s name.";
  if (!form.phone.trim()) return "Enter the customer’s phone number.";
  return "";
}
