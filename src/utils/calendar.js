import { isActiveOrder, summarizeDashboard } from "./dashboard.js";

export const scheduleFilters = [
  { value: "all", label: "All deliveries" },
  { value: "active", label: "Active" },
  { value: "overdue", label: "Overdue" },
  { value: "ready", label: "Ready" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export function dateKey(value) {
  if (typeof value === "string") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const parsed = new Date(`${value}T00:00:00`);
    return !Number.isNaN(parsed.getTime()) && dateKey(parsed) === value ? value : null;
  }
  const date = value?.toDate ? value.toDate() : value;
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function monthKey(value) {
  return `${dateKey(value).slice(0, 7)}-01`;
}

export function shiftMonth(value, offset) {
  const date = new Date(`${monthKey(value)}T00:00:00`);
  date.setMonth(date.getMonth() + offset);
  return dateKey(date);
}

export function selectSchedule(records, month, filter = "all", now = new Date()) {
  const overdueIds = new Set(summarizeDashboard(records, [], now).overdue.map((order) => order.id));
  const matches = records.filter((order) => {
    if (filter === "cancelled") return order.status === "Cancelled";
    if (order.status === "Cancelled") return false;
    if (filter === "active") return isActiveOrder(order);
    if (filter === "overdue") return overdueIds.has(order.id);
    if (filter === "ready") return order.status === "Ready";
    if (filter === "delivered") return order.status === "Delivered";
    return true;
  });
  const dated = matches.map((order) => ({ ...order, date: dateKey(order.dueDate), overdue: overdueIds.has(order.id) }));
  const scheduled = dated.filter((order) => order.date).sort((a, b) => a.date.localeCompare(b.date) || String(a.clientName || "").localeCompare(String(b.clientName || "")) || a.id.localeCompare(b.id));
  const inMonth = scheduled.filter((order) => order.date.slice(0, 7) === month.slice(0, 7));
  const groups = [];
  for (const order of inMonth) {
    let group = groups.at(-1);
    if (group?.date !== order.date) {
      group = { date: order.date, orders: [] };
      groups.push(group);
    }
    group.orders.push(order);
  }
  return { scheduled, inMonth, groups, unscheduled: dated.filter((order) => !order.date), overdueCount: inMonth.filter((order) => order.overdue).length };
}

export function scheduleAppearance(order) {
  const status = order.status || "Received";
  if (order.overdue || status === "Delayed") return { label: order.overdue ? `Overdue · ${status}` : status, background: "#450a0a", color: "#fecaca", border: "#b91c1c" };
  if (status === "Delivered") return { label: status, background: "#052e16", color: "#bbf7d0", border: "#15803d" };
  if (status === "Ready") return { label: status, background: "#1e1b4b", color: "#c7d2fe", border: "#6366f1" };
  if (["Pending", "Cancelled"].includes(status)) return { label: status, background: "#1f2937", color: "#e5e7eb", border: "#6b7280" };
  return { label: status, background: "#422006", color: "#fef08a", border: "#a16207" };
}
